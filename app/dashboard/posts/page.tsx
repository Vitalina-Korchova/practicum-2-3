'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { getPosts, getUserPosts, deletePost } from '@/lib/storage'
import type { Post } from '@/lib/types'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Eye, ExternalLink } from 'lucide-react'

export default function PostsPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    loadPosts()
  }, [user])

  const loadPosts = () => {
    if (!user) return
    const allPosts = user.role === 'admin' ? getPosts() : getUserPosts(user.id)
    setPosts(allPosts)
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
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Статті</h1>
          <p className="text-muted-foreground">
            {user?.role === 'admin' ? 'Усі статті блогу' : 'Ваші статті'}
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/posts/new">
            <Plus className="mr-2 h-4 w-4" />
            Нова стаття
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список статей</CardTitle>
          <CardDescription>
            Всього: {posts.length} | Опубліковано: {posts.filter((p) => p.status === 'published').length} | Чернетки: {posts.filter((p) => p.status === 'draft').length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">У вас ще немає статей</p>
              <Button asChild>
                <Link href="/dashboard/posts/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Створити першу статтю
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Назва</TableHead>
                  {user?.role === 'admin' && <TableHead>Автор</TableHead>}
                  <TableHead>Статус</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead className="text-right">Дії</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div className="font-medium line-clamp-1">{post.title}</div>
                      {post.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {post.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    {user?.role === 'admin' && (
                      <TableCell className="text-muted-foreground">
                        {post.authorName}
                      </TableCell>
                    )}
                    <TableCell>
                      <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                        {post.status === 'published' ? 'Опубліковано' : 'Чернетка'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(post.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        {post.status === 'published' && (
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/posts/${post.slug}`} target="_blank">
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/dashboard/posts/${post.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Видалити статтю?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Ця дія незворотна. Стаття буде повністю видалена.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Скасувати</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(post.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Видалити
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
