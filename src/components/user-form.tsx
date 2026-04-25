"use client";

import { useActionState } from "react";
import type { UserFormValues } from "@/lib/users";
import type { UserFormState } from "@/app/tutores/actions";
import { SubmitButton } from "./submit-button";

type UserFormProps = {
  action: (state: UserFormState, formData: FormData) => Promise<UserFormState>;
  initialValues: UserFormValues;
  initialState: UserFormState;
  title: string;
  description: string;
  submitLabel: string;
};

export function UserForm({
  action,
  initialValues,
  initialState,
  title,
  description,
  submitLabel,
}: UserFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <div className="glass-panel px-6 py-6 sm:px-8 sm:py-8">
      <div className="max-w-2xl">
        <span className="eyebrow">Cadastro de tutor</span>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          {description}
        </p>
      </div>

      <form action={formAction} className="mt-8 space-y-6">
        <div className="grid gap-5 md:grid-cols-2">
          
          {/* Nome */}
          <label>
            <span className="field-label">Nome</span>
            <input
              className="field"
              name="name"
              type="text"
              defaultValue={initialValues.name}
              placeholder="Ex.: Maria Silva"
            />
            {state.errors.name ? (
              <p className="field-error">{state.errors.name}</p>
            ) : null}
          </label>

          {/* CPF */}
          <label>
            <span className="field-label">CPF</span>
            <input
              className="field"
              name="cpf"
              type="text"
              defaultValue={initialValues.cpf}
              placeholder="Ex.: 123.456.789-00"
            />
            {state.errors.cpf ? (
              <p className="field-error">{state.errors.cpf}</p>
            ) : null}
          </label>

          {/* Data de nascimento */}
          <label>
            <span className="field-label">Data de nascimento</span>
            <input
              className="field"
              name="birthDate"
              type="date"
              defaultValue={initialValues.birthDate}
            />
            {state.errors.birthDate ? (
              <p className="field-error">{state.errors.birthDate}</p>
            ) : null}
          </label>

          {/* Email */}
          <label>
            <span className="field-label">E-mail</span>
            <input
              className="field"
              name="email"
              type="email"
              defaultValue={initialValues.email}
              placeholder="Ex.: maria@email.com"
            />
            {state.errors.email ? (
              <p className="field-error">{state.errors.email}</p>
            ) : null}
          </label>

          {/* Senha */}
          <label>
            <span className="field-label">Senha</span>
            <input
              className="field"
              name="password"
              type="password"
              defaultValue={initialValues.password}
              placeholder="Digite uma senha"
            />
            {state.errors.password ? (
              <p className="field-error">{state.errors.password}</p>
            ) : null}
          </label>
        </div>

        {state.message ? (
          <div className="rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            {state.message}
          </div>
        ) : null}

        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-[var(--muted)]">
          Os dados são enviados para o endpoint <code>/auth/register</code>.
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <SubmitButton>{submitLabel}</SubmitButton>
          <p className="helper-text">
            Preencha todos os campos obrigatórios.
          </p>
        </div>
      </form>
    </div>
  );
}