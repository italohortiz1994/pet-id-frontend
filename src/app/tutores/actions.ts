"use server";

import { redirect } from "next/navigation";
import { registerUser, serializeUserFormData, validateUserPayload } from "@/lib/users";

export type UserFormState = {
  message: string;
  errors: Partial<Record<string, string>>;
};

export async function createTutorAction(_: UserFormState, formData: FormData): Promise<UserFormState> {
  const values = serializeUserFormData(formData);
  const errors = validateUserPayload(values);

  if (Object.keys(errors).length > 0) {
    return {
      message: "Revise os campos obrigatorios antes de enviar.",
      errors,
    };
  }

  try {
    const result = await registerUser(values);
    const id = result?.id ? String(result.id) : "";
    redirect(id ? `/tutores/new?created=1&id=${id}` : "/tutores/new?created=1");
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "Nao foi possivel cadastrar o tutor.",
      errors: {},
    };
  }
}
