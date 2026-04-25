import { updatePetAction } from "@/app/pets/actions";
import { initialPetFormState } from "@/app/pets/form-state";
import { PetForm } from "@/components/pet-form";
import { getPet, getPetFormValues } from "@/lib/pets";

type EditPetPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPetPage(props: EditPetPageProps) {
  const { id } = await props.params;
  const pet = await getPet(id);
  const action = updatePetAction.bind(null, pet.id);

  return (
    <PetForm
      action={action}
      initialState={initialPetFormState}
      initialValues={getPetFormValues(pet)}
      title={`Editar ${pet.name}`}
      description="Atualize os campos e envie novamente para refletir as mudancas no back-end."
      submitLabel="Salvar alteracoes"
    />
  );
}
