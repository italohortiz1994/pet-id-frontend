import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { ApiError, apiFetch, getBackendUrl, getSessionToken } from "./api";
import { getPublicPetId, getPublicPetQrCode } from "./public-pets";
import { pickFirstString, unwrapRecord } from "./records";

type RawRecord = Record<string, unknown>;

export type PetFormValues = {
  name: string;
  breed: string;
  age: string;
  gender: string;
};

export type Pet = {
  id: string;
  name: string;
  breed: string;
  age: number | null;
  gender: string;
  publicId: string;
  qrCodeUrl: string;
  ownerId: string;
  raw: RawRecord;
};

export type PetIdentity = {
  petId: string;
  publicId: string;
  qrCodeUrl: string;
  raw: RawRecord;
};

export type PetFilters = {
  q?: string;
  gender?: string;
};

export type DashboardData = {
  pets: Pet[];
  stats: {
    total: number;
    byGender: Record<string, number>;
  };
  backendUrl: string;
};

const defaultPetValues: PetFormValues = {
  name: "",
  breed: "",
  age: "",
  gender: "M",
};

const OWNED_PETS_COOKIE_NAME = "pet-id-owned-pets";

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function numberValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function nestedRecord(value: unknown) {
  return value && typeof value === "object" ? (value as RawRecord) : undefined;
}

function pickFirstNumber(source: RawRecord, paths: string[]) {
  for (const path of paths) {
    const chunks = path.split(".");
    let current: unknown = source;

    for (const chunk of chunks) {
      const record = nestedRecord(current);

      if (!record) {
        current = undefined;
        break;
      }

      current = record[chunk];
    }

    const parsed = numberValue(current);

    if (parsed !== null) {
      return parsed;
    }
  }

  return null;
}

function unwrapList(payload: unknown) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === "object") {
    const record = payload as RawRecord;

    if (Array.isArray(record.data)) {
      return record.data;
    }

    if (Array.isArray(record.items)) {
      return record.items;
    }

    if (Array.isArray(record.pets)) {
      return record.pets;
    }

    if (Array.isArray(record.value)) {
      return record.value;
    }
  }

  return [];
}

function unwrapItem(payload: unknown) {
  if (payload && typeof payload === "object") {
    const record = payload as RawRecord;

    if (record.data && typeof record.data === "object") {
      return record.data as RawRecord;
    }

    if (record.pet && typeof record.pet === "object") {
      return record.pet as RawRecord;
    }

    return record;
  }

  return {};
}

function normalizeGender(value: string) {
  const normalized = value.trim().toLowerCase();

  if (["m", "macho", "male"].includes(normalized)) {
    return "M";
  }

  if (["f", "femea", "female"].includes(normalized)) {
    return "F";
  }

  return value || "Nao informado";
}

function normalizePet(raw: RawRecord): Pet {
  return {
    id: String(raw.id ?? raw._id ?? raw.petId ?? Math.random().toString(36).slice(2)),
    name: pickFirstString(raw, ["name", "nome"]) || "Pet sem nome",
    breed: pickFirstString(raw, ["breed", "raca"]) || "Raca nao informada",
    age: pickFirstNumber(raw, ["age", "idade"]),
    gender: normalizeGender(pickFirstString(raw, ["gender", "sexo"])),
    publicId: getPublicPetId(raw),
    qrCodeUrl: getPublicPetQrCode(raw),
    ownerId: pickFirstString(raw, [
      "userId",
      "user_id",
      "ownerId",
      "owner_id",
      "tutorId",
      "tutor_id",
      "user.id",
      "owner.id",
      "tutor.id",
    ]),
    raw,
  };
}

function decodeBase64UrlJson(value: string) {
  try {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = `${normalized}${"=".repeat((4 - (normalized.length % 4)) % 4)}`;
    return JSON.parse(Buffer.from(padded, "base64").toString("utf8")) as RawRecord;
  } catch {
    return {};
  }
}

