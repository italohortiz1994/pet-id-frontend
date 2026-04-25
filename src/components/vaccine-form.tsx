"use client";

import { useActionState } from "react";
import type { VaccineFormValues } from "@/lib/health-records";
import type { VaccineFormState } from "@/app/pets/[id]/health/actions";
import { SubmitButton } from "./submit-button";

type VaccineFormProps = {
  action: (state: VaccineFormState, formData: FormData) => Promise<VaccineFormState>;
  initialValues: VaccineFormValues;
  initialState: VaccineFormState;
};

export function VaccineForm({ action, initialValues, initialState }: VaccineFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="mt-6 space-y-5">
      <input type="hidden" name="petId" value={initialValues.petId} />

      <div className="grid gap-5 md:grid-cols-2">
        <label>
          <span className="field-label">Vacina</span>
          <input className="field" name="name" defaultValue={initialValues.name} placeholder="Ex.: Antirrabica" />
          {state.errors.name ? <p className="field-error">{state.errors.name}</p> : null}
        </label>

        <label>
          <span className="field-label">Data de aplicacao</span>
          <input className="field" type="date" name="applicationDate" defaultValue={initialValues.applicationDate} />
          {state.errors.applicationDate ? <p className="field-error">{state.errors.applicationDate}</p> : null}
        </label>

        <label>
          <span className="field-label">Proxima dose</span>
          <input className="field" type="date" name="nextDoseDate" defaultValue={initialValues.nextDoseDate} />
        </label>

        <label>
          <span className="field-label">Veterinario</span>
          <input
            className="field"
            name="veterinarianName"
            defaultValue={initialValues.veterinarianName}
            placeholder="Ex.: Dra. Ana Souza"
          />
        </label>

        <label>
          <span className="field-label">Clinica</span>
          <input
            className="field"
            name="clinicName"
            defaultValue={initialValues.clinicName}
            placeholder="Ex.: Clinica Pet Vida"
          />
        </label>
      </div>

      <label className="block">
        <span className="field-label">Observacoes</span>
        <textarea
          className="field min-h-28"
          name="notes"
          defaultValue={initialValues.notes}
          placeholder="Lote, reacoes, orientacoes ou detalhes da aplicacao."
        />
      </label>

      {state.message ? (
        <div className="rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          {state.message}
        </div>
      ) : null}

      <SubmitButton>Cadastrar vacina</SubmitButton>
    </form>
  );
}
