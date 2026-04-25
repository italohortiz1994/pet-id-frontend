import { apiFetch } from "./api";
import { pickFirstString } from "./records";

type RawRecord = Record<string, unknown>;

export type PetNews = {
  id: string;
  title: string;
  content: string;
  category: string;
  imageUrl: string;
  petId: string;
  petName: string;
  petBreed: string;
  likes: number;
  comments: number;
  createdAt: string;
  raw: RawRecord;
};

export type PetNewsFormValues = {
  title: string;
  content: string;
  category: string;
  imageUrl: string;
  petId: string;
};

export type PetNewsQuery = {
  page?: number;
  limit?: number;
  q?: string;
  published?: boolean;
};

function nestedRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as RawRecord) : undefined;
}

function numberValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function unwrapList(payload: unknown) {
  if (Array.isArray(payload)) {
    return payload;
  }

  const record = nestedRecord(payload);

  if (!record) {
    return [];
  }

  for (const key of ["data", "items", "results", "petNews", "news", "value"]) {
    if (Array.isArray(record[key])) {
      return record[key] as unknown[];
    }
  }

  return [];
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

    if (parsed > 0) {
      return parsed;
    }
  }

  return 0;
}

function normalizePetNews(raw: RawRecord): PetNews {
  const title = pickFirstString(raw, ["title", "titulo", "headline", "name"]);
  const content = pickFirstString(raw, ["content", "body", "description", "descricao", "text", "message"]);
  const petName = pickFirstString(raw, ["petName", "pet_name", "pet.name", "pet.nome"]);
  const images = Array.isArray(raw.images) ? raw.images : [];
  const firstImage = images.find((item) => nestedRecord(item));
  const firstImageRecord = nestedRecord(firstImage) ?? {};

  return {
    id: String(raw.id ?? raw._id ?? raw.petNewsId ?? Math.random().toString(36).slice(2)),
    title: title || "Atualizacao do pet",
    content: content || title || "Sem conteudo informado.",
    category: pickFirstString(raw, ["category", "tag", "type", "tipo"]) || "Novidade",
    imageUrl:
      pickFirstString(raw, ["imageUrl", "image_url", "photoUrl", "photo_url", "coverUrl", "cover_url"]) ||
      pickFirstString(firstImageRecord, ["imageUrl", "image_url", "url"]),
    petId: pickFirstString(raw, ["petId", "pet_id", "pet.id", "pet._id"]),
    petName: petName || "Pet ID",
    petBreed: pickFirstString(raw, ["petBreed", "pet_breed", "pet.breed", "pet.raca"]),
    likes: pickFirstNumber(raw, ["likes", "likesCount", "_count.likes"]),
    comments: pickFirstNumber(raw, ["comments", "commentsCount", "_count.comments"]),
    createdAt: pickFirstString(raw, ["createdAt", "created_at", "publishedAt", "published_at", "date"]),
    raw,
  };
}

function buildQueryString(query?: PetNewsQuery) {
  const params = new URLSearchParams();

  if (query?.page) {
    params.set("page", String(query.page));
  }

  if (query?.limit) {
    params.set("limit", String(query.limit));
  }

  if (query?.q) {
    params.set("q", query.q);
  }

  if (query?.published !== undefined) {
    params.set("published", String(query.published));
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

export async function getPetNews(query?: PetNewsQuery) {
  const payload = await apiFetch<unknown>(`/pet-news${buildQueryString(query)}`, {
    authenticated: false,
  });

  return unwrapList(payload).map((item) => normalizePetNews((item ?? {}) as RawRecord));
}

export function getEmptyPetNewsValues(overrides?: Partial<PetNewsFormValues>): PetNewsFormValues {
  return {
    title: "",
    content: "",
    category: "Novidade",
    imageUrl: "",
    petId: "",
    ...overrides,
  };
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function serializePetNewsFormData(formData: FormData): PetNewsFormValues {
  return {
    title: stringValue(formData.get("title")).trim(),
    content: stringValue(formData.get("content")).trim(),
    category: stringValue(formData.get("category")).trim() || "Novidade",
    imageUrl: stringValue(formData.get("imageUrl")).trim(),
    petId: stringValue(formData.get("petId")).trim(),
  };
}

export function validatePetNewsPayload(values: PetNewsFormValues) {
  const errors: Partial<Record<keyof PetNewsFormValues, string>> = {};

  if (!values.title) {
    errors.title = "Informe um titulo para a postagem.";
  }

  if (!values.content) {
    errors.content = "Escreva o conteudo da postagem.";
  }

  return errors;
}

function toApiPayload(values: PetNewsFormValues) {
  return {
    title: values.title,
    summary: values.content.slice(0, 160),
    content: values.content,
    category: values.category,
    ...(values.imageUrl ? { imageUrl: values.imageUrl } : {}),
    ...(values.petId ? { petId: values.petId } : {}),
  };
}

export async function createPetNews(values: PetNewsFormValues) {
  return apiFetch("/pet-news", {
    method: "POST",
    body: JSON.stringify(toApiPayload(values)),
  });
}
