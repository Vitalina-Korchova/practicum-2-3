import type { User, Post } from './types'

const USERS_KEY = 'blog_users'
const POSTS_KEY = 'blog_posts'
const CURRENT_USER_KEY = 'blog_current_user'

// Initialize with default admin user
const DEFAULT_ADMIN: User = {
  id: 'admin-1',
  email: 'admin@blog.com',
  name: 'Адміністратор',
  role: 'admin',
  createdAt: new Date().toISOString(),
}

const DEFAULT_POSTS: Post[] = [
  {
    id: 'post-1',
    title: 'Ласкаво просимо до нашого блогу',
    slug: 'welcome-to-blog',
    content: `<p>Вітаємо вас на нашій блог-платформі! Тут ви можете читати цікаві статті на різні теми.</p>
<p>Наша платформа пропонує:</p>
<ul>
<li>Зручний інтерфейс для читання</li>
<li>Можливість створювати власні публікації</li>
<li>Система ролей та прав доступу</li>
</ul>
<p>Приєднуйтесь до нашої спільноти!</p>`,
    excerpt: 'Вітаємо вас на нашій блог-платформі! Тут ви можете читати цікаві статті на різні теми.',
    authorId: 'admin-1',
    authorName: 'Адміністратор',
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['новини', 'блог'],
  },
  {
    id: 'post-2',
    title: 'Як почати писати статті',
    slug: 'how-to-write-articles',
    content: `<p>Написання статей - це мистецтво, яке можна освоїти. Ось кілька порад:</p>
<h2>1. Визначте тему</h2>
<p>Оберіть тему, яка вам цікава та в якій ви маєте досвід.</p>
<h2>2. Структуруйте матеріал</h2>
<p>Розділіть статтю на логічні частини з підзаголовками.</p>
<h2>3. Пишіть просто</h2>
<p>Уникайте складних конструкцій, пишіть зрозуміло для читача.</p>`,
    excerpt: 'Написання статей - це мистецтво, яке можна освоїти. Ось кілька порад для початківців.',
    authorId: 'admin-1',
    authorName: 'Адміністратор',
    status: 'published',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    tags: ['поради', 'написання'],
  },
]

// Users
export function getUsers(): User[] {
  if (typeof window === 'undefined') return [DEFAULT_ADMIN]
  const stored = localStorage.getItem(USERS_KEY)
  if (!stored) {
    localStorage.setItem(USERS_KEY, JSON.stringify([{ ...DEFAULT_ADMIN, password: 'admin123' }]))
    return [DEFAULT_ADMIN]
  }
  return JSON.parse(stored).map(({ password, ...user }: User & { password?: string }) => user)
}

export function getUsersWithPasswords(): (User & { password: string })[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(USERS_KEY)
  if (!stored) {
    const defaultUsers = [{ ...DEFAULT_ADMIN, password: 'admin123' }]
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers))
    return defaultUsers
  }
  return JSON.parse(stored)
}

export function createUser(user: Omit<User, 'id' | 'createdAt'> & { password: string }): User {
  const users = getUsersWithPasswords()
  const newUser = {
    ...user,
    id: `user-${Date.now()}`,
    createdAt: new Date().toISOString(),
  }
  users.push(newUser)
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
  const { password, ...userWithoutPassword } = newUser
  return userWithoutPassword
}

export function updateUser(id: string, updates: Partial<User>): User | null {
  const users = getUsersWithPasswords()
  const index = users.findIndex((u) => u.id === id)
  if (index === -1) return null
  users[index] = { ...users[index], ...updates }
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
  const { password, ...userWithoutPassword } = users[index]
  return userWithoutPassword
}

export function deleteUser(id: string): boolean {
  const users = getUsersWithPasswords()
  const filtered = users.filter((u) => u.id !== id)
  if (filtered.length === users.length) return false
  localStorage.setItem(USERS_KEY, JSON.stringify(filtered))
  return true
}

export function authenticateUser(email: string, password: string): User | null {
  const users = getUsersWithPasswords()
  const user = users.find((u) => u.email === email && u.password === password)
  if (!user) return null
  const { password: _, ...userWithoutPassword } = user
  setCurrentUser(userWithoutPassword)
  return userWithoutPassword
}

// Current User
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem(CURRENT_USER_KEY)
  return stored ? JSON.parse(stored) : null
}

export function setCurrentUser(user: User | null): void {
  if (typeof window === 'undefined') return
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(CURRENT_USER_KEY)
  }
}

export function logout(): void {
  setCurrentUser(null)
}

// Posts
export function getPosts(): Post[] {
  if (typeof window === 'undefined') return DEFAULT_POSTS
  const stored = localStorage.getItem(POSTS_KEY)
  if (!stored) {
    localStorage.setItem(POSTS_KEY, JSON.stringify(DEFAULT_POSTS))
    return DEFAULT_POSTS
  }
  return JSON.parse(stored)
}

export function getPublishedPosts(): Post[] {
  return getPosts().filter((p) => p.status === 'published')
}

export function getPostBySlug(slug: string): Post | null {
  return getPosts().find((p) => p.slug === slug) || null
}

export function getPostById(id: string): Post | null {
  return getPosts().find((p) => p.id === id) || null
}

export function getUserPosts(userId: string): Post[] {
  return getPosts().filter((p) => p.authorId === userId)
}

export function createPost(post: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Post {
  const posts = getPosts()
  const newPost: Post = {
    ...post,
    id: `post-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  posts.unshift(newPost)
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts))
  return newPost
}

export function updatePost(id: string, updates: Partial<Post>): Post | null {
  const posts = getPosts()
  const index = posts.findIndex((p) => p.id === id)
  if (index === -1) return null
  posts[index] = { ...posts[index], ...updates, updatedAt: new Date().toISOString() }
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts))
  return posts[index]
}

export function deletePost(id: string): boolean {
  const posts = getPosts()
  const filtered = posts.filter((p) => p.id !== id)
  if (filtered.length === posts.length) return false
  localStorage.setItem(POSTS_KEY, JSON.stringify(filtered))
  return true
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-zа-яіїєґ0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 50)
}

export { generateSlug }
