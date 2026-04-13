'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { getPostById, updatePost, generateSlug } from '@/lib/storage'
import type { Post } from '@/lib/types'
import { toast } from 'sonner'
import { FileUpload } from '@/components/file-upload'
import { ArrowLeft, X, ExternalLink } from 'lucide-react'

export default function EditPostPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const id = params.id as string
    const foundPost = getPostById(id)
    if (foundPost) {
      setPost(foundPost)
      setTitle(foundPost.title)
      setContent(foundPost.content.replace(/<\/?p>/g, '\n').replace(/\n+/g, '\n\n').trim())
      setExcerpt(foundPost.excerpt)
      setCoverImage(foundPost.coverImage || null)
      setTags(foundPost.tags)
      setIsPublished(foundPost.status === 'published')
    }
  }, [params.id])

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()])
      }
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !post) {
      toast.error('Помилка')
      return
    }

    if (!title.trim()) {
      toast.error('Введіть назву статті')
      return
    }

    if (!content.trim()) {
      toast.error('Введіть текст статті')
      return
    }

    setIsLoading(true)

    try {
      const htmlContent = content
        .split('\n\n')
        .map((p) => `<p>${p.trim()}</p>`)
        .filter((p) => p !== '<p></p>')
        .join('')

      updatePost(post.id, {
        title: title.trim(),
        slug: post.slug,
        content: htmlContent,
        excerpt: excerpt.trim() || content.slice(0, 150) + '...',
        coverImage: coverImage || undefined,
        status: isPublished ? 'published' : 'draft',
        tags,
      })

      toast.success('Статтю оновлено!')
      router.push('/dashboard/posts')
    } catch (error) {
      toast.error('Помилка при збереженні')
    } finally {
      setIsLoading(false)
    }
  }

  if (!post) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const canEdit = user?.role === 'admin' || post.authorId === user?.id

  if (!canEdit) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Доступ заборонено</h1>
        <p className="text-muted-foreground">Ви не можете редагувати цю статтю</p>
        <Button asChild>
          <Link href="/dashboard/posts">Назад до статей</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/posts">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Редагувати статтю</h1>
            <p className="text-muted-foreground">Внесіть зміни та збережіть</p>
          </div>
        </div>
        {post.status === 'published' && (
          <Button variant="outline" asChild>
            <Link href={`/posts/${post.slug}`} target="_blank">
              <ExternalLink className="mr-2 h-4 w-4" />
              Переглянути
            </Link>
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Основна інформація</CardTitle>
            <CardDescription>Заповніть заголовок та текст статті</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Назва статті *
              </label>
              <Input
                id="title"
                placeholder="Введіть назву статті"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="excerpt" className="text-sm font-medium">
                Короткий опис
              </label>
              <Textarea
                id="excerpt"
                placeholder="Короткий опис статті для попереднього перегляду"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">
                Текст статті *
              </label>
              <Textarea
                id="content"
                placeholder="Напишіть текст статті"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                required
              />
              <p className="text-xs text-muted-foreground">
                Порада: розділяйте абзаци порожнім рядком
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Обкладинка</CardTitle>
            <CardDescription>Додайте зображення для обкладинки статті</CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload
              onUpload={(file, dataUrl) => setCoverImage(dataUrl)}
              onRemove={() => setCoverImage(null)}
              preview={coverImage}
              accept="image/*"
              maxSize={5}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Теги</CardTitle>
            <CardDescription>Додайте теги для кращого пошуку</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Введіть тег і натисніть Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
              />
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Публікація</CardTitle>
            <CardDescription>Налаштування публікації статті</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Опублікувати</p>
                <p className="text-sm text-muted-foreground">
                  {isPublished ? 'Стаття доступна для читачів' : 'Стаття збережена як чернетка'}
                </p>
              </div>
              <Switch checked={isPublished} onCheckedChange={setIsPublished} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Збереження...' : 'Зберегти зміни'}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/posts">Скасувати</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
