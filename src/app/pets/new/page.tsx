import { createPetAction } from "@/app/pets/actions";
import { initialPetFormState } from "@/app/pets/form-state";
import { PetForm } from "@/components/pet-form";
import { getEmptyPetValues } from "@/lib/pets";

export default function NewPetPage() {
  return (
    <PetForm
      action={createPetAction}
      initialState={initialPetFormState}
      initialValues={getEmptyPetValues()}
      title="Cadastrar novo pet"
      description="Preencha os dados abaixo para enviar um novo registro ao back-end."
      submitLabel="Cadastrar pet"
    />
  );
}
