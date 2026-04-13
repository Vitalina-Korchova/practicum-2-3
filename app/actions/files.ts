'use server'

import { z } from 'zod'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

export type FileUploadState = {
  success: boolean
  error?: string
  data?: {
    fileName: string
    fileType: string
    fileSize: number
    dataUrl: string
  }
}

export async function validateImageAction(formData: FormData): Promise<FileUploadState> {
  const file = formData.get('file') as File | null

  if (!file) {
    return { success: false, error: 'Файл не вибрано' }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: 'Розмір файлу перевищує 5MB' }
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { success: false, error: 'Дозволені лише зображення (JPEG, PNG, GIF, WebP)' }
  }

  // Convert to base64 for localStorage storage
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const base64 = buffer.toString('base64')
  const dataUrl = `data:${file.type};base64,${base64}`

  return {
    success: true,
    data: {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      dataUrl,
    },
  }
}

export async function validateDocumentAction(formData: FormData): Promise<FileUploadState> {
  const file = formData.get('file') as File | null

  if (!file) {
    return { success: false, error: 'Файл не вибрано' }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: 'Розмір файлу перевищує 5MB' }
  }

  if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
    return { success: false, error: 'Дозволені лише документи (PDF, TXT, DOC, DOCX)' }
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const base64 = buffer.toString('base64')
  const dataUrl = `data:${file.type};base64,${base64}`

  return {
    success: true,
    data: {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      dataUrl,
    },
  }
}

export async function processMultipleFilesAction(formData: FormData): Promise<{
  success: boolean
  results: FileUploadState[]
}> {
  const files = formData.getAll('files') as File[]
  const results: FileUploadState[] = []

  for (const file of files) {
    if (!file || file.size === 0) continue

    if (file.size > MAX_FILE_SIZE) {
      results.push({ success: false, error: `${file.name}: Розмір перевищує 5MB` })
      continue
    }

    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type)
    const isDocument = ALLOWED_DOCUMENT_TYPES.includes(file.type)

    if (!isImage && !isDocument) {
      results.push({ success: false, error: `${file.name}: Непідтримуваний формат` })
      continue
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    results.push({
      success: true,
      data: {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        dataUrl,
      },
    })
  }

  return {
    success: results.every((r) => r.success),
    results,
  }
}
