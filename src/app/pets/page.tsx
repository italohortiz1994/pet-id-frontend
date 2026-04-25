import Link from "next/link";
import { getPets } from "@/lib/pets";

type PetsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PetsPage(props: PetsPageProps) {
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === "string" ? searchParams.q : "";
  const gender = typeof searchParams.gender === "string" ? searchParams.gender : "";
  const pets = await getPets({ q, gender });

  return (
    <div className="space-y-5">
      <section className="glass-panel px-6 py-6 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="eyebrow">Cadastro</span>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">Pets cadastrados</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Use os filtros para consultar os dados do back-end e abra o detalhe de cada pet para
              editar ou remover registros.
            </p>
          </div>

          <Link href="/pets/new" className="button-primary">
            Novo pet
          </Link>
        </div>

        <form className="mt-8 grid gap-4 lg:grid-cols-[1.4fr_0.8fr_auto]">
          <input className="field" name="q" defaultValue={q} placeholder="Buscar por nome ou raca" />

          <select className="field" name="gender" defaultValue={gender}>
            <option className="bg-[#08111f]" value="">Todos os sexos</option>
            <option className="bg-[#08111f]" value="M">Macho</option>
            <option className="bg-[#08111f]" value="F">Femea</option>
          </select>

          <button className="button-secondary" type="submit">
            Filtrar
          </button>
        </form>
      </section>

      <section className="glass-panel responsive-table">
        <div className="responsive-table__header gap-px bg-white/10 md:grid-cols-[1.3fr_0.9fr_0.8fr_0.6fr]">
          <div className="bg-[var(--panel-strong)] px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Pet
          </div>
          <div className="bg-[var(--panel-strong)] px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Idade
          </div>
          <div className="bg-[var(--panel-strong)] px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Sexo
          </div>
          <div className="bg-[var(--panel-strong)] px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Acao
          </div>
        </div>

        {pets.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-[var(--muted)]">
            Nenhum pet encontrado para os filtros informados.
          </div>
        ) : (
          <div className="responsive-table__body divide-y divide-white/10">
            {pets.map((pet) => (
              <div
                key={pet.id}
                className="responsive-table__row grid grid-cols-1 gap-3 px-5 py-5 md:grid-cols-[1.3fr_0.9fr_0.8fr_0.6fr] md:items-center"
              >
                <div>
                  <span className="responsive-table__cell-label">Pet</span>
                  <p className="font-medium">{pet.name}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{pet.breed}</p>
                </div>
                <div>
                  <span className="responsive-table__cell-label">Idade</span>
                  <p className="text-sm text-[var(--muted)]">{pet.age ?? "Nao informada"}</p>
                </div>
                <div>
                  <span className="responsive-table__cell-label">Sexo</span>
                  <span className="status-pill">{pet.gender === "F" ? "Femea" : pet.gender === "M" ? "Macho" : pet.gender}</span>
                </div>
                <div>
                  <span className="responsive-table__cell-label">Acao</span>
                  <Link href={`/pets/${pet.id}`} className="text-sm font-medium text-[var(--accent-2)]">
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
