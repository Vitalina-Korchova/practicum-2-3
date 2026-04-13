'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Upload, X, FileImage, File } from 'lucide-react'

interface FileUploadProps {
  onUpload: (file: File, dataUrl: string) => void
  onRemove?: () => void
  accept?: string
  maxSize?: number // in MB
  preview?: string | null
  className?: string
}

export function FileUpload({
  onUpload,
  onRemove,
  accept = 'image/*',
  maxSize = 5,
  preview,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    (file: File) => {
      setError(null)

      if (maxSize && file.size > maxSize * 1024 * 1024) {
        setError(`Файл занадто великий. Максимум: ${maxSize}MB`)
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        onUpload(file, dataUrl)
      }
      reader.readAsDataURL(file)
    },
    [maxSize, onUpload]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile]
  )

  const handleClick = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const handleRemove = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = ''
    }
    onRemove?.()
  }, [onRemove])

  if (preview) {
    return (
      <div className={cn('relative', className)}>
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted">
          <img
            src={preview}
            alt="Preview"
            className="h-full w-full object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute right-2 top-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-muted/50'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
        <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">
          Перетягніть файл сюди або натисніть для вибору
        </p>
        <p className="text-xs text-muted-foreground">
          Максимум {maxSize}MB
        </p>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
