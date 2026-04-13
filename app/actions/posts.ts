"use server";

import { z } from "zod";

const postSchema = z.object({
  title: z
    .string()
    .min(3, "Заголовок має містити мінімум 3 символи")
    .max(200, "Заголовок занадто довгий"),
  content: z.string().min(10, "Контент має містити мінімум 10 символів"),
  excerpt: z.string().max(500, "Опис занадто довгий").optional(),
  coverImage: z.string().optional(),
  tags: z.array(z.string()).max(10, "Максимум 10 тегів"),
  status: z.enum(["draft", "published"]),
  authorId: z.string(),
  authorName: z.string(),
});

export type PostFormState = {
  success: boolean;
  errors?: {
    title?: string[];
    content?: string[];
    excerpt?: string[];
    tags?: string[];
    _form?: string[];
  };
  data?: {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    coverImage?: string;
    tags: string[];
    status: "draft" | "published";
    authorId: string;
    authorName: string;
    createdAt: string;
    updatedAt: string;
  };
};

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\sа-яіїєґ]/gi, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function generateId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

export async function createPostAction(
  prevState: PostFormState,
  formData: FormData
): Promise<PostFormState> {
  const rawData = {
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    excerpt: (formData.get("excerpt") as string) || "",
    coverImage: (formData.get("coverImage") as string) || undefined,
    tags: JSON.parse((formData.get("tags") as string) || "[]"),
    status: formData.get("status") as "draft" | "published",
    authorId: formData.get("authorId") as string,
    authorName: formData.get("authorName") as string,
  };

  const validation = postSchema.safeParse(rawData);

  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.flatten().fieldErrors,
    };
  }

  const now = new Date().toISOString();
  const slug = generateSlug(rawData.title) + "-" + Date.now();

  const htmlContent = rawData.content
    .split("\n\n")
    .filter(Boolean)
    .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
    .join("");

  const postData = {
    id: generateId(),
    title: rawData.title.trim(),
    slug,
    content: htmlContent,
    excerpt: rawData.excerpt.trim() || rawData.content.slice(0, 150) + "...",
    coverImage: rawData.coverImage,
    tags: rawData.tags,
    status: rawData.status,
    authorId: rawData.authorId,
    authorName: rawData.authorName,
    views: 0,
    createdAt: now,
    updatedAt: now,
  };

  return {
    success: true,
    data: postData,
  };
}

export async function updatePostAction(
  prevState: PostFormState,
  formData: FormData
): Promise<PostFormState> {
  const postId = formData.get("postId") as string;
  const existingSlug = formData.get("existingSlug") as string;

  const rawData = {
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    excerpt: (formData.get("excerpt") as string) || "",
    coverImage: (formData.get("coverImage") as string) || undefined,
    tags: JSON.parse((formData.get("tags") as string) || "[]"),
    status: formData.get("status") as "draft" | "published",
    authorId: formData.get("authorId") as string,
    authorName: formData.get("authorName") as string,
  };

  const validation = postSchema.safeParse(rawData);

  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.flatten().fieldErrors,
    };
  }

  const now = new Date().toISOString();

  const htmlContent = rawData.content
    .split("\n\n")
    .filter(Boolean)
    .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
    .join("");

  const postData = {
    id: postId,
    title: rawData.title.trim(),
    slug: existingSlug,
    content: htmlContent,
    excerpt: rawData.excerpt.trim() || rawData.content.slice(0, 150) + "...",
    coverImage: rawData.coverImage,
    tags: rawData.tags,
    status: rawData.status,
    authorId: rawData.authorId,
    authorName: rawData.authorName,
    createdAt: "",
    updatedAt: now,
  };

  return {
    success: true,
    data: postData,
  };
}

export async function deletePostAction(
  postId: string
): Promise<{ success: boolean; error?: string }> {
  if (!postId) {
    return { success: false, error: "ID статті не вказано" };
  }

  return { success: true };
}
