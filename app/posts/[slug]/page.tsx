'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getPostBySlug, deletePost } from '@/lib/storage'
import { useAuth } from '@/components/auth-provider'
import type { Post } from '@/lib/types'
import { Calendar, User, ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export default function PostPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const slug = params.slug as string
    const foundPost = getPostBySlug(slug)
    setPost(foundPost)
    setIsLoading(false)
  }, [params.slug])

  const handleDelete = () => {
    if (!post) return
    const success = deletePost(post.id)
    if (success) {
      toast.success('Статтю видалено')
      router.push('/')
    } else {
      toast.error('Помилка при видаленні')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const canManage = user && post && (user.role === 'admin' || user.id === post.authorId)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="mx-auto max-w-3xl px-4 py-12">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-10 w-3/4 rounded bg-muted" />
            <div className="h-4 w-1/2 rounded bg-muted" />
            <div className="mt-8 space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 w-full rounded bg-muted" />
              ))}
            </div>
          </div>
        ) : !post ? (
          <div className="text-center py-12">
            <h1 className="mb-4 text-2xl font-bold">Статтю не знайдено</h1>
            <p className="mb-8 text-muted-foreground">На жаль, ця стаття не існує або була видалена.</p>
            <Button asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Повернутися на головну
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <Button variant="ghost" asChild>
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Назад до статей
                </Link>
              </Button>

              {canManage && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/posts/${post.id}`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Редагувати
                    </Link>
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive hover:text-destructive-foreground">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Видалити
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Видалити статтю?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Ця дія незворотна. Стаття "{post.title}" буде повністю видалена.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Скасувати</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Видалити
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>

            <article>
              <header className="mb-8">
                <h1 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
                  {post.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {post.authorName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(post.createdAt)}
                  </span>
                  {post.status === 'draft' && (
                    <Badge variant="secondary">Чернетка</Badge>
                  )}
                </div>

                {post.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {post.coverImage && (
                  <div className="mt-6 overflow-hidden rounded-lg">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full object-cover"
                    />
                  </div>
                )}
              </header>

              <div 
                className="prose prose-neutral max-w-none dark:prose-invert prose-headings:font-semibold prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </article>
          </>
        )}
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-muted-foreground">
          <p>Блог-платформа. Усі права захищено.</p>
        </div>
      </footer>
    </div>
  )
}
