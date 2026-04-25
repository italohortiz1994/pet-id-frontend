"use server";

import { revalidatePath } from "next/cache";
import { getSessionToken } from "@/lib/api";
import {
  createPetNews,
  serializePetNewsFormData,
  validatePetNewsPayload,
} from "@/lib/pet-news";

export type PetNewsFormState = {
  message: string;
  errors: Partial<Record<string, string>>;
  ok: boolean;
};

export async function createPetNewsAction(
  _: PetNewsFormState,
  formData: FormData,
): Promise<PetNewsFormState> {
  const token = await getSessionToken();

  if (!token) {
    return {
      message: "Entre na sua conta para publicar e interagir no feed.",
      errors: {},
      ok: false,
    };
  }

  const values = serializePetNewsFormData(formData);
  const errors = validatePetNewsPayload(values);

  if (Object.keys(errors).length > 0) {
    return {
      message: "Revise os campos obrigatorios antes de publicar.",
      errors,
      ok: false,
    };
  }

  try {
    await createPetNews(values);
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "Nao foi possivel publicar a noticia.",
      errors: {},
      ok: false,
    };
  }

  revalidatePath("/feed");

  return {
    message: "Noticia publicada com sucesso.",
    errors: {},
    ok: true,
  };
}
