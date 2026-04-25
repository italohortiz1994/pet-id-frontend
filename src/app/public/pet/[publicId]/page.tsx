/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { RecordDetails } from "@/components/record-details";
import { ApiError } from "@/lib/api";
import { getPetIdentity, type PetIdentity } from "@/lib/pets";
import { getPublicPet } from "@/lib/public-pets";

type PublicPetPageProps = {
  params: Promise<{ publicId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function getPublicUrl(publicId: string) {
  const headerStore = await headers();
  const host = headerStore.get("host") ?? "localhost:3000";
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";
  return `${protocol}://${host}/public/pet/${publicId}`;
}

export default async function PublicPetPage(props: PublicPetPageProps) {
  const { publicId } = await props.params;
  const searchParams = await props.searchParams;
  let pet;
  let identity: PetIdentity | null = null;
  let identityError = "";

  try {
    pet = await getPublicPet(publicId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }

  const petIdFromQuery = typeof searchParams.petId === "string" ? searchParams.petId : "";
  const petId = pet.petId || petIdFromQuery;

  if (petId) {
    try {
      identity = await getPetIdentity(petId, false);
    } catch (error) {
      identityError = error instanceof Error ? error.message : "Nao foi possivel carregar a identidade publica.";
    }
  }

  const publicUrl = await getPublicUrl(publicId);
  const qrCodeUrl =
    identity?.qrCodeUrl ||
    pet.qrCodeUrl ||
    `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(publicUrl)}`;

  return (
    <div className="space-y-5">
      <section className="glass-panel px-6 py-6 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <span className="eyebrow">Perfil publico</span>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">{pet.name}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Informacoes publicas retornadas pela API para identificacao do pet.
            </p>
          </div>

          <Link href="/login" className="button-secondary">
            Area do tutor
          </Link>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="glass-panel px-6 py-6">
          <span className="eyebrow">QR Code</span>
          <h2 className="mt-3 text-xl font-semibold">Acesso rapido</h2>
          <div className="mt-6 rounded-3xl border border-white/10 bg-white p-4">
            <img src={qrCodeUrl} alt={`QR Code publico de ${pet.name}`} className="mx-auto h-60 w-60" />
          </div>
          <p className="mt-4 break-words text-sm text-[var(--muted)]">{publicUrl}</p>
          {petId ? <p className="mt-3 break-words text-xs text-[var(--muted)]">Pet ID: {petId}</p> : null}
        </aside>

        <section className="glass-panel px-6 py-6">
          <span className="eyebrow">Dados publicos</span>
          <h2 className="mt-3 text-xl font-semibold">Informacoes de public/pet</h2>
          <div className="mt-6">
            <RecordDetails data={pet.raw} hiddenKeys={["qrcodeurl", "qrcode", "qrurl"]} />
          </div>
        </section>
      </section>

      <section className="glass-panel px-6 py-6">
        <span className="eyebrow">Identidade</span>
        <h2 className="mt-3 text-xl font-semibold">Informacoes de pet-identity</h2>
        <div className="mt-6">
          {!petId ? (
            <p className="text-sm text-[var(--muted)]">
              A API publica nao retornou o petId. Abra esta pagina pelo detalhe do pet para combinar com a rota de identidade.
            </p>
          ) : identityError ? (
            <p className="text-sm text-amber-100">{identityError}</p>
          ) : (
            <RecordDetails data={identity?.raw} hiddenKeys={["qrcodeurl", "qrcode", "qrurl"]} />
          )}
        </div>
      </section>
    </div>
  );
}
