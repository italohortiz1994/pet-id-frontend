"use client";

import { useActionState } from "react";
import type { PetFormValues } from "@/lib/pets";
import type { PetFormState } from "@/app/pets/actions";
import { SubmitButton } from "./submit-button";

type PetFormProps = {
  action: (state: PetFormState, formData: FormData) => Promise<PetFormState>;
  initialValues: PetFormValues;
  initialState: PetFormState;
  title: string;
  description: string;
  submitLabel: string;
};

const statusOptions = [
  { value: "M", label: "Macho" },
  { value: "F", label: "Femea" },
];

export function PetForm({
  action,
  initialValues,
  initialState,
  title,
  description,
  submitLabel,
}: PetFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <div className="glass-panel px-6 py-6 sm:px-8 sm:py-8">
      <div className="max-w-2xl">
        <span className="eyebrow">Formulario</span>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{description}</p>
      </div>

      <form action={formAction} className="mt-8 space-y-6">
        <div className="grid gap-5 md:grid-cols-2">
          <label>
            <span className="field-label">Nome</span>
            <input className="field" name="name" defaultValue={initialValues.name} placeholder="Ex.: Thor" />
            {state.errors.name ? <p className="field-error">{state.errors.name}</p> : null}
          </label>

          <label>
            <span className="field-label">Raca</span>
            <input className="field" name="breed" defaultValue={initialValues.breed} placeholder="Ex.: Labrador" />
            {state.errors.breed ? <p className="field-error">{state.errors.breed}</p> : null}
          </label>

          <label>
            <span className="field-label">Idade</span>
            <input className="field" name="age" defaultValue={initialValues.age} placeholder="Ex.: 3" />
            {state.errors.age ? <p className="field-error">{state.errors.age}</p> : null}
          </label>

          <label>
            <span className="field-label">Sexo</span>
            <select className="field" name="gender" defaultValue={initialValues.gender}>
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            {state.errors.gender ? <p className="field-error">{state.errors.gender}</p> : null}
          </label>
        </div>

        {state.message ? (
          <div className="rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            {state.message}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <SubmitButton>{submitLabel}</SubmitButton>
          <p className="helper-text">A API atual de pets aceita apenas nome, raca, idade e sexo.</p>
        </div>
      </form>
    </div>
  );
}
