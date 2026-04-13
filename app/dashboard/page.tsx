'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/auth-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getPosts, getUsers, getUserPosts } from '@/lib/storage'
import type { Post } from '@/lib/types'
import { FileText, Users, Eye, PenLine, Plus } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalUsers: 0,
  })
  const [recentPosts, setRecentPosts] = useState<Post[]>([])

  useEffect(() => {
    const allPosts = getPosts()
    const users = getUsers()
    const userPosts = user?.role === 'admin' ? allPosts : getUserPosts(user?.id || '')

    setStats({
      totalPosts: userPosts.length,
      publishedPosts: userPosts.filter((p) => p.status === 'published').length,
      draftPosts: userPosts.filter((p) => p.status === 'draft').length,
      totalUsers: users.length,
    })

    setRecentPosts(userPosts.slice(0, 5))
  }, [user])

  const canCreatePosts = user?.role === 'admin' || user?.role === 'author'
  const canManageUsers = user?.role === 'admin'

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'short',
    })
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge>Адміністратор</Badge>
      case 'author':
        return <Badge variant="secondary">Автор</Badge>
      default:
        return <Badge variant="outline">Читач</Badge>
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Вітаємо, {user?.name}!</h1>
          <p className="text-muted-foreground">
            Ваша роль: {getRoleBadge(user?.role || 'reader')}
          </p>
        </div>
        {canCreatePosts && (
          <Button asChild>
            <Link href="/dashboard/posts/new">
              <Plus className="mr-2 h-4 w-4" />
              Нова стаття
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Усього статей</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPosts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Опубліковано</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.publishedPosts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Чернетки</CardTitle>
            <PenLine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draftPosts}</div>
          </CardContent>
        </Card>
        {canManageUsers && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Користувачі</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
        )}
      </div>

      {canCreatePosts && (
        <Card>
          <CardHeader>
            <CardTitle>Останні статті</CardTitle>
            <CardDescription>Ваші нещодавні публікації</CardDescription>
          </CardHeader>
          <CardContent>
            {recentPosts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                У вас ще немає статей.{' '}
                <Link href="/dashboard/posts/new" className="text-primary hover:underline">
                  Створіть першу!
                </Link>
              </p>
            ) : (
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <Link
                        href={`/dashboard/posts/${post.id}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {post.title}
                      </Link>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{formatDate(post.createdAt)}</span>
                        <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                          {post.status === 'published' ? 'Опубліковано' : 'Чернетка'}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/posts/${post.id}`}>
                        Редагувати
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!canCreatePosts && (
        <Card>
          <CardHeader>
            <CardTitle>Ваш профіль</CardTitle>
            <CardDescription>Інформація про ваш обліковий запис</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Ім&apos;я</p>
              <p className="font-medium">{user?.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Роль</p>
              {getRoleBadge(user?.role || 'reader')}
            </div>
            <p className="text-sm text-muted-foreground">
              Як читач, ви можете переглядати статті на головній сторінці. Зверніться до адміністратора, щоб отримати права автора.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
