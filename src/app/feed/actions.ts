"use server";

import { revalidatePath } from "next/cache";
import { getSessionToken } from "@/lib/api";
import {
  createPetNews,
  serializePetNewsFormData,
  validatePetNewsPayload,
} from "@/lib/pet-news";
import { createPetComment, createPetFriendship, likePetNews } from "@/lib/pet-social";

export type PetNewsFormState = {
  message: string;
  errors: Partial<Record<string, string>>;
  ok: boolean;
};

export type FeedInteractionState = {
  message: string;
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

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function createPetCommentAction(
  _: FeedInteractionState,
  formData: FormData,
): Promise<FeedInteractionState> {
  const token = await getSessionToken();

  if (!token) {
    return {
      message: "Entre na sua conta para comentar.",
      ok: false,
    };
  }

  const newsId = stringValue(formData.get("newsId"));
  const petId = stringValue(formData.get("petId"));
  const content = stringValue(formData.get("content"));

  if (!newsId || !content) {
    return {
      message: "Escreva um comentario antes de enviar.",
      ok: false,
    };
  }

  try {
    await createPetComment(newsId, content, petId);
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "Nao foi possivel comentar.",
      ok: false,
    };
  }

  revalidatePath("/feed");

  return {
    message: "Comentario publicado.",
    ok: true,
  };
}

export async function createPetFriendshipAction(
  _: FeedInteractionState,
  formData: FormData,
): Promise<FeedInteractionState> {
  const token = await getSessionToken();

  if (!token) {
    return {
      message: "Entre na sua conta para adicionar amigos.",
      ok: false,
    };
  }

  const requesterPetId = stringValue(formData.get("requesterPetId"));
  const addresseePetId = stringValue(formData.get("addresseePetId"));

  if (!requesterPetId || !addresseePetId) {
    return {
      message: "Selecione o pet que vai enviar o convite.",
      ok: false,
    };
  }

  try {
    await createPetFriendship(requesterPetId, addresseePetId);
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "Nao foi possivel adicionar amigo.",
      ok: false,
    };
  }

  revalidatePath("/feed");
  revalidatePath("/amigos");

  return {
    message: "Convite de amizade enviado.",
    ok: true,
  };
}

export async function likePetNewsAction(
  _: FeedInteractionState,
  formData: FormData,
): Promise<FeedInteractionState> {
  const token = await getSessionToken();

  if (!token) {
    return {
      message: "Entre na sua conta para curtir.",
      ok: false,
    };
  }

  const newsId = stringValue(formData.get("newsId"));

  if (!newsId) {
    return {
      message: "Publicacao nao encontrada.",
      ok: false,
    };
  }

  try {
    await likePetNews(newsId);
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "Nao foi possivel curtir.",
      ok: false,
    };
  }

  revalidatePath("/feed");

  return {
    message: "Curtida registrada.",
    ok: true,
  };
}
