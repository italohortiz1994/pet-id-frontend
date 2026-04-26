import Link from "next/link";
import { RecordDetails } from "@/components/record-details";
import { VaccineForm } from "@/components/vaccine-form";
import { formatDate, getPet } from "@/lib/pets";
import {
  getEmptyVaccineValues,
  getHealthRecordsByPet,
  getVaccinesByPet,
} from "@/lib/health-records";
import { getVeterinarians } from "@/lib/veterinarians";
import { createVaccineAction } from "./actions";
import { initialVaccineFormState } from "./form-state";

type PetHealthPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PetHealthPage(props: PetHealthPageProps) {
  const { id } = await props.params;
  const [pet, vaccines, records, veterinarians] = await Promise.all([
    getPet(id),
    getVaccinesByPet(id),
    getHealthRecordsByPet(id),
    getVeterinarians().catch(() => []),
  ]);
  const vaccineAction = createVaccineAction.bind(null, pet.id);

  return (
    <div className="space-y-5">
      <section className="glass-panel px-6 py-6 sm:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <span className="eyebrow">Saude</span>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">Informacoes de {pet.name}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Vacinas e registros clinicos retornados pelas rotas de health records da API.
            </p>
          </div>

          <Link href={`/pets/${pet.id}`} className="button-secondary">
            Voltar ao pet
          </Link>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="glass-panel px-6 py-6">
          <span className="eyebrow">Nova vacina</span>
          <h2 className="mt-3 text-xl font-semibold">Cadastrar aplicacao</h2>
          <VaccineForm
            action={vaccineAction}
            initialState={initialVaccineFormState}
            initialValues={getEmptyVaccineValues(pet.id)}
            veterinarians={veterinarians}
          />
        </section>

        <section className="glass-panel px-6 py-6">
          <span className="eyebrow">Vacinas</span>
          <h2 className="mt-3 text-xl font-semibold">Carteira de vacinacao</h2>
          <div className="mt-6 space-y-4">
            {vaccines.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">Nenhuma vacina retornada para este pet.</p>
            ) : (
              vaccines.map((vaccine) => (
                <article key={vaccine.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{vaccine.name}</h3>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        Aplicada em {formatDate(vaccine.applicationDate)}
                      </p>
                    </div>
                    {vaccine.nextDoseDate ? (
                      <span className="status-pill">Proxima: {formatDate(vaccine.nextDoseDate)}</span>
                    ) : null}
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="helper-text">Veterinario</p>
                      <p className="mt-1 font-medium">{vaccine.veterinarianName || "Nao informado"}</p>
                    </div>
                    <div>
                      <p className="helper-text">Clinica</p>
                      <p className="mt-1 font-medium">{vaccine.clinicName || "Nao informada"}</p>
                    </div>
                  </div>

                  {vaccine.notes ? <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{vaccine.notes}</p> : null}
                </article>
              ))
            )}
          </div>
        </section>
      </section>

      <section className="glass-panel px-6 py-6">
        <span className="eyebrow">Historico</span>
        <h2 className="mt-3 text-xl font-semibold">Registros de saude</h2>
        <div className="mt-6 space-y-4">
          {records.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">Nenhum registro de saude retornado para este pet.</p>
          ) : (
            records.map((record) => (
              <article key={record.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <span className="status-pill">{record.type}</span>
                    <h3 className="mt-3 text-lg font-semibold">{record.title}</h3>
                    <p className="mt-1 text-sm text-[var(--muted)]">{formatDate(record.date)}</p>
                  </div>
                  {record.fileUrl ? (
                    <a href={record.fileUrl} className="button-secondary">
                      Abrir arquivo
                    </a>
                  ) : null}
                </div>
                {record.description ? (
                  <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{record.description}</p>
                ) : null}
                <div className="mt-5">
                  <RecordDetails data={record.raw} />
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
