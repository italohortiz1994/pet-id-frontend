import { apiFetch } from "./api";
import { pickFirstString } from "./records";

type RawRecord = Record<string, unknown>;

export type VaccineFormValues = {
  petId: string;
  name: string;
  applicationDate: string;
  nextDoseDate: string;
  veterinarianName: string;
  clinicName: string;
  notes: string;
};

export type VaccineRecord = VaccineFormValues & {
  id: string;
  raw: RawRecord;
};

export type HealthRecord = {
  id: string;
  petId: string;
  title: string;
  description: string;
  type: string;
  date: string;
  fileUrl: string;
  raw: RawRecord;
};

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function unwrapList(payload: unknown) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === "object") {
    const record = payload as RawRecord;

    if (Array.isArray(record.data)) return record.data;
    if (Array.isArray(record.items)) return record.items;
    if (Array.isArray(record.records)) return record.records;
    if (Array.isArray(record.vaccines)) return record.vaccines;
  }

  return [];
}

function normalizeVaccine(raw: RawRecord): VaccineRecord {
  return {
    id: pickFirstString(raw, ["id", "_id", "vaccineId"]) || Math.random().toString(36).slice(2),
    petId: pickFirstString(raw, ["petId", "pet_id"]),
    name: pickFirstString(raw, ["name", "nome", "title"]) || "Vacina sem nome",
    applicationDate: pickFirstString(raw, ["applicationDate", "application_date", "date"]),
    nextDoseDate: pickFirstString(raw, ["nextDoseDate", "next_dose_date"]),
    veterinarianName: pickFirstString(raw, ["veterinarianName", "veterinarian_name", "vetName"]),
    clinicName: pickFirstString(raw, ["clinicName", "clinic_name"]),
    notes: pickFirstString(raw, ["notes", "observacoes", "description"]),
    raw,
  };
}

function normalizeHealthRecord(raw: RawRecord): HealthRecord {
  return {
    id: pickFirstString(raw, ["id", "_id", "recordId"]) || Math.random().toString(36).slice(2),
    petId: pickFirstString(raw, ["petId", "pet_id"]),
    title: pickFirstString(raw, ["title", "name", "nome"]) || "Registro sem titulo",
    description: pickFirstString(raw, ["description", "notes", "observacoes"]),
    type: pickFirstString(raw, ["type", "tipo"]) || "Registro",
    date: pickFirstString(raw, ["date", "createdAt", "created_at"]),
    fileUrl: pickFirstString(raw, ["fileUrl", "file_url", "attachmentUrl"]),
    raw,
  };
}

export function getEmptyVaccineValues(petId: string): VaccineFormValues {
  return {
    petId,
    name: "",
    applicationDate: "",
    nextDoseDate: "",
    veterinarianName: "",
    clinicName: "",
    notes: "",
  };
}

export function serializeVaccineFormData(formData: FormData): VaccineFormValues {
  return {
    petId: stringValue(formData.get("petId")).trim(),
    name: stringValue(formData.get("name")).trim(),
    applicationDate: stringValue(formData.get("applicationDate")).trim(),
    nextDoseDate: stringValue(formData.get("nextDoseDate")).trim(),
    veterinarianName: stringValue(formData.get("veterinarianName")).trim(),
    clinicName: stringValue(formData.get("clinicName")).trim(),
    notes: stringValue(formData.get("notes")).trim(),
  };
}

export function validateVaccinePayload(values: VaccineFormValues) {
  const errors: Partial<Record<keyof VaccineFormValues, string>> = {};

  if (!values.petId) errors.petId = "Pet nao informado.";
  if (!values.name) errors.name = "Informe o nome da vacina.";
  if (!values.applicationDate) errors.applicationDate = "Informe a data de aplicacao.";

  return errors;
}

export async function createVaccine(values: VaccineFormValues) {
  const payload = Object.fromEntries(Object.entries(values).filter(([, value]) => value !== ""));

  return apiFetch("/health-records/vaccines", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getVaccinesByPet(petId: string) {
  const payload = await apiFetch<unknown>(`/health-records/vaccines/pet/${petId}`);
  return unwrapList(payload).map((item) => normalizeVaccine((item ?? {}) as RawRecord));
}

export async function getHealthRecordsByPet(petId: string) {
  const payload = await apiFetch<unknown>(`/health-records/pet/${petId}`);
  return unwrapList(payload).map((item) => normalizeHealthRecord((item ?? {}) as RawRecord));
}
