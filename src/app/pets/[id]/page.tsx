/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { deletePetAction } from "@/app/pets/actions";
import { RecordDetails } from "@/components/record-details";
import { SubmitButton } from "@/components/submit-button";
import { ApiError } from "@/lib/api";
import { formatAge, getPet, getPetIdentity, type PetIdentity } from "@/lib/pets";

type PetDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PetDetailsPage(props: PetDetailsPageProps) {
  const { id } = await props.params;
  let pet;
  let identity: PetIdentity | null = null;
  let identityError = "";
  let petError = "";

  try {
    pet = await getPet(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    petError = error instanceof Error ? error.message : "Nao foi possivel carregar os dados do pet.";
  }

  if (!pet) {
    return (
      <div className="glass-panel px-6 py-12 text-center">
        <span className="eyebrow">Erro da API</span>
        <h1 className="mt-3 text-3xl font-semibold">Nao foi possivel carregar o pet</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">{petError}</p>
        <div className="mt-6 flex justify-center">
          <Link href="/pets" className="button-primary">
            Voltar para pets
          </Link>
        </div>
      </div>
    );
  }

  try {
    identity = await getPetIdentity(pet.id);
  } catch (error) {
    identityError = error instanceof Error ? error.message : "Nao foi possivel carregar a identidade do pet.";
  }

  const deleteAction = deletePetAction.bind(null, pet.id);
  const publicId = identity?.publicId || pet.publicId;
  const publicHref = publicId ? `/public/pet/${publicId}` : "";
  const qrCodeUrl =
    identity?.qrCodeUrl ||
    pet.qrCodeUrl ||
    (publicHref
      ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(publicHref)}`
      : "");

  return (
    <div className="space-y-5">
      <section className="glass-panel px-6 py-6 sm:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <span className="eyebrow">Detalhes</span>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">{pet.name}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Confira os dados retornados pelo back-end e siga para edicao quando precisar ajustar o
              cadastro.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href={`/pets/${pet.id}/edit`} className="button-primary">
              Editar
            </Link>
            <Link href={`/pets/${pet.id}/health`} className="button-secondary">
              Saude
            </Link>
            {publicHref ? (
              <Link href={`${publicHref}?petId=${pet.id}`} className="button-secondary">
                Pagina publica
              </Link>
            ) : null}
            <Link href="/pets" className="button-secondary">
              Voltar
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-panel px-6 py-6">
          <div className="grid gap-5 md:grid-cols-2">
            <article>
              <p className="helper-text">Raça</p>
              <p className="mt-2 text-lg font-medium">{pet.breed}</p>
            </article>
            <article>
              <p className="helper-text">Sexo</p>
              <p className="mt-2 text-lg font-medium">
                {pet.gender === "F" ? "Femea" : pet.gender === "M" ? "Macho" : pet.gender}
              </p>
            </article>
            <article>
              <p className="helper-text">Idade</p>
              <p className="mt-2 text-lg font-medium">{formatAge(pet.age)}</p>
            </article>
            <article>
              <p className="helper-text">Tutor / usuário</p>
              <p className="mt-2 text-lg font-medium">{pet.ownerId || "Vinculado pelo token de acesso"}</p>
            </article>
            <article>
              <p className="helper-text">Identificador publico</p>
              <p className="mt-2 break-words text-lg font-medium">{publicId || "Nao informado"}</p>
            </article>
          </div>

          <div className="mt-8">
            <p className="helper-text">Todas as informacoes do cadastro</p>
            <div className="mt-4">
              <RecordDetails data={pet.raw} hiddenKeys={["qrcodeurl", "qrcode", "qrurl"]} />
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <section className="glass-panel px-6 py-6">
            <span className="eyebrow">Identidade</span>
            <h2 className="mt-3 text-xl font-semibold">Dados de pet-identity</h2>
            {identityError ? (
              <p className="mt-3 text-sm leading-6 text-amber-100">{identityError}</p>
            ) : (
              <div className="mt-5">
                <RecordDetails data={identity?.raw} hiddenKeys={["qrcodeurl", "qrcode", "qrurl"]} />
              </div>
            )}

            {qrCodeUrl ? (
              <div className="mt-6 rounded-3xl border border-white/10 bg-white p-4">
                <img src={qrCodeUrl} alt={`QR Code publico de ${pet.name}`} className="mx-auto h-56 w-56" />
              </div>
            ) : null}
          </section>

          <section className="glass-panel px-6 py-6">
            <span className="eyebrow">Zona de risco</span>
            <h2 className="mt-3 text-xl font-semibold">Excluir cadastro</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Esta acao remove o registro do pet no back-end e revalida as telas principais.
            </p>

            <form action={deleteAction} className="mt-5">
              <SubmitButton variant="danger">Excluir pet</SubmitButton>
            </form>
          </section>
        </div>
      </section>
    </div>
  );
}
