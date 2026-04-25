"use client";

import { useActionState } from "react";
import type { VeterinarianFormValues } from "@/lib/veterinarians";
import type { VeterinarianFormState } from "@/app/veterinarios/actions";
import { SubmitButton } from "./submit-button";

type VeterinarianFormProps = {
  action: (state: VeterinarianFormState, formData: FormData) => Promise<VeterinarianFormState>;
  initialValues: VeterinarianFormValues;
  initialState: VeterinarianFormState;
  title: string;
  description: string;
  submitLabel: string;
};

const statusOptions = [
  { value: "active", label: "Ativo" },
  { value: "inactive", label: "Inativo" },
  { value: "on_leave", label: "Afastado" },
];

export function VeterinarianForm({
  action,
  initialValues,
  initialState,
  title,
  description,
  submitLabel,
}: VeterinarianFormProps) {
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
            <input className="field" name="name" defaultValue={initialValues.name} placeholder="Ex.: Dra. Ana Souza" />
            {state.errors.name ? <p className="field-error">{state.errors.name}</p> : null}
          </label>

          <label>
            <span className="field-label">CRMV</span>
            <input className="field" name="crmv" defaultValue={initialValues.crmv} placeholder="Ex.: CRMV-SP 12345" />
            {state.errors.crmv ? <p className="field-error">{state.errors.crmv}</p> : null}
          </label>

          <label>
            <span className="field-label">Especialidade</span>
            <input
              className="field"
              name="specialty"
              defaultValue={initialValues.specialty}
              placeholder="Ex.: Dermatologia"
            />
            {state.errors.specialty ? <p className="field-error">{state.errors.specialty}</p> : null}
          </label>

          <label>
            <span className="field-label">Telefone</span>
            <input className="field" name="phone" defaultValue={initialValues.phone} placeholder="Ex.: (11) 99999-9999" />
          </label>

          <label>
            <span className="field-label">E-mail</span>
            <input
              className="field"
              name="email"
              type="email"
              defaultValue={initialValues.email}
              placeholder="Ex.: contato@clinica.com"
            />
            {state.errors.email ? <p className="field-error">{state.errors.email}</p> : null}
          </label>

          <label>
            <span className="field-label">Status</span>
            <select className="field" name="status" defaultValue={initialValues.status}>
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="field-label">Clinica</span>
          <input
            className="field"
            name="clinicName"
            defaultValue={initialValues.clinicName}
            placeholder="Ex.: Clinica Pet Vida"
          />
        </label>

        <label className="block">
          <span className="field-label">Endereco</span>
          <input
            className="field"
            name="address"
            defaultValue={initialValues.address}
            placeholder="Ex.: Rua das Flores, 120 - Sao Paulo"
          />
        </label>

        <label className="block">
          <span className="field-label">Observacoes</span>
          <textarea
            className="field min-h-32"
            name="notes"
            defaultValue={initialValues.notes}
            placeholder="Dias de atendimento, observacoes internas ou servicos oferecidos."
          />
        </label>

        {state.message ? (
          <div className="rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            {state.message}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <SubmitButton>{submitLabel}</SubmitButton>
          <p className="helper-text">Os dados sao enviados ao endpoint de veterinarios do back-end.</p>
        </div>
      </form>
    </div>
  );
}
