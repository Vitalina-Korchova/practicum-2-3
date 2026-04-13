'use client'

import { useActionState, useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { createPost } from '@/lib/storage'
import { createPostAction, type PostFormState } from '@/app/actions/posts'
import { toast } from 'sonner'
import { FileUpload } from '@/components/file-upload'
import { ArrowLeft, X } from 'lucide-react'

const initialState: PostFormState = {
  success: false,
}

export default function NewPostPage() {
  const router = useRouter()
  const { user } = useAuth()
  const formRef = useRef<HTMLFormElement>(null)
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isPublished, setIsPublished] = useState(false)

  const [state, formAction, isPending] = useActionState(createPostAction, initialState)

  useEffect(() => {
    if (state.success && state.data) {
      // Server validated the form, now save to localStorage
      createPost({
        title: state.data.title,
        slug: state.data.slug,
        content: state.data.content,
        excerpt: state.data.excerpt,
        coverImage: state.data.coverImage,
        authorId: state.data.authorId,
        authorName: state.data.authorName,
        status: state.data.status,
        tags: state.data.tags,
      })

      toast.success(state.data.status === 'published' ? 'Статтю опубліковано!' : 'Чернетку збережено!')
      router.push('/dashboard/posts')
    }
  }, [state, router])

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

  if (!user) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Ви не авторизовані</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/posts">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Нова стаття</h1>
          <p className="text-muted-foreground">Створіть нову публікацію</p>
        </div>
      </div>

      <form ref={formRef} action={formAction} className="space-y-6">
        {/* Hidden fields for Server Action */}
        <input type="hidden" name="authorId" value={user.id} />
        <input type="hidden" name="authorName" value={user.name} />
        <input type="hidden" name="tags" value={JSON.stringify(tags)} />
        <input type="hidden" name="status" value={isPublished ? 'published' : 'draft'} />
        <input type="hidden" name="coverImage" value={coverImage || ''} />

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
                name="title"
                placeholder="Введіть назву статті"
                required
              />
              {state.errors?.title && (
                <p className="text-sm text-destructive">{state.errors.title[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="excerpt" className="text-sm font-medium">
                Короткий опис
              </label>
              <Textarea
                id="excerpt"
                name="excerpt"
                placeholder="Короткий опис статті для попереднього перегляду"
                rows={2}
              />
              {state.errors?.excerpt && (
                <p className="text-sm text-destructive">{state.errors.excerpt[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">
                Текст статті *
              </label>
              <Textarea
                id="content"
                name="content"
                placeholder="Напишіть текст статті. Кожен абзац відділяйте порожнім рядком."
                rows={12}
                required
              />
              {state.errors?.content && (
                <p className="text-sm text-destructive">{state.errors.content[0]}</p>
              )}
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
              {state.errors?.tags && (
                <p className="text-sm text-destructive">{state.errors.tags[0]}</p>
              )}
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
                <p className="font-medium">Опублікувати одразу</p>
                <p className="text-sm text-muted-foreground">
                  Стаття буде доступна для читачів
                </p>
              </div>
              <Switch checked={isPublished} onCheckedChange={setIsPublished} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Збереження...' : isPublished ? 'Опублікувати' : 'Зберегти чернетку'}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/posts">Скасувати</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
