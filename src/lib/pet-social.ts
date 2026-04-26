import { apiFetch } from "./api";
import { getAllPets, getCurrentUserId, type Pet } from "./pets";
import { pickFirstString } from "./records";

type RawRecord = Record<string, unknown>;

export type PetComment = {
  id: string;
  newsId: string;
  petId: string;
  userId: string;
  content: string;
  authorName: string;
  petName: string;
  createdAt: string;
  raw: RawRecord;
};

export type PetFriendship = {
  id: string;
  requesterPetId: string;
  addresseePetId: string;
  requesterPetName: string;
  addresseePetName: string;
  status: string;
  createdAt: string;
  raw: RawRecord;
};

export type FriendSuggestion = {
  userId: string;
  userName: string;
  userEmail: string;
  pets: Pet[];
  friendsCount: number;
  requesterPetId: string;
  addresseePetId: string;
  targetPetName: string;
  friendshipStatus: string;
  canRequest: boolean;
};

function nestedRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as RawRecord) : undefined;
}

function unwrapList(payload: unknown) {
  if (Array.isArray(payload)) {
    return payload;
  }

  const record = nestedRecord(payload);

  if (!record) {
    return [];
  }

  for (const key of ["data", "items", "comments", "friendships", "value"]) {
    if (Array.isArray(record[key])) {
      return record[key] as unknown[];
    }
  }

  return [];
}

function normalizeComment(raw: RawRecord): PetComment {
  return {
    id: String(raw.id ?? ""),
    newsId: pickFirstString(raw, ["newsId", "news_id", "news.id"]),
    petId: pickFirstString(raw, ["petId", "pet_id", "pet.id"]),
    userId: pickFirstString(raw, ["userId", "user_id", "user.id"]),
    content: pickFirstString(raw, ["content", "text", "message"]),
    authorName: pickFirstString(raw, ["user.name", "author.name"]) || "Usuario",
    petName: pickFirstString(raw, ["pet.name", "pet.nome"]),
    createdAt: pickFirstString(raw, ["createdAt", "created_at"]),
    raw,
  };
}

function normalizeFriendship(raw: RawRecord): PetFriendship {
  return {
    id: String(raw.id ?? ""),
    requesterPetId: pickFirstString(raw, ["requesterPetId", "requester_pet_id", "requesterPet.id"]),
    addresseePetId: pickFirstString(raw, ["addresseePetId", "addressee_pet_id", "addresseePet.id"]),
    requesterPetName: pickFirstString(raw, ["requesterPet.name", "requesterPet.nome"]) || "Pet solicitante",
    addresseePetName: pickFirstString(raw, ["addresseePet.name", "addresseePet.nome"]) || "Pet amigo",
    status: pickFirstString(raw, ["status"]) || "pending",
    createdAt: pickFirstString(raw, ["createdAt", "created_at"]),
    raw,
  };
}

export async function getPetComments(newsId: string) {
  const payload = await apiFetch<unknown>(`/pet-news/${newsId}/comments`, {
    authenticated: false,
  });

  return unwrapList(payload).map((item) => normalizeComment((item ?? {}) as RawRecord));
}

export async function createPetComment(newsId: string, content: string, petId?: string) {
  const userId = await getCurrentUserId();

  return apiFetch(`/pet-news/${newsId}/comments`, {
    method: "POST",
    body: JSON.stringify({
      content,
      ...(petId ? { petId } : {}),
      ...(userId ? { userId } : {}),
    }),
  });
}

export async function getPetFriendships(filters?: { petId?: string; status?: string }) {
  const params = new URLSearchParams();

  if (filters?.petId) {
    params.set("petId", filters.petId);
  }

  if (filters?.status) {
    params.set("status", filters.status);
  }

  const queryString = params.toString();
  const payload = await apiFetch<unknown>(`/pet-friends${queryString ? `?${queryString}` : ""}`);

  return unwrapList(payload).map((item) => normalizeFriendship((item ?? {}) as RawRecord));
}

export async function createPetFriendship(requesterPetId: string, addresseePetId: string) {
  return apiFetch("/pet-friends", {
    method: "POST",
    body: JSON.stringify({
      requesterPetId,
      addresseePetId,
      status: "pending",
    }),
  });
}

export async function updatePetFriendshipStatus(friendshipId: string, status: string) {
  return apiFetch(`/pet-friends/${friendshipId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function likePetNews(newsId: string) {
  const userId = await getCurrentUserId();

  return apiFetch(`/pet-news/${newsId}/like`, {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
}

export async function getFriendshipScopePetIds(myPets: Pet[]) {
  const petIds = new Set(myPets.map((pet) => pet.id));
  const allPets = await getAllPets();

  for (const pet of allPets) {
    if (!pet.ownerId) {
      petIds.add(pet.id);
    }
  }

  return petIds;
}

export async function getFriendSuggestions(myPets: Pet[]) {
  const currentUserId = await getCurrentUserId();
  const [usersPayload, allPets, friendships] = await Promise.all([
    apiFetch<unknown>("/users"),
    getAllPets(),
    getPetFriendships().catch(() => [] as PetFriendship[]),
  ]);
  const users = unwrapList(usersPayload)
    .map((item) => (item ?? {}) as RawRecord)
    .map((user) => ({
      id: String(user.id ?? ""),
      name: pickFirstString(user, ["name", "nome"]) || "Usuario",
      email: pickFirstString(user, ["email"]),
    }))
    .filter((user) => user.id && user.id !== currentUserId);
  const myPetIds = new Set(myPets.map((pet) => pet.id));
  const legacyPets = allPets.filter((pet) => !pet.ownerId && !myPetIds.has(pet.id));

  return users.map((user, index): FriendSuggestion => {
    const userPets = allPets.filter((pet) => pet.ownerId === user.id);
    const fallbackPet = userPets[0] ? undefined : legacyPets[index % Math.max(legacyPets.length, 1)];
    const availablePets = userPets.length > 0 ? userPets : fallbackPet ? [fallbackPet] : [];
    const targetPet = availablePets.find((pet) => !myPetIds.has(pet.id));
    const availablePetIds = new Set(availablePets.map((pet) => pet.id));
    const friendsCount = friendships.filter((friendship) => {
      if (friendship.status !== "accepted") {
        return false;
      }

      return (
        availablePetIds.has(friendship.requesterPetId) ||
        availablePetIds.has(friendship.addresseePetId)
      );
    }).length;
    const requesterPetId = myPets[0]?.id ?? "";
    const addresseePetId = targetPet?.id ?? "";
    const existingFriendship = friendships.find((friendship) => {
      const involvesMyPet =
        myPetIds.has(friendship.requesterPetId) ||
        myPetIds.has(friendship.addresseePetId);
      const involvesSuggestedPet =
        availablePetIds.has(friendship.requesterPetId) ||
        availablePetIds.has(friendship.addresseePetId);

      return (
        involvesMyPet &&
        involvesSuggestedPet &&
        friendship.status !== "rejected"
      );
    });

    return {
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      pets: availablePets,
      friendsCount,
      requesterPetId,
      addresseePetId,
      targetPetName: targetPet?.name ?? "",
      friendshipStatus: existingFriendship?.status ?? "",
      canRequest: Boolean(requesterPetId && addresseePetId && !existingFriendship),
    };
  });
}
