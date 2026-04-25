import Link from "next/link";
import { getVeterinarians } from "@/lib/veterinarians";

type VeterinariansPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function VeterinariansPage(props: VeterinariansPageProps) {
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === "string" ? searchParams.q : "";
  const status = typeof searchParams.status === "string" ? searchParams.status : "";
  const specialty = typeof searchParams.specialty === "string" ? searchParams.specialty : "";
  const veterinarians = await getVeterinarians({ q, status, specialty });

  return (
    <div className="space-y-5">
      <section className="glass-panel px-6 py-6 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="eyebrow">Rede clinica</span>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">Veterinarios</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Consulte os profissionais cadastrados, filtre por especialidade e abra os detalhes para
              atualizar o registro.
            </p>
          </div>

          <Link href="/veterinarios/new" className="button-primary">
            Novo veterinario
          </Link>
        </div>

        <form className="mt-8 grid gap-4 lg:grid-cols-[1.4fr_0.8fr_0.8fr_auto]">
          <input className="field" name="q" defaultValue={q} placeholder="Buscar por nome, CRMV ou clinica" />

          <select className="field" name="status" defaultValue={status}>
            <option value="">Todos os status</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
            <option value="on_leave">Afastado</option>
          </select>

          <input className="field" name="specialty" defaultValue={specialty} placeholder="Especialidade" />

          <button className="button-secondary" type="submit">
            Filtrar
          </button>
        </form>
      </section>

      <section className="glass-panel responsive-table">
        <div className="responsive-table__header gap-px bg-white/10 md:grid-cols-[1.1fr_0.8fr_1fr_0.8fr_0.6fr]">
          <div className="bg-[var(--panel-strong)] px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Veterinario
          </div>
          <div className="bg-[var(--panel-strong)] px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            CRMV
          </div>
          <div className="bg-[var(--panel-strong)] px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Clinica
          </div>
          <div className="bg-[var(--panel-strong)] px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Status
          </div>
          <div className="bg-[var(--panel-strong)] px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Acao
          </div>
        </div>

        {veterinarians.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-[var(--muted)]">
            Nenhum veterinario encontrado para os filtros informados.
          </div>
        ) : (
          <div className="responsive-table__body divide-y divide-white/10">
            {veterinarians.map((veterinarian) => (
              <div
                key={veterinarian.id}
                className="responsive-table__row grid grid-cols-1 gap-3 px-5 py-5 md:grid-cols-[1.1fr_0.8fr_1fr_0.8fr_0.6fr] md:items-center"
              >
                <div>
                  <span className="responsive-table__cell-label">Veterinario</span>
                  <p className="font-medium">{veterinarian.name}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{veterinarian.specialty}</p>
                </div>
                <div>
                  <span className="responsive-table__cell-label">CRMV</span>
                  <p className="text-sm text-[var(--muted)]">{veterinarian.crmv || "Nao informado"}</p>
                </div>
                <div>
                  <span className="responsive-table__cell-label">Clinica</span>
                  <p className="text-sm text-[var(--muted)]">{veterinarian.clinicName || "Nao informada"}</p>
                </div>
                <div>
                  <span className="responsive-table__cell-label">Status</span>
                  <span className="status-pill">{veterinarian.statusLabel}</span>
                </div>
                <div>
                  <span className="responsive-table__cell-label">Acao</span>
                  <Link
                    href={`/veterinarios/${veterinarian.id}`}
                    className="text-sm font-medium text-[var(--accent-2)]"
                  >
                    Ver detalhes
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
