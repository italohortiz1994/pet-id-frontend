"use server";

import { revalidatePath } from "next/cache";
import {
  createVaccine,
  serializeVaccineFormData,
  validateVaccinePayload,
} from "@/lib/health-records";

export type VaccineFormState = {
  message: string;
  errors: Partial<Record<string, string>>;
};

export async function createVaccineAction(
  petId: string,
  _: VaccineFormState,
  formData: FormData,
): Promise<VaccineFormState> {
  const values = {
    ...serializeVaccineFormData(formData),
    petId,
  };
  const errors = validateVaccinePayload(values);

  if (Object.keys(errors).length > 0) {
    return {
      message: "Revise os campos obrigatorios antes de enviar.",
      errors,
    };
  }

  try {
    await createVaccine(values);
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "Nao foi possivel cadastrar a vacina.",
      errors: {},
    };
  }

  revalidatePath(`/pets/${petId}/health`);

  return {
    message: "Vacina cadastrada com sucesso.",
    errors: {},
  };
}