export async function getCurrentUserId() {
  const token = await getSessionToken();

  if (!token) {
    return "";
  }

  const [, payload = ""] = token.split(".");
  const decoded = decodeBase64UrlJson(payload);

  return pickFirstString(decoded, ["sub", "id", "userId", "user_id", "user.id", "profile.id"]);
}

async function getCurrentUserKey() {
  const token = await getSessionToken();

  if (!token) {
    return "";
  }

  return (await getCurrentUserId()) || createHash("sha256").update(token).digest("hex");
}

function parseOwnedPetsCookie(value: string) {
  if (!value) {
    return {} as Record<string, string[]>;
  }

  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;

    return Object.fromEntries(
      Object.entries(parsed).map(([key, ids]) => [
        key,
        Array.isArray(ids) ? ids.map((id) => String(id)).filter(Boolean) : [],
      ]),
    );
  } catch {
    return {} as Record<string, string[]>;
  }
}

export async function getOwnedPetIds() {
  const userKey = await getCurrentUserKey();

  if (!userKey) {
    return [];
  }

  const cookieStore = await cookies();
  const ownedPets = parseOwnedPetsCookie(cookieStore.get(OWNED_PETS_COOKIE_NAME)?.value ?? "");

  return ownedPets[userKey] ?? [];
}

