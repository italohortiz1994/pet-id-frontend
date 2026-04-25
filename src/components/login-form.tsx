"use client";

import { useActionState } from "react";
import type { LoginFormState } from "@/app/login/actions";
import type { LoginFormValues } from "@/lib/auth";
import { SubmitButton } from "./submit-button";

type LoginFormProps = {
  action: (state: LoginFormState, formData: FormData) => Promise<LoginFormState>;
  initialValues: LoginFormValues;
  initialState: LoginFormState;
  redirectTo: string;
};

export function LoginForm({
  action,
  initialValues,
  initialState,
  redirectTo,
}: LoginFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <div className="glass-panel px-6 py-6 sm:px-8 sm:py-8">
      <div className="max-w-2xl">
        <span className="eyebrow">Autenticacao</span>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Entrar no Pet ID</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          Use seu e-mail e sua senha para autenticar no back-end local e liberar o acesso
          ao painel.
        </p>
      </div>

      <form action={formAction} className="mt-8 space-y-6">
        <input type="hidden" name="redirectTo" value={redirectTo} />

        <div className="grid gap-5">
          <label>
            <span className="field-label">E-mail</span>
            <input
              className="field"
              name="email"
              type="email"
              defaultValue={initialValues.email}
              placeholder="voce@exemplo.com"
              autoComplete="email"
            />
            {state.errors.email ? <p className="field-error">{state.errors.email}</p> : null}
          </label>

          <label>
            <span className="field-label">Senha</span>
            <input
              className="field"
              name="password"
              type="password"
              defaultValue={initialValues.password}
              placeholder="Digite sua senha"
              autoComplete="current-password"
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
          As credenciais sao enviadas para o endpoint <code>/auth/login</code> e o token
          retornado fica salvo em cookie HTTP-only.
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <SubmitButton>Entrar</SubmitButton>
          <p className="helper-text">A sessao local dura ate 7 dias.</p>
        </div>
      </form>
    </div>
  );
}
