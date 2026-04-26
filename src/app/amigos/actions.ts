"use server";

import { revalidatePath } from "next/cache";
import { getSessionToken } from "@/lib/api";
import { updatePetFriendshipStatus } from "@/lib/pet-social";

export type FriendshipActionState = {
  message: string;
  ok: boolean;
};

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

async function setFriendshipStatus(
  formData: FormData,
  status: "accepted" | "rejected",
): Promise<FriendshipActionState> {
  const token = await getSessionToken();

  if (!token) {
    return {
      message: "Entre na sua conta para responder solicitacoes.",
      ok: false,
    };
  }

  const friendshipId = stringValue(formData.get("friendshipId"));

  if (!friendshipId) {
    return {
      message: "Solicitacao nao encontrada.",
      ok: false,
    };
  }

  try {
    await updatePetFriendshipStatus(friendshipId, status);
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "Nao foi possivel atualizar a solicitacao.",
      ok: false,
    };
  }

  revalidatePath("/amigos");
  revalidatePath("/feed");

  return {
    message: status === "accepted" ? "Solicitacao aceita." : "Solicitacao recusada.",
    ok: true,
  };
}

export async function acceptFriendshipAction(
  _: FriendshipActionState,
  formData: FormData,
): Promise<FriendshipActionState> {
  return setFriendshipStatus(formData, "accepted");
}

export async function rejectFriendshipAction(
  _: FriendshipActionState,
  formData: FormData,
): Promise<FriendshipActionState> {
  return setFriendshipStatus(formData, "rejected");
}
