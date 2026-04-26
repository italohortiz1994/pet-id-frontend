import Link from "next/link";
import { FriendshipResponseForm } from "@/components/friendship-response-form";
import { FriendSuggestionsList } from "@/components/friend-suggestions-list";
import { getPets, type Pet } from "@/lib/pets";
import {
  getFriendSuggestions,
  getPetFriendships,
  type FriendSuggestion,
  type PetFriendship,
} from "@/lib/pet-social";

function initials(name: string) {
  return name
    .split(" ")
    .map((chunk) => chunk[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function statusLabel(status: string) {
  const normalized = status.toLowerCase();

  if (normalized === "accepted") {
    return "Amigos";
  }

  if (normalized === "rejected") {
    return "Recusado";
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

function friendTitle(friendship: PetFriendship, ownedPetIds: Set<string>) {
  const isRequester = ownedPetIds.has(friendship.requesterPetId);
  const myPet = isRequester ? friendship.requesterPetName : friendship.addresseePetName;
  const friendPet = isRequester ? friendship.addresseePetName : friendship.requesterPetName;

  return {
    myPet,
    friendPet,
  };
}

function FriendCard({
  friendship,
  ownedPetIds,
}: {
  friendship: PetFriendship;
  ownedPetIds: Set<string>;
}) {
  const { friendPet, myPet } = friendTitle(friendship, ownedPetIds);

  return (
    <article className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4">
      <div className="flex items-center gap-3">
        <div className="feed-avatar feed-avatar--small">{initials(friendPet)}</div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{friendPet}</p>
          <p className="truncate text-sm text-[var(--muted)]">Amigo de {myPet}</p>
        </div>
        <span className="status-pill">{statusLabel(friendship.status)}</span>
      </div>
    </article>
  );
}

function RequestCard({
  friendship,
  ownedPetIds,
  action,
}: {
  friendship: PetFriendship;
  ownedPetIds: Set<string>;
  action?: "respond";
}) {
  const { friendPet, myPet } = friendTitle(friendship, ownedPetIds);

  return (
    <article className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="feed-avatar feed-avatar--small">{initials(friendPet)}</div>
          <div className="min-w-0">
            <h3 className="truncate font-semibold">{friendPet}</h3>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              {action === "respond" ? "quer ser amigo de" : "convite enviado por"} {myPet}
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">{formatDate(friendship.createdAt)}</p>
          </div>
        </div>
        <span className="status-pill">{statusLabel(friendship.status)}</span>
      </div>
      {action === "respond" ? <FriendshipResponseForm friendshipId={friendship.id} /> : null}
    </article>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[22px] border border-dashed border-white/15 bg-white/[0.035] p-5 text-sm leading-6 text-[var(--muted)]">
      {children}
    </div>
  );
}

export default async function AmigosPage() {
  let pets: Pet[] = [];
  let friendships: PetFriendship[] = [];
  let friendSuggestions: FriendSuggestion[] = [];
  let errorMessage = "";

  try {
    pets = await getPets();
  } catch {
    pets = [];
  }

  try {
    const ownedPetIds = new Set(pets.map((pet) => pet.id));
    const results = await getPetFriendships();
    const byId = new Map<string, PetFriendship>();

    for (const friendship of results) {
      if (
        ownedPetIds.has(friendship.requesterPetId) ||
        ownedPetIds.has(friendship.addresseePetId)
      ) {
        byId.set(friendship.id, friendship);
      }
    }

    friendships = [...byId.values()];
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Nao foi possivel carregar os amigos.";
  }

  try {
    friendSuggestions = await getFriendSuggestions(pets);
  } catch {
    friendSuggestions = [];
  }

  const ownedPetIds = new Set(pets.map((pet) => pet.id));
  const pendingReceived = friendships.filter((friendship) => {
    return friendship.status === "pending" && ownedPetIds.has(friendship.addresseePetId);
  });
  const pendingSent = friendships.filter((friendship) => {
    return friendship.status === "pending" && ownedPetIds.has(friendship.requesterPetId);
  });
  const accepted = friendships.filter((friendship) => friendship.status === "accepted");

  return (
    <div className="space-y-5">
      <section className="glass-panel px-6 py-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="eyebrow">Amigos pets</span>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">Amigos</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Veja seus amigos, responda convites e encontre usuarios cadastrados.
            </p>
          </div>
          <Link className="button-primary" href="/feed">
            Ver feed
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <div className="feed-stat">
            <span>Amigos</span>
            <strong>{accepted.length}</strong>
          </div>
          <div className="feed-stat">
            <span>Recebidas</span>
            <strong>{pendingReceived.length}</strong>
          </div>
          <div className="feed-stat">
            <span>Enviadas</span>
            <strong>{pendingSent.length}</strong>
          </div>
          <div className="feed-stat">
            <span>Usuarios</span>
            <strong>{friendSuggestions.length}</strong>
          </div>
        </div>

        {errorMessage ? (
          <div className="mt-6 rounded-3xl border border-red-300/20 bg-red-500/10 p-4 text-sm text-red-100">
            {errorMessage}
          </div>
        ) : null}
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.38fr_1fr]">
        <aside className="space-y-5">
          <section className="glass-panel px-6 py-6">
            <span className="eyebrow">Perfil</span>
            <h2 className="mt-3 text-xl font-semibold">Meus pets</h2>
            <div className="mt-5 space-y-3">
              {pets.length === 0 ? (
                <EmptyState>
                  Cadastre um pet para enviar convites e seguir outros usuarios.
                </EmptyState>
              ) : null}
              {pets.map((pet) => (
                <article key={pet.id} className="flex items-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.045] p-4">
                  <div className="feed-avatar feed-avatar--small">{initials(pet.name)}</div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{pet.name}</p>
                    <p className="truncate text-sm text-[var(--muted)]">{pet.breed}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="glass-panel px-6 py-6">
            <span className="eyebrow">Convites</span>
            <h2 className="mt-3 text-xl font-semibold">Recebidos</h2>
            <div className="mt-5 space-y-3">
              {pendingReceived.length === 0 ? (
                <EmptyState>Nenhum convite recebido.</EmptyState>
              ) : null}
              {pendingReceived.map((friendship) => (
                <RequestCard
                  key={friendship.id}
                  friendship={friendship}
                  ownedPetIds={ownedPetIds}
                  action="respond"
                />
              ))}
            </div>
          </section>
        </aside>

        <div className="space-y-5">
          <section className="glass-panel px-6 py-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="eyebrow">Conexoes</span>
                <h2 className="mt-3 text-xl font-semibold">Todos os amigos</h2>
              </div>
              <span className="status-pill">{accepted.length}</span>
            </div>

            {accepted.length === 0 ? (
              <div className="mt-5">
                <EmptyState>Suas amizades aceitas aparecem aqui.</EmptyState>
              </div>
            ) : null}

            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {accepted.map((friendship) => (
                <FriendCard
                  key={friendship.id}
                  friendship={friendship}
                  ownedPetIds={ownedPetIds}
                />
              ))}
            </div>
          </section>

          <section className="glass-panel px-6 py-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="eyebrow">Convites</span>
                <h2 className="mt-3 text-xl font-semibold">Enviados</h2>
              </div>
              <span className="status-pill">{pendingSent.length}</span>
            </div>

            {pendingSent.length === 0 ? (
              <div className="mt-5">
                <EmptyState>Nenhum convite enviado.</EmptyState>
              </div>
            ) : null}

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {pendingSent.map((friendship) => (
                <RequestCard
                  key={friendship.id}
                  friendship={friendship}
                  ownedPetIds={ownedPetIds}
                />
              ))}
            </div>
          </section>

          <FriendSuggestionsList
            suggestions={friendSuggestions}
            hasPets={pets.length > 0}
            eyebrow="Sugestoes"
            title="Todos os usuarios cadastrados"
          />
        </div>
      </section>
    </div>
  );
}
