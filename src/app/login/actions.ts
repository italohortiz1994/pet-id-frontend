"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  loginUser,
  sanitizeRedirectPath,
  serializeLoginFormData,
  validateLoginPayload,
} from "@/lib/auth";
import { AUTH_COOKIE_NAME } from "@/lib/session";

export type LoginFormState = {
  message: string;
  errors: Partial<Record<string, string>>;
};

export async function loginAction(_: LoginFormState, formData: FormData): Promise<LoginFormState> {
  const values = serializeLoginFormData(formData);
  const errors = validateLoginPayload(values);
  const redirectTo = sanitizeRedirectPath(String(formData.get("redirectTo") ?? "/"));

  if (Object.keys(errors).length > 0) {
    return {
      message: "Revise os campos obrigatorios antes de entrar.",
      errors,
    };
  }

  try {
    const result = await loginUser(values);

    if (!result.token) {
      return {
        message: "O back-end autenticou, mas nao retornou um token utilizavel.",
        errors: {},
      };
    }

    const cookieStore = await cookies();

    cookieStore.set(AUTH_COOKIE_NAME, result.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "Nao foi possivel autenticar.",
      errors: {},
    };
  }

  redirect(redirectTo);
}
