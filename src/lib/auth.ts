import { apiFetch } from "./api";

type RawRecord = Record<string, unknown>;

export type LoginFormValues = {
  email: string;
  password: string;
};

export type AuthResult = {
  token: string;
  user: RawRecord | null;
  raw: RawRecord;
};

const defaultValues: LoginFormValues = {
  email: "",
  password: "",
};

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

function pickFirstRecord(source: RawRecord, paths: string[]) {
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

    const record = nestedRecord(current);

    if (record) {
      return record;
    }
  }

  return null;
}

export function getEmptyLoginValues(overrides?: Partial<LoginFormValues>) {
  return { ...defaultValues, ...overrides };
}

export function serializeLoginFormData(formData: FormData): LoginFormValues {
  return {
    email: stringValue(formData.get("email")).trim().toLowerCase(),
    password: stringValue(formData.get("password")).trim(),
  };
}

export function validateLoginPayload(values: LoginFormValues) {
  const errors: Partial<Record<keyof LoginFormValues, string>> = {};

  if (!values.email) {
    errors.email = "Informe o e-mail.";
  }

  if (!values.password) {
    errors.password = "Informe a senha.";
  }

  return errors;
}

function normalizeAuthResult(payload: unknown): AuthResult {
  const raw = nestedRecord(payload) ?? {};
  const token = pickFirstString(raw, [
    "access_token",
    "accessToken",
    "token",
    "jwt",
    "data.access_token",
    "data.accessToken",
    "data.token",
    "data.jwt",
  ]);

  return {
    token,
    user: pickFirstRecord(raw, ["user", "data.user", "profile", "data.profile"]),
    raw,
  };
}

export async function loginUser(values: LoginFormValues) {
  const result = await apiFetch<unknown>("/auth/login", {
    method: "POST",
    authenticated: false,
    body: JSON.stringify(values),
  });

  return normalizeAuthResult(result);
}

export function sanitizeRedirectPath(value: string) {
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/login")) {
    return "/";
  }

  return value;
}
