'use client'

import Link from 'next/link'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { PenLine, LayoutDashboard, LogOut, User } from 'lucide-react'

export function Header() {
  const { user, isAuthenticated, logout } = useAuth()

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <PenLine className="h-6 w-6" />
          <span className="text-xl font-semibold">Блог</span>
        </Link>

        <nav className="flex items-center gap-4">
          {isAuthenticated && user ? (
            <>
              {(user.role === 'admin' || user.role === 'author') ? (
                <Button variant="ghost" size="sm" asChild className="hidden md:flex">
                  <Link href="/dashboard/posts/new" className="flex items-center gap-2">
                    <PenLine className="h-4 w-4" />
                    <span>Нова стаття</span>
                  </Link>
                </Button>
              ) : null}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center gap-2 p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Панель керування</span>
                    </Link>
                  </DropdownMenuItem>
                  {(user.role === 'admin' || user.role === 'author') ? (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/posts/new" className="flex items-center gap-2 cursor-pointer">
                        <PenLine className="h-4 w-4" />
                        <span>Нова стаття</span>
                      </Link>
                    </DropdownMenuItem>
                  ) : null}
                  {user.role === 'admin' ? (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/users" className="flex items-center gap-2 cursor-pointer">
                        <User className="h-4 w-4" />
                        <span>Користувачі</span>
                      </Link>
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Вийти</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Увійти</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Реєстрація</Link>
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
