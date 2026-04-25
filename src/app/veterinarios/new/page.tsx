import { createVeterinarianAction } from "@/app/veterinarios/actions";
import { initialVeterinarianFormState } from "@/app/veterinarios/form-state";
import { VeterinarianForm } from "@/components/veterinarian-form";
import { getEmptyVeterinarianValues } from "@/lib/veterinarians";

export default function NewVeterinarianPage() {
  return (
    <VeterinarianForm
      action={createVeterinarianAction}
      initialState={initialVeterinarianFormState}
      initialValues={getEmptyVeterinarianValues()}
      title="Cadastrar novo veterinario"
      description="Preencha os dados abaixo para enviar um novo profissional ao back-end."
      submitLabel="Cadastrar veterinario"
    />
  );
}