export async function rememberOwnedPetId(petId: string) {
  const userKey = await getCurrentUserKey();

  if (!userKey || !petId) {
    return;
  }

  const cookieStore = await cookies();
  const ownedPets = parseOwnedPetsCookie(cookieStore.get(OWNED_PETS_COOKIE_NAME)?.value ?? "");
  const ids = new Set([...(ownedPets[userKey] ?? []), petId]);

  ownedPets[userKey] = [...ids];
  cookieStore.set(OWNED_PETS_COOKIE_NAME, JSON.stringify(ownedPets), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function forgetOwnedPetId(petId: string) {
  const userKey = await getCurrentUserKey();

  if (!userKey || !petId) {
    return;
  }

  const cookieStore = await cookies();
  const ownedPets = parseOwnedPetsCookie(cookieStore.get(OWNED_PETS_COOKIE_NAME)?.value ?? "");

  ownedPets[userKey] = (ownedPets[userKey] ?? []).filter((id) => id !== petId);
  cookieStore.set(OWNED_PETS_COOKIE_NAME, JSON.stringify(ownedPets), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function getEmptyPetValues(overrides?: Partial<PetFormValues>) {
  return { ...defaultPetValues, ...overrides };
}

export function getPetFormValues(pet: Pet): PetFormValues {
  return {
    name: pet.name,
    breed: pet.breed,
    age: pet.age === null ? "" : String(pet.age),
    gender: pet.gender,
  };
}

export async function getPets(filters?: PetFilters) {
  let pets = await getAllPets();
  const currentUserId = await getCurrentUserId();
  const ownedPetIds = await getOwnedPetIds();

  if (currentUserId && pets.some((pet) => pet.ownerId)) {
    pets = pets.filter((pet) => pet.ownerId === currentUserId);
  } else {
    pets = pets.filter((pet) => ownedPetIds.includes(pet.id));
  }

  if (filters?.q) {
    const query = filters.q.toLowerCase();
    pets = pets.filter((pet) => {
      return pet.name.toLowerCase().includes(query) || pet.breed.toLowerCase().includes(query);
    });
  }

  if (filters?.gender) {
    const selectedGender = filters.gender.toLowerCase();
    pets = pets.filter((pet) => pet.gender.toLowerCase() === selectedGender);
  }

  return pets.sort((a, b) => Number(b.id) - Number(a.id));
}

export async function getAllPets() {
  const payload = await apiFetch<unknown>("/pets");
  return unwrapList(payload).map((item) => normalizePet((item ?? {}) as RawRecord));
}

export async function getPet(id: string) {
  const payload = await apiFetch<unknown>(`/pets/${id}`);
  const pet = normalizePet(unwrapItem(payload));
  const currentUserId = await getCurrentUserId();
  const ownedPetIds = await getOwnedPetIds();

  if (pet.ownerId && currentUserId && pet.ownerId !== currentUserId) {
    throw new ApiError("Pet nao encontrado para este usuario.", 404);
  }

  if (!pet.ownerId && !ownedPetIds.includes(pet.id)) {
    throw new ApiError("Pet nao encontrado para este usuario.", 404);
  }

  return pet;
}

export async function getDashboardData(): Promise<DashboardData> {
  try {
    const pets = await getPets();

    return {
      pets,
      stats: {
        total: pets.length,
        byGender: pets.reduce<Record<string, number>>((acc, pet) => {
          acc[pet.gender] = (acc[pet.gender] ?? 0) + 1;
          return acc;
        }, {}),
      },
      backendUrl: getBackendUrl(),
    };
  } catch {
    return {
      pets: [],
      stats: {
        total: 0,
        byGender: {},
      },
      backendUrl: getBackendUrl(),
    };
  }
}

export function formatAge(value: number | null) {
  if (value === null) {
    return "Nao informada";
  }

  return `${value} ano${value === 1 ? "" : "s"}`;
}

export function formatDate(value: string) {
  if (!value) {
    return "Nao informado";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function serializePetFormData(formData: FormData): PetFormValues {
  return {
    name: stringValue(formData.get("name")).trim(),
    breed: stringValue(formData.get("breed")).trim(),
    age: stringValue(formData.get("age")).trim(),
    gender: stringValue(formData.get("gender")).trim() || "M",
  };
}

export function validatePetPayload(values: PetFormValues) {
  const errors: Partial<Record<keyof PetFormValues, string>> = {};

  if (!values.name) {
    errors.name = "Informe o nome do pet.";
  }

  if (!values.breed) {
    errors.breed = "Informe a raca do pet.";
  }

  if (!values.age || Number.isNaN(Number(values.age))) {
    errors.age = "Informe uma idade numerica.";
  }

  if (!values.gender) {
    errors.gender = "Selecione o sexo do pet.";
  }

  return errors;
}

function toApiPayload(values: PetFormValues) {
  return {
    name: values.name,
    breed: values.breed,
    age: Number(values.age),
    gender: values.gender,
  };
}

export async function createPet(values: PetFormValues) {
  const userId = await getCurrentUserId();

  return apiFetch("/pets", {
    method: "POST",
    body: JSON.stringify({
      ...toApiPayload(values),
      ...(userId ? { userId } : {}),
    }),
  });
}

export function getPetIdFromPayload(payload: unknown) {
  const raw = unwrapRecord(payload, ["pet", "data"]);
  return String(raw.id ?? raw._id ?? raw.petId ?? "");
}

export async function updatePet(id: string, values: PetFormValues) {
  return apiFetch(`/pets/${id}`, {
    method: "PUT",
    body: JSON.stringify(toApiPayload(values)),
  });
}

export async function deletePet(id: string) {
  return apiFetch(`/pets/${id}`, {
    method: "DELETE",
  });
}

export async function getPetIdentity(petId: string, authenticated = true): Promise<PetIdentity> {
  let payload: unknown;

  try {
    payload = await apiFetch<unknown>(`/pet-identity/${petId}`, { authenticated });
  } catch (error) {
    if (!(error instanceof ApiError) || ![404, 405].includes(error.status)) {
      throw error;
    }

    payload = await apiFetch<unknown>(`/pet-identity/${petId}`, {
      method: "POST",
      authenticated,
    });
  }

  const raw = unwrapRecord(payload, ["identity", "petIdentity", "pet"]);

  return {
    petId: pickFirstString(raw, ["petId", "pet_id", "id"]) || petId,
    publicId: getPublicPetId(raw),
    qrCodeUrl: getPublicPetQrCode(raw),
    raw,
  };
}
