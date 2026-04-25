"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { createPetNewsAction, type PetNewsFormState } from "@/app/feed/actions";
import type { PetNews } from "@/lib/pet-news";
import type { Pet } from "@/lib/pets";

type FriendPet = {
  id: string;
  name: string;
  breed: string;
  status: string;
};

type PetFeedProps = {
  pets: Pet[];
  news: PetNews[];
  errorMessage?: string;
};

const fallbackPets: Pet[] = [
  {
    id: "sample-thor",
    name: "Thor",
    breed: "Labrador",
    age: 2,
    gender: "M",
    publicId: "",
    qrCodeUrl: "",
    ownerId: "",
    raw: {},
  },
  {
    id: "sample-luna",
    name: "Luna",
    breed: "SRD",
    age: 4,
    gender: "F",
    publicId: "",
    qrCodeUrl: "",
    ownerId: "",
    raw: {},
  },
  {
    id: "sample-mel",
    name: "Mel",
    breed: "Pinscher",
    age: 1,
    gender: "F",
    publicId: "",
    qrCodeUrl: "",
    ownerId: "",
    raw: {},
  },
];

const initialFormState: PetNewsFormState = {
  message: "",
  errors: {},
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

function buildFriends(pets: Pet[]): FriendPet[] {
  return pets.slice(0, 5).map((pet, index) => ({
    id: `friend-${pet.id}`,
    name: pet.name,
    breed: pet.breed,
    status: index % 2 === 0 ? "Disponivel para brincar" : "Perfil verificado",
  }));
}

function formatNewsDate(value: string) {
  if (!value) {
    return "Agora";
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

export function PetFeed({ pets, news, errorMessage = "" }: PetFeedProps) {
  const sourcePets = pets.length > 0 ? pets : fallbackPets;
  const friends = useMemo(() => buildFriends(sourcePets), [sourcePets]);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [content, setContent] = useState("");
  const [state, formAction, isPending] = useActionState(createPetNewsAction, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
    }
  }, [state.ok]);

  function toggleLike(postId: string) {
    setLikedPosts((current) => ({
      ...current,
      [postId]: !current[postId],
    }));
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_0.38fr]">
      <section className="space-y-5">
        <div className="glass-panel px-6 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <span className="eyebrow">Feed social</span>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight">Noticias dos pets</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                Acompanhe novidades, registros importantes e momentos da comunidade.
              </p>
            </div>
            <span className="status-pill">{news.length} noticias</span>
          </div>

          {errorMessage ? (
            <div className="mt-6 rounded-3xl border border-red-300/20 bg-red-500/10 p-4 text-sm text-red-100">
              {errorMessage}
            </div>
          ) : null}

          <form ref={formRef} action={formAction} className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="grid gap-4 md:grid-cols-[1fr_0.7fr]">
              <label>
                <span className="field-label">Titulo</span>
                <input className="field" name="title" placeholder="Ex: Vacina atualizada" />
                {state.errors.title ? <p className="field-error">{state.errors.title}</p> : null}
              </label>
              <label>
                <span className="field-label">Categoria</span>
                <input
                  className="field"
                  name="category"
                  placeholder="Saude, passeio, rotina..."
                  defaultValue="Novidade"
                />
              </label>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-[1fr_0.7fr]">
              <label>
                <span className="field-label">Pet relacionado</span>
                <select className="field" name="petId" defaultValue="">
                  <option value="">Sem pet especifico</option>
                  {pets.map((pet) => (
                    <option key={pet.id} value={pet.id}>
                      {pet.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="field-label">Imagem</span>
                <input className="field" name="imageUrl" placeholder="https://..." type="url" />
              </label>
            </div>

            <label className="mt-4 block">
              <span className="field-label">Nova noticia</span>
              <textarea
                className="field min-h-28"
                name="content"
                maxLength={280}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Compartilhe uma atualizacao do pet, um passeio, vacina ou conquista."
              />
              {state.errors.content ? <p className="field-error">{state.errors.content}</p> : null}
            </label>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className={state.message && !state.ok ? "field-error" : "helper-text"}>
                {state.message || `${content.length}/280 caracteres`}
              </p>
              <button className="button-primary" type="submit" disabled={isPending}>
                {isPending ? "Publicando..." : "Publicar"}
              </button>
            </div>
          </form>
        </div>

        {news.length === 0 ? (
          <article className="glass-panel px-6 py-6">
            <div className="flex items-start gap-4">
              <div className="feed-avatar">ID</div>
              <div>
                <h2 className="text-xl font-semibold">Nenhuma noticia publicada</h2>
                <p className="mt-3 leading-7 text-slate-100">
                  As proximas novidades publicadas aparecem aqui.
                </p>
              </div>
            </div>
          </article>
        ) : null}

        {news.map((post) => {
          const liked = Boolean(likedPosts[post.id]);
          const likeCount = liked ? post.likes + 1 : post.likes;

          return (
            <article key={post.id} className="glass-panel px-6 py-6">
              <div className="flex items-start gap-4">
                <div className="feed-avatar">{initials(post.petName)}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">{post.title}</h2>
                      <p className="text-sm text-[var(--muted)]">
                        {post.petName}
                        {post.petBreed ? ` | ${post.petBreed}` : ""} | {formatNewsDate(post.createdAt)}
                      </p>
                    </div>
                    <span className="status-pill">{post.category}</span>
                  </div>

                  <p className="mt-4 leading-7 text-slate-100">{post.content}</p>

                  {post.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.imageUrl}
                      alt=""
                      className="mt-5 max-h-96 w-full rounded-3xl border border-white/10 object-cover"
                    />
                  ) : null}

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="feed-stat">
                      <span>Curtidas</span>
                      <strong>{likeCount}</strong>
                    </div>
                    <div className="feed-stat">
                      <span>Comentarios</span>
                      <strong>{post.comments}</strong>
                    </div>
                    <div className="feed-stat">
                      <span>Alcance</span>
                      <strong>{120 + likeCount * 3}</strong>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      className={liked ? "button-primary" : "button-secondary"}
                      type="button"
                      onClick={() => toggleLike(post.id)}
                    >
                      {liked ? "Curtido" : "Curtir"}
                    </button>
                    <button className="button-secondary" type="button">
                      Comentar
                    </button>
                    <button className="button-secondary" type="button">
                      Adicionar amigo
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <aside className="space-y-5">
        <section className="glass-panel px-6 py-6">
          <span className="eyebrow">Amigos pets</span>
          <h2 className="mt-3 text-xl font-semibold">Sugestoes</h2>
          <div className="mt-5 space-y-4">
            {friends.map((friend) => (
              <article key={friend.id} className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="feed-avatar feed-avatar--small">{initials(friend.name)}</div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{friend.name}</p>
                  <p className="truncate text-sm text-[var(--muted)]">{friend.breed}</p>
                  <p className="mt-1 text-xs text-[var(--accent-2)]">{friend.status}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="glass-panel px-6 py-6">
          <span className="eyebrow">Resumo</span>
          <h2 className="mt-3 text-xl font-semibold">Atividade social</h2>
          <div className="mt-5 grid gap-3">
            <div className="feed-stat">
              <span>Noticias</span>
              <strong>{news.length}</strong>
            </div>
            <div className="feed-stat">
              <span>Amigos sugeridos</span>
              <strong>{friends.length}</strong>
            </div>
            <div className="feed-stat">
              <span>Curtidas totais</span>
              <strong>{news.reduce((total, post) => total + post.likes, 0)}</strong>
            </div>
          </div>
        </section>
      </aside>
    </div>
  );
}
