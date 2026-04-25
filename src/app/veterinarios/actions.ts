"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createVeterinarian,
  deleteVeterinarian,
  serializeVeterinarianFormData,
  updateVeterinarian,
  validateVeterinarianPayload,
} from "@/lib/veterinarians";

export type VeterinarianFormState = {
  message: string;
  errors: Partial<Record<string, string>>;
};

export async function createVeterinarianAction(
  _: VeterinarianFormState,
  formData: FormData,
): Promise<VeterinarianFormState> {
  const values = serializeVeterinarianFormData(formData);
  const errors = validateVeterinarianPayload(values);

  if (Object.keys(errors).length > 0) {
    return {
      message: "Revise os campos obrigatorios antes de enviar.",
      errors,
    };
  }

  try {
    await createVeterinarian(values);
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "Nao foi possivel cadastrar o veterinario.",
      errors: {},
    };
  }

  revalidatePath("/veterinarios");
  redirect("/veterinarios");
}

export async function updateVeterinarianAction(
  veterinarianId: string,
  _: VeterinarianFormState,
  formData: FormData,
): Promise<VeterinarianFormState> {
  const values = serializeVeterinarianFormData(formData);
  const errors = validateVeterinarianPayload(values);

  if (Object.keys(errors).length > 0) {
    return {
      message: "Revise os campos obrigatorios antes de enviar.",
      errors,
    };
  }

  try {
    await updateVeterinarian(veterinarianId, values);
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "Nao foi possivel atualizar o veterinario.",
      errors: {},
    };
  }

  revalidatePath("/veterinarios");
  revalidatePath(`/veterinarios/${veterinarianId}`);
  redirect(`/veterinarios/${veterinarianId}`);
}

export async function deleteVeterinarianAction(veterinarianId: string) {
  await deleteVeterinarian(veterinarianId);
  revalidatePath("/veterinarios");
  redirect("/veterinarios");
}
