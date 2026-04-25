import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "./session";

type RawRecord = Record<string, unknown>;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function nestedRecord(value: unknown) {
  return value && typeof value === "object" ? (value as RawRecord) : undefined;
}

function pickFirstString(source: RawRecord, paths: string[]) {
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

    if (typeof current === "string" && current.trim()) {
      return current;
    }
  }

  return "";
}

async function readErrorMessage(response: Response) {
  const text = await response.text();

  if (!text.trim()) {
    return `Falha ao consumir a API (${response.status} ${response.statusText || "sem detalhes"}).`;
  }

  try {
    const payload = JSON.parse(text) as RawRecord;
    const message = payload.message;

    if (Array.isArray(message)) {
      return message.filter((item) => typeof item === "string").join(" ");
    }

    if (typeof message === "string" && message.trim()) {
      return message;
    }

    return pickFirstString(payload, ["error", "details", "title"]) || text;
  } catch {
    return text;
  }
}

export function getBackendUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? "https://pet-id-api-production.up.railway.app/";
}

export function buildUrl(path: string) {
  return new URL(path, getBackendUrl()).toString();
}

export async function getSessionToken() {
  const cookieStore = await cookies();
  return stringValue(cookieStore.get(AUTH_COOKIE_NAME)?.value).trim();
}

type ApiFetchOptions = RequestInit & {
  authenticated?: boolean;
};

export async function apiFetch<T>(path: string, init?: ApiFetchOptions) {
  const token = init?.authenticated === false ? "" : await getSessionToken();

  const response = await fetch(buildUrl(path), {
    cache: "no-store",
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
