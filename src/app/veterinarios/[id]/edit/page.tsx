import { updateVeterinarianAction } from "@/app/veterinarios/actions";
import { initialVeterinarianFormState } from "@/app/veterinarios/form-state";
import { VeterinarianForm } from "@/components/veterinarian-form";
import { getVeterinarian, getVeterinarianFormValues } from "@/lib/veterinarians";

type EditVeterinarianPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditVeterinarianPage(props: EditVeterinarianPageProps) {
  const { id } = await props.params;
  const veterinarian = await getVeterinarian(id);
  const action = updateVeterinarianAction.bind(null, veterinarian.id);

  return (
    <VeterinarianForm
      action={action}
      initialState={initialVeterinarianFormState}
      initialValues={getVeterinarianFormValues(veterinarian)}
      title={`Editar ${veterinarian.name}`}
      description="Atualize os dados do profissional e envie novamente para refletir as mudancas no back-end."
      submitLabel="Salvar alteracoes"
    />
  );
}
