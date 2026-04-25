import { redirect } from "next/navigation";
import { initialLoginFormState } from "@/app/login/form-state";
import { LoginForm } from "@/components/login-form";
import { getEmptyLoginValues, sanitizeRedirectPath } from "@/lib/auth";
import { getSessionToken } from "@/lib/api";
import { loginAction } from "./actions";

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage(props: LoginPageProps) {
  const [searchParams, token] = await Promise.all([props.searchParams, getSessionToken()]);
  const redirectTo = sanitizeRedirectPath(
    typeof searchParams.next === "string" ? searchParams.next : "/",
  );

  if (token) {
    redirect(redirectTo);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <LoginForm
        action={loginAction}
        initialState={initialLoginFormState}
        initialValues={getEmptyLoginValues()}
        redirectTo={redirectTo}
      />

      <section className="glass-panel flex flex-col justify-between px-6 py-6 sm:px-8 sm:py-8">
        <div>
          <span className="eyebrow">Back-end local</span>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">
            Sessao ligada ao servidor da porta 3001
          </h2>
          <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
            Depois do login, o token passa a ser enviado automaticamente nas chamadas do
            front-end para a API configurada em <code>NEXT_PUBLIC_API_URL</code>.
          </p>
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-black/20 px-5 py-5">
          <p className="text-sm text-[var(--muted)]">Fluxo configurado</p>
          <ul className="mt-4 space-y-3 text-sm text-slate-100">
            <li>1. Envio de e-mail e senha para <code>/auth/login</code>.</li>
            <li>2. Persistencia do token em cookie HTTP-only no Next.</li>
            <li>3. Reuso automatico do token nas requisicoes autenticadas.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
