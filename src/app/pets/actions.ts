"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionToken } from "@/lib/api";
import {
  createPet,
  deletePet,
  forgetOwnedPetId,
  getPetIdFromPayload,
  rememberOwnedPetId,
  serializePetFormData,
  updatePet,
  validatePetPayload,
} from "@/lib/pets";

export type PetFormState = {
  message: string;
  errors: Partial<Record<string, string>>;
};

export async function createPetAction(_: PetFormState, formData: FormData): Promise<PetFormState> {
  const token = await getSessionToken();

  if (!token) {
    redirect("/login?next=/pets/new");
  }

  const values = serializePetFormData(formData);
  const errors = validatePetPayload(values);

  if (Object.keys(errors).length > 0) {
    return {
      message: "Revise os campos obrigatorios antes de enviar.",
      errors,
    };
  }

  try {
    const createdPet = await createPet(values);
    await rememberOwnedPetId(getPetIdFromPayload(createdPet));
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "Nao foi possivel cadastrar o pet.",
      errors: {},
    };
  }

  revalidatePath("/");
  revalidatePath("/pets");
  redirect("/pets");
}

export async function updatePetAction(
  petId: string,
  _: PetFormState,
  formData: FormData,
): Promise<PetFormState> {
  const values = serializePetFormData(formData);
  const errors = validatePetPayload(values);

  if (Object.keys(errors).length > 0) {
    return {
      message: "Revise os campos obrigatorios antes de enviar.",
      errors,
    };
  }

  try {
    await updatePet(petId, values);
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "Nao foi possivel atualizar o pet.",
      errors: {},
    };
  }

  revalidatePath("/");
  revalidatePath("/pets");
  revalidatePath(`/pets/${petId}`);
  redirect(`/pets/${petId}`);
}

export async function deletePetAction(petId: string) {
  await deletePet(petId);
  await forgetOwnedPetId(petId);
  revalidatePath("/");
  revalidatePath("/pets");
  redirect("/pets");
}
