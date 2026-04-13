'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getPublishedPosts, deletePost } from '@/lib/storage'
import { useAuth } from '@/components/auth-provider'
import type { Post } from '@/lib/types'
import { Calendar, User, ArrowRight, Plus, Trash2 } from 'lucide-react'
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

export default function HomePage() {
  const { user, isAuthenticated } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = () => {
    setPosts(getPublishedPosts())
    setIsLoading(false)
  }

  const handleDelete = (id: string) => {
    const success = deletePost(id)
    if (success) {
      toast.success('Статтю видалено')
      loadPosts()
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

  const canCreate = user && (user.role === 'admin' || user.role === 'author')

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="mx-auto max-w-5xl px-4 py-12">
        <section className="mb-16 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl text-balance">
            Ласкаво просимо до Блогу
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground text-pretty">
            Читайте цікаві статті, діліться думками та створюйте власні публікації. Приєднуйтесь до нашої спільноти авторів.
          </p>
          {canCreate ? (
            <Button size="lg" asChild className="rounded-full px-8">
              <Link href="/dashboard/posts/new">
                <Plus className="mr-2 h-5 w-5" />
                Створити статтю
              </Link>
            </Button>
          ) : !isAuthenticated && (
            <Button size="lg" asChild className="rounded-full px-8">
              <Link href="/register">Стати автором</Link>
            </Button>
          )}
        </section>

        <section>
          <h2 className="mb-8 text-2xl font-semibold text-foreground">Останні публікації</h2>
          
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 w-3/4 rounded bg-muted" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 w-full rounded bg-muted" />
                      <div className="h-4 w-2/3 rounded bg-muted" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Поки що немає публікацій</p>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {posts.map((post) => {
                const canManage = user && (user.role === 'admin' || user.id === post.authorId)
                return (
                  <div key={post.id} className="relative group">
                    <Link href={`/posts/${post.slug}`}>
                      <Card className="h-full overflow-hidden transition-all hover:border-foreground/20 hover:shadow-md">
                        {post.coverImage && (
                          <div className="aspect-video overflow-hidden">
                            <img
                              src={post.coverImage}
                              alt={post.title}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                          </div>
                        )}
                        <CardHeader>
                          <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground line-clamp-3">{post.excerpt}</p>
                        </CardContent>
                        <CardFooter className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {post.authorName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(post.createdAt)}
                            </span>
                          </div>
                          {post.tags.length > 0 && (
                            <div className="flex gap-1">
                              {post.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardFooter>
                      </Card>
                    </Link>
                    
                    {canManage && (
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="destructive" 
                              size="icon" 
                              className="h-8 w-8 rounded-full shadow-lg"
                              onClick={(e) => e.preventDefault()}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Видалити статтю?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Ви впевнені, що хочете видалити "{post.title}"? Ця дія незворотна.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Скасувати</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDelete(post.id)
                                }}
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
                )
              })}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-muted-foreground">
          <p>Блог-платформа. Усі права захищено.</p>
        </div>
      </footer>
    </div>
  )
}
