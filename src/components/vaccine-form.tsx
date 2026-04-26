"use client";

import { useActionState, useMemo, useState } from "react";
import type { VaccineFormValues } from "@/lib/health-records";
import type { Veterinarian } from "@/lib/veterinarians";
import type { VaccineFormState } from "@/app/pets/[id]/health/actions";
import { SubmitButton } from "./submit-button";

const vaccineOptions = [
  "Antirrabica",
  "V8",
  "V10",
  "V11",
  "Giardia",
  "Gripe canina",
  "Leishmaniose",
  "Multipla felina V3",
  "Multipla felina V4",
  "Multipla felina V5",
  "FeLV",
  "Bordetella",
];

type VaccineFormProps = {
  action: (state: VaccineFormState, formData: FormData) => Promise<VaccineFormState>;
  initialValues: VaccineFormValues;
  initialState: VaccineFormState;
  veterinarians: Veterinarian[];
};

export function VaccineForm({ action, initialValues, initialState, veterinarians }: VaccineFormProps) {
  const [state, formAction] = useActionState(action, initialState);
  const [selectedVeterinarianName, setSelectedVeterinarianName] = useState(initialValues.veterinarianName);
  const selectedVeterinarian = useMemo(() => {
    return veterinarians.find((veterinarian) => veterinarian.name === selectedVeterinarianName);
  }, [selectedVeterinarianName, veterinarians]);
  const clinicName = selectedVeterinarian?.clinicName ?? initialValues.clinicName;

  return (
    <form action={formAction} className="mt-6 space-y-5">
      <input type="hidden" name="petId" value={initialValues.petId} />

      <div className="grid gap-5 md:grid-cols-2">
        <label>
          <span className="field-label">Vacina</span>
          <select className="field" name="name" defaultValue={initialValues.name}>
            <option value="">Selecione uma vacina</option>
            {initialValues.name && !vaccineOptions.includes(initialValues.name) ? (
              <option value={initialValues.name}>{initialValues.name}</option>
            ) : null}
            {vaccineOptions.map((vaccine) => (
              <option key={vaccine} value={vaccine}>
                {vaccine}
              </option>
            ))}
          </select>
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
          <select
            className="field"
            name="veterinarianName"
            value={selectedVeterinarianName}
            onChange={(event) => setSelectedVeterinarianName(event.target.value)}
          >
            <option value="">Selecione um veterinario</option>
            {initialValues.veterinarianName &&
            !veterinarians.some((veterinarian) => veterinarian.name === initialValues.veterinarianName) ? (
              <option value={initialValues.veterinarianName}>{initialValues.veterinarianName}</option>
            ) : null}
            {veterinarians.map((veterinarian) => (
              <option key={veterinarian.id} value={veterinarian.name}>
                {veterinarian.name}
                {veterinarian.crmv ? ` - CRMV ${veterinarian.crmv}` : ""}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="field-label">Clinica</span>
          <input
            className="field"
            value={clinicName}
            placeholder="Ex.: Clinica Pet Vida"
            readOnly
          />
          <input type="hidden" name="clinicName" value={clinicName} />
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
