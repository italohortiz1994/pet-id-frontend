import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteVeterinarianAction } from "@/app/veterinarios/actions";
import { SubmitButton } from "@/components/submit-button";
import { ApiError } from "@/lib/api";
import { formatDate, getVeterinarian } from "@/lib/veterinarians";

type VeterinarianDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function VeterinarianDetailsPage(props: VeterinarianDetailsPageProps) {
  const { id } = await props.params;
  let veterinarian;

  try {
    veterinarian = await getVeterinarian(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }

  const deleteAction = deleteVeterinarianAction.bind(null, veterinarian.id);

  return (
    <div className="space-y-5">
      <section className="glass-panel px-6 py-6 sm:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <span className="eyebrow">Detalhes</span>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">{veterinarian.name}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Visualize os dados profissionais do veterinario e siga para edicao quando precisar
              ajustar o cadastro.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href={`/veterinarios/${veterinarian.id}/edit`} className="button-primary">
              Editar
            </Link>
            <Link href="/veterinarios" className="button-secondary">
              Voltar
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-panel px-6 py-6">
          <div className="grid gap-5 md:grid-cols-2">
            <article>
              <p className="helper-text">CRMV</p>
              <p className="mt-2 text-lg font-medium">{veterinarian.crmv || "Nao informado"}</p>
            </article>
            <article>
              <p className="helper-text">Status</p>
              <div className="mt-2">
                <span className="status-pill">{veterinarian.statusLabel}</span>
              </div>
            </article>
            <article>
              <p className="helper-text">Especialidade</p>
              <p className="mt-2 text-lg font-medium">{veterinarian.specialty}</p>
            </article>
            <article>
              <p className="helper-text">Clinica</p>
              <p className="mt-2 text-lg font-medium">{veterinarian.clinicName || "Nao informada"}</p>
            </article>
            <article>
              <p className="helper-text">Criado em</p>
              <p className="mt-2 text-lg font-medium">{formatDate(veterinarian.createdAt)}</p>
            </article>
            <article>
              <p className="helper-text">Atualizado em</p>
              <p className="mt-2 text-lg font-medium">{formatDate(veterinarian.updatedAt)}</p>
            </article>
          </div>

          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="helper-text">Observacoes</p>
            <p className="mt-3 leading-7 text-slate-100">
              {veterinarian.notes || "Sem observacoes cadastradas."}
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <section className="glass-panel px-6 py-6">
            <span className="eyebrow">Contato</span>
            <h2 className="mt-3 text-xl font-semibold">Informacoes de atendimento</h2>
            <div className="mt-5 space-y-4">
              <div>
                <p className="helper-text">Telefone</p>
                <p className="mt-1 text-lg font-medium">{veterinarian.phone || "Nao informado"}</p>
              </div>
              <div>
                <p className="helper-text">E-mail</p>
                <p className="mt-1 text-lg font-medium">{veterinarian.email || "Nao informado"}</p>
              </div>
              <div>
                <p className="helper-text">Endereco</p>
                <p className="mt-1 text-lg font-medium">{veterinarian.address || "Nao informado"}</p>
              </div>
            </div>
          </section>

          <section className="glass-panel px-6 py-6">
            <span className="eyebrow">Zona de risco</span>
            <h2 className="mt-3 text-xl font-semibold">Excluir cadastro</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Esta acao remove o profissional do cadastro do back-end.
            </p>

            <form action={deleteAction} className="mt-5">
              <SubmitButton variant="danger">Excluir veterinario</SubmitButton>
            </form>
          </section>
        </div>
      </section>
    </div>
  );
}
