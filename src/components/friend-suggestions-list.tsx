"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  createPetFriendshipAction,
  type FeedInteractionState,
} from "@/app/feed/actions";
import type { FriendSuggestion } from "@/lib/pet-social";

const PAGE_SIZE = 9;

const initialInteractionState: FeedInteractionState = {
  message: "",
  ok: false,
};

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

  if (normalized === "pending") {
    return "Solicitacao pendente";
  }

  return "Sem pet para convite";
}

function FriendSuggestionCard({
  suggestion,
  hasPets,
}: {
  suggestion: FriendSuggestion;
  hasPets: boolean;
}) {
  const [state, action, isPending] = useActionState(
    createPetFriendshipAction,
    initialInteractionState,
  );

  return (
    <article className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4">
      <div className="flex flex-col items-center text-center">
        <div className="feed-avatar h-16 w-16 text-lg">
          {initials(suggestion.userName)}
        </div>
        <div className="mt-3 min-w-0">
          <p className="truncate font-semibold">{suggestion.userName}</p>
          <p className="mt-1 max-w-44 truncate text-sm text-[var(--muted)]">
            {suggestion.userEmail}
          </p>
        </div>
        <div className="mt-4 grid w-full grid-cols-2 gap-2 text-center">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
            <strong className="block text-lg leading-none">{suggestion.friendsCount}</strong>
            <span className="mt-1 block text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
              Amigos
            </span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
            <strong className="block text-lg leading-none">{suggestion.pets.length}</strong>
            <span className="mt-1 block text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
              Pets
            </span>
          </div>
        </div>
      </div>

      {!hasPets ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-center">
          <p className="helper-text">Cadastre um pet para enviar solicitacoes.</p>
        </div>
      ) : suggestion.canRequest ? (
        <form action={action} className="mt-4 space-y-3">
          <input
            type="hidden"
            name="requesterPetId"
            value={suggestion.requesterPetId}
          />
          <input
            type="hidden"
            name="addresseePetId"
            value={suggestion.addresseePetId}
          />
          <button className="button-primary w-full" type="submit" disabled={isPending}>
            {isPending ? "Enviando..." : "Enviar solicitação"}
          </button>
          {suggestion.targetPetName ? (
            <p className="helper-text text-center">Para {suggestion.targetPetName}.</p>
          ) : null}
          {state.message ? (
            <p className={state.ok ? "helper-text text-center" : "field-error text-center"}>
              {state.message}
            </p>
          ) : null}
        </form>
      ) : (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-center">
          <p className="helper-text">{statusLabel(suggestion.friendshipStatus)}</p>
        </div>
      )}
    </article>
  );
}

export function FriendSuggestionsList({
  suggestions,
  hasPets,
  title = "Usuarios cadastrados",
  eyebrow = "Sugestoes",
}: {
  suggestions: FriendSuggestion[];
  hasPets: boolean;
  title?: string;
  eyebrow?: string;
}) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const visibleSuggestions = suggestions.slice(0, visibleCount);
  const hasMore = visibleCount < suggestions.length;

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setVisibleCount((current) => Math.min(current + PAGE_SIZE, suggestions.length));
      }
    });

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasMore, suggestions.length]);

  return (
    <section className="glass-panel px-6 py-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h2 className="mt-3 text-xl font-semibold">{title}</h2>
        </div>
        <span className="status-pill">{suggestions.length}</span>
      </div>

      {suggestions.length === 0 ? (
        <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
          Nenhuma sugestao disponivel agora.
        </p>
      ) : null}

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visibleSuggestions.map((suggestion) => (
          <FriendSuggestionCard
            key={suggestion.userId}
            suggestion={suggestion}
            hasPets={hasPets}
          />
        ))}
      </div>

      {hasMore ? <div ref={sentinelRef} className="h-8" /> : null}
    </section>
  );
}
