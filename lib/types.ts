export type UserRole = 'admin' | 'author' | 'reader'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  createdAt: string
}

export interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  coverImage?: string
  authorId: string
  authorName: string
  status: 'draft' | 'published'
  createdAt: string
  updatedAt: string
  tags: string[]
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}
