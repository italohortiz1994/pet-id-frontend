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

      <section className="glass-panel pet-table">
        {pets.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-[var(--muted)]">
            Nenhum pet encontrado para os filtros informados.
          </div>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Pet</th>
                  <th>Idade</th>
                  <th>Sexo</th>
                  <th>Acao</th>
                </tr>
              </thead>
              <tbody>
                {pets.map((pet) => (
                  <tr key={pet.id}>
                    <td>
                      <p className="font-medium">{pet.name}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">{pet.breed}</p>
                    </td>
                    <td className="text-sm text-[var(--muted)]">{pet.age ?? "Nao informada"}</td>
                    <td>
                      <span className="status-pill">
                        {pet.gender === "F" ? "Femea" : pet.gender === "M" ? "Macho" : pet.gender}
                      </span>
                    </td>
                    <td>
                      <Link href={`/pets/${pet.id}`} className="text-sm font-medium text-[var(--accent-2)]">
                        Ver detalhes
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
