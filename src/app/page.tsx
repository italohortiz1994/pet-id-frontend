import Link from "next/link";
import { getDashboardData } from "@/lib/pets";

export default async function HomePage() {
  const { pets, stats, backendUrl } = await getDashboardData();

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="glass-panel px-6 py-7">
          <span className="eyebrow">Painel operacional</span>
          <h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">
            Acompanhe o cadastro dos pets e mantenha os dados sincronizados com o back-end.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-base">
            Esta base ja vem pronta para listar, cadastrar, editar, consultar e remover pets
            usando o endpoint configurado em <code>NEXT_PUBLIC_API_URL</code>.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/pets" className="button-primary">
              Ver todos os pets
            </Link>
            <Link href="/pets/new" className="button-secondary">
              Cadastrar novo pet
            </Link>
          </div>
        </div>

        <div className="glass-panel px-6 py-7">
          <span className="eyebrow">Configuracao</span>
          <h2 className="mt-3 text-xl font-semibold">Back-end conectado</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Ajuste o valor de <code>NEXT_PUBLIC_API_URL</code> para apontar para a sua API.
          </p>
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-100">
            {backendUrl}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="metric-card">
          <span>Total</span>
          <strong>{stats.total}</strong>
          <p>pets retornados pelo back-end</p>
        </article>

        {[
          { key: "M", label: "machos" },
          { key: "F", label: "femeas" },
        ].map(({ key, label }) => (
          <article key={key} className="metric-card">
            <span>Sexo</span>
            <strong>{stats.byGender[key] ?? 0}</strong>
            <p>{label}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.35fr_0.95fr]">
        <div className="glass-panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
            <div>
              <span className="eyebrow">Ultimos cadastros</span>
              <h2 className="mt-2 text-xl font-semibold">Visao rapida dos pets</h2>
            </div>
            <Link href="/pets" className="text-sm font-medium text-[var(--accent-2)]">
              Abrir listagem
            </Link>
          </div>

          <div className="divide-y divide-white/10">
            {pets.slice(0, 6).map((pet) => (
              <Link
                key={pet.id}
                href={`/pets/${pet.id}`}
                className="flex flex-col gap-4 px-6 py-5 transition hover:bg-white/5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-lg font-medium">{pet.name}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {pet.breed} {pet.age !== null ? `| ${pet.age} anos` : ""} {pet.gender ? `| ${pet.gender === "F" ? "Femea" : pet.gender === "M" ? "Macho" : pet.gender}` : ""}
                  </p>
                </div>
                <span className="status-pill">{pet.gender === "F" ? "Femea" : pet.gender === "M" ? "Macho" : pet.gender}</span>
              </Link>
            ))}

            {pets.length === 0 ? (
              <div className="px-6 py-10 text-sm text-[var(--muted)]">
                Nenhum pet encontrado. Configure a API e cadastre o primeiro registro.
              </div>
            ) : null}
          </div>
        </div>

        <div className="glass-panel px-6 py-6">
          <span className="eyebrow">Fluxo sugerido</span>
          <h2 className="mt-2 text-xl font-semibold">Paginas entregues</h2>
          <div className="mt-5 space-y-3 text-sm text-[var(--muted)]">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              Dashboard inicial com metricas e ultimos registros.
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              Listagem com busca por nome ou raca e filtro por sexo.
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              Detalhes, criacao, edicao e exclusao de pets.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
