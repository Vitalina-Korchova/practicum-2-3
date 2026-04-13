"use server";

import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Невірний формат email"),
  password: z.string().min(6, "Пароль має містити мінімум 6 символів"),
});

const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Ім'я має містити мінімум 2 символи")
      .max(50, "Ім'я занадто довге"),
    email: z.string().email("Невірний формат email"),
    password: z.string().min(6, "Пароль має містити мінімум 6 символів"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Паролі не співпадають",
    path: ["confirmPassword"],
  });

const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, "Ім'я має містити мінімум 2 символи")
    .max(50, "Ім'я занадто довге"),
  email: z.string().email("Невірний формат email"),
  role: z.enum(["admin", "author", "reader"]),
});

export type AuthFormState = {
  success: boolean;
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
    role?: string[];
    _form?: string[];
  };
  data?: {
    id: string;
    name: string;
    email: string;
    role: "admin" | "author" | "reader";
    createdAt: string;
  };
};

function generateId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

export async function loginAction(
  prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const validation = loginSchema.safeParse(rawData);

  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.flatten().fieldErrors,
    };
  }

  return {
    success: true,
    data: {
      id: "",
      name: "",
      email: rawData.email,
      role: "reader",
      createdAt: "",
    },
  };
}

export async function registerAction(
  prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const rawData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const validation = registerSchema.safeParse(rawData);

  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.flatten().fieldErrors,
    };
  }

  const now = new Date().toISOString();

  return {
    success: true,
    data: {
      id: generateId(),
      name: rawData.name.trim(),
      email: rawData.email.toLowerCase().trim(),
      role: "reader",
      createdAt: now,
    },
  };
}

export async function updateUserAction(
  prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const userId = formData.get("userId") as string;

  const rawData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    role: formData.get("role") as "admin" | "author" | "reader",
  };

  const validation = updateUserSchema.safeParse(rawData);

  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.flatten().fieldErrors,
    };
  }

  return {
    success: true,
    data: {
      id: userId,
      name: rawData.name.trim(),
      email: rawData.email.toLowerCase().trim(),
      role: rawData.role,
      createdAt: "",
    },
  };
}

export async function deleteUserAction(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  if (!userId) {
    return { success: false, error: "ID користувача не вказано" };
  }

  return { success: true };
}
