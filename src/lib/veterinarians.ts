import { apiFetch, getBackendUrl } from "./api";

type RawRecord = Record<string, unknown>;
type VeterinarianApiFetchOptions = RequestInit & {
  authenticated?: boolean;
};

export type VeterinarianFormValues = {
  name: string;
  crmv: string;
  specialty: string;
  phone: string;
  email: string;
  clinicName: string;
  address: string;
  status: string;
  notes: string;
};

export type Veterinarian = {
  id: string;
  name: string;
  crmv: string;
  specialty: string;
  phone: string;
  email: string;
  clinicName: string;
  address: string;
  status: string;
  statusLabel: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type VeterinarianFilters = {
  q?: string;
  status?: string;
  specialty?: string;
};

const defaultValues: VeterinarianFormValues = {
  name: "",
  crmv: "",
  specialty: "",
  phone: "",
  email: "",
  clinicName: "",
  address: "",
  status: "active",
  notes: "",
};

const statusLabels: Record<string, string> = {
  active: "Ativo",
  inactive: "Inativo",
  on_leave: "Afastado",
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

    if (typeof current === "number" && Number.isFinite(current)) {
      return String(current);
    }
  }

  return "";
}

function buildUrl(path: string, params?: Record<string, string | undefined>) {
  const url = new URL(path, getBackendUrl());

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value) {
        url.searchParams.set(key, value);
      }
    }
  }

  return url.toString();
}

async function veterinarianApiFetch<T>(
  path: string,
  init?: VeterinarianApiFetchOptions,
  params?: Record<string, string | undefined>,
) {
  return apiFetch<T>(buildUrl(path, params), init);
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

    if (Array.isArray(record.veterinarians)) {
      return record.veterinarians;
    }

    if (Array.isArray(record.veterinarios)) {
      return record.veterinarios;
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

    if (record.veterinarian && typeof record.veterinarian === "object") {
      return record.veterinarian as RawRecord;
    }

    if (record.veterinario && typeof record.veterinario === "object") {
      return record.veterinario as RawRecord;
    }

    return record;
  }

  return {};
}

function normalizeVeterinarian(raw: RawRecord): Veterinarian {
  const status = pickFirstString(raw, ["status", "situacao"]).toLowerCase() || "active";

  return {
    id: pickFirstString(raw, ["id", "_id", "veterinarianId", "veterinarioId"]) || Math.random().toString(36).slice(2),
    name: pickFirstString(raw, ["name", "nome"]) || "Veterinario sem nome",
    crmv: pickFirstString(raw, ["crmv", "registro"]),
    specialty: pickFirstString(raw, ["specialty", "speciality", "especialidade"]) || "Clinica geral",
    phone: pickFirstString(raw, ["phone", "telefone", "contact.phone"]),
    email: pickFirstString(raw, ["email", "contact.email"]),
    clinicName: pickFirstString(raw, ["clinicName", "clinica", "clinic.name"]),
    address: pickFirstString(raw, ["address", "endereco", "clinic.address"]),
    status,
    statusLabel: statusLabels[status] ?? status,
    notes: pickFirstString(raw, ["notes", "observacoes", "description"]),
    createdAt: pickFirstString(raw, ["createdAt", "created_at"]),
    updatedAt: pickFirstString(raw, ["updatedAt", "updated_at"]),
  };
}

export function getEmptyVeterinarianValues(overrides?: Partial<VeterinarianFormValues>) {
  return { ...defaultValues, ...overrides };
}

export function getVeterinarianFormValues(veterinarian: Veterinarian): VeterinarianFormValues {
  return {
    name: veterinarian.name,
    crmv: veterinarian.crmv,
    specialty: veterinarian.specialty,
    phone: veterinarian.phone,
    email: veterinarian.email,
    clinicName: veterinarian.clinicName,
    address: veterinarian.address,
    status: veterinarian.status,
    notes: veterinarian.notes,
  };
}

export async function getVeterinarians(filters?: VeterinarianFilters) {
  const payload = await veterinarianApiFetch<unknown>("/vets", undefined, filters);
  return unwrapList(payload)
    .map((item) => normalizeVeterinarian((item ?? {}) as RawRecord))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getVeterinarian(id: string) {
  const payload = await veterinarianApiFetch<unknown>(`/vets/${id}`);
  return normalizeVeterinarian(unwrapItem(payload));
}

export function serializeVeterinarianFormData(formData: FormData): VeterinarianFormValues {
  return {
    name: stringValue(formData.get("name")).trim(),
    crmv: stringValue(formData.get("crmv")).trim(),
    specialty: stringValue(formData.get("specialty")).trim(),
    phone: stringValue(formData.get("phone")).trim(),
    email: stringValue(formData.get("email")).trim(),
    clinicName: stringValue(formData.get("clinicName")).trim(),
    address: stringValue(formData.get("address")).trim(),
    status: stringValue(formData.get("status")).trim() || "active",
    notes: stringValue(formData.get("notes")).trim(),
  };
}

export function validateVeterinarianPayload(values: VeterinarianFormValues) {
  const errors: Partial<Record<keyof VeterinarianFormValues, string>> = {};

  if (!values.name) {
    errors.name = "Informe o nome do veterinario.";
  }

  if (!values.crmv) {
    errors.crmv = "Informe o CRMV.";
  }

  if (!values.email) {
    errors.email = "Informe o e-mail.";
  }

  if (!values.specialty) {
    errors.specialty = "Informe a especialidade.";
  }

  return errors;
}

function nullableString(value: string) {
  return value.trim() || null;
}

function toApiPayload(values: VeterinarianFormValues) {
  return {
    name: values.name,
    email: values.email,
    crmv: values.crmv,
    specialty: values.specialty || "Clinica geral",
    clinicName: nullableString(values.clinicName),
    phone: nullableString(values.phone),
    address: nullableString(values.address),
    status: values.status || "active",
    notes: nullableString(values.notes),
  };
}

export async function createVeterinarian(values: VeterinarianFormValues) {
  return veterinarianApiFetch("/vets", {
    method: "POST",
    authenticated: false,
    body: JSON.stringify(toApiPayload(values)),
  });
}

export async function updateVeterinarian(id: string, values: VeterinarianFormValues) {
  return veterinarianApiFetch(`/vets/${id}`, {
    method: "PUT",
    body: JSON.stringify(toApiPayload(values)),
  });
}

export async function deleteVeterinarian(id: string) {
  return veterinarianApiFetch(`/vets/${id}`, {
    method: "DELETE",
  });
}

export { formatDate } from "./pets";
