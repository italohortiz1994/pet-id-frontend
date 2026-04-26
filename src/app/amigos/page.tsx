import Link from "next/link";
import { FriendshipResponseForm } from "@/components/friendship-response-form";
import { getPets, type Pet } from "@/lib/pets";
import { getPetFriendships, type PetFriendship } from "@/lib/pet-social";

function statusLabel(status: string) {
  const normalized = status.toLowerCase();

  if (normalized === "accepted") {
    return "Aceita";
  }

  if (normalized === "rejected") {
    return "Recusada";
  }

  return "Pendente";
}

function formatDate(value: string) {
  if (!value) {
    return "Sem data";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function AmigosPage() {
  let pets: Pet[] = [];
  let friendships: PetFriendship[] = [];
  let errorMessage = "";

  try {
    pets = await getPets();
  } catch {
    pets = [];
  }

  try {
    const results = await Promise.all(pets.map((pet) => getPetFriendships({ petId: pet.id })));
    const byId = new Map<string, PetFriendship>();

    for (const friendship of results.flat()) {
      byId.set(friendship.id, friendship);
    }

    friendships = [...byId.values()];
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Nao foi possivel carregar os amigos.";
  }

  const ownedPetIds = new Set(pets.map((pet) => pet.id));
  const pendingReceived = friendships.filter((friendship) => {
    return friendship.status === "pending" && ownedPetIds.has(friendship.addresseePetId);
  });
  const pendingSent = friendships.filter((friendship) => {
    return friendship.status === "pending" && ownedPetIds.has(friendship.requesterPetId);
  });
  const accepted = friendships.filter((friendship) => friendship.status === "accepted");
  const rejected = friendships.filter((friendship) => friendship.status === "rejected");

  return (
    <div className="space-y-5">
      <section className="glass-panel px-6 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="eyebrow">Amigos pets</span>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">Convites e amizades</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Acompanhe os pedidos enviados entre pets e o status de cada amizade.
            </p>
          </div>
          <Link className="button-primary" href="/feed">
            Ver feed
          </Link>
        </div>

        {errorMessage ? (
          <div className="mt-6 rounded-3xl border border-red-300/20 bg-red-500/10 p-4 text-sm text-red-100">
            {errorMessage}
          </div>
        ) : null}
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.35fr_1fr]">
        <aside className="glass-panel px-6 py-6">
          <span className="eyebrow">Meus pets</span>
          <div className="mt-5 space-y-3">
            {pets.length === 0 ? (
              <p className="text-sm leading-6 text-[var(--muted)]">
                Cadastre um pet para enviar convites de amizade pelo feed.
              </p>
            ) : null}
            {pets.map((pet) => (
              <article key={pet.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold">{pet.name}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{pet.breed}</p>
              </article>
            ))}
          </div>
        </aside>

        <div className="space-y-5">
          {friendships.length === 0 ? (
            <article className="glass-panel px-6 py-6">
              <h2 className="text-xl font-semibold">Nenhum convite ainda</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                Use o feed para enviar convites entre pets vinculados a publicacoes.
              </p>
            </article>
          ) : null}

          <FriendshipSection
            title="Solicitacoes recebidas"
            emptyText="Nenhuma solicitacao recebida."
            friendships={pendingReceived}
            action="respond"
          />
          <FriendshipSection
            title="Solicitacoes enviadas"
            emptyText="Nenhuma solicitacao enviada."
            friendships={pendingSent}
          />
          <FriendshipSection
            title="Amizades aceitas"
            emptyText="Nenhuma amizade aceita ainda."
            friendships={accepted}
          />
          <FriendshipSection
            title="Solicitacoes recusadas"
            emptyText="Nenhuma solicitacao recusada."
            friendships={rejected}
          />
        </div>
      </section>
    </div>
  );
}

function FriendshipSection({
  title,
  emptyText,
  friendships,
  action,
}: {
  title: string;
  emptyText: string;
  friendships: PetFriendship[];
  action?: "respond";
}) {
  return (
    <section className="glass-panel px-6 py-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <span className="status-pill">{friendships.length}</span>
      </div>

      {friendships.length === 0 ? (
        <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{emptyText}</p>
      ) : null}

      <div className="mt-5 space-y-4">
        {friendships.map((friendship) => (
          <article key={friendship.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  {friendship.requesterPetName} pediu amizade para {friendship.addresseePetName}
                </h3>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Criado em {formatDate(friendship.createdAt)}
                </p>
              </div>
              <span className="status-pill">{statusLabel(friendship.status)}</span>
            </div>
            {action === "respond" ? <FriendshipResponseForm friendshipId={friendship.id} /> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
