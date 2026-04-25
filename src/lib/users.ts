import { apiFetch } from "./api";

export type UserFormValues = {
  name: string;
  cpf: string;
  birthDate: string;
  email: string;
  password: string;
};

const defaultValues: UserFormValues = {
  name: "",
  cpf: "",
  birthDate: "",
  email: "",
  password: "",
};

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function getEmptyUserValues(overrides?: Partial<UserFormValues>) {
  return { ...defaultValues, ...overrides };
}

export function serializeUserFormData(formData: FormData): UserFormValues {
  return {
    email: stringValue(formData.get("email")).trim(),
    password: stringValue(formData.get("password")).trim(),
    name: stringValue(formData.get("name")).trim(),
    cpf: stringValue(formData.get("cpf")).trim(),
    birthDate: stringValue(formData.get("birthDate")).trim(),
  };
}

export function validateUserPayload(values: UserFormValues) {
  const errors: Partial<Record<keyof UserFormValues, string>> = {};

  if (!values.email) {
    errors.email = "Informe o e-mail.";
  }

  if (!values.password) {
    errors.password = "Informe a senha.";
  }

  return errors;
}

export async function registerUser(values: UserFormValues) {
  const payload = Object.fromEntries(
    Object.entries(values).filter(([, value]) => value !== ""),
  );

  return apiFetch<{ id?: string | number }>("/auth/register", {
    method: "POST",
    authenticated: false,
    body: JSON.stringify(payload),
  });
}
