"use client";

import { useMemo, useState } from "react";
import type { Pet } from "@/lib/pets";

type FeedPost = {
  id: string;
  petName: string;
  breed: string;
  body: string;
  tag: string;
  likes: number;
  comments: number;
  minutesAgo: number;
};

type FriendPet = {
  id: string;
  name: string;
  breed: string;
  status: string;
};

type PetFeedProps = {
  pets: Pet[];
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

function initials(name: string) {
  return name
    .split(" ")
    .map((chunk) => chunk[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function buildPosts(pets: Pet[]): FeedPost[] {
  return pets.slice(0, 6).map((pet, index) => ({
    id: `post-${pet.id}`,
    petName: pet.name,
    breed: pet.breed,
    body:
      index % 2 === 0
        ? `${pet.name} atualizou o perfil e esta pronto para novas amizades no Pet ID.`
        : `${pet.name} registrou uma nova aventura e quer compartilhar com outros pets.`
    ,
    tag: index % 3 === 0 ? "Passeio" : index % 3 === 1 ? "Saude" : "Rotina",
    likes: 8 + index * 4,
    comments: 2 + index,
    minutesAgo: 12 + index * 9,
  }));
}

function buildFriends(pets: Pet[]): FriendPet[] {
  return pets.slice(0, 5).map((pet, index) => ({
    id: `friend-${pet.id}`,
    name: pet.name,
    breed: pet.breed,
    status: index % 2 === 0 ? "Disponivel para brincar" : "Perfil verificado",
  }));
}

export function PetFeed({ pets }: PetFeedProps) {
  const sourcePets = pets.length > 0 ? pets : fallbackPets;
  const posts = useMemo(() => buildPosts(sourcePets), [sourcePets]);
  const friends = useMemo(() => buildFriends(sourcePets), [sourcePets]);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [draft, setDraft] = useState("");

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
              <h1 className="mt-3 text-3xl font-semibold tracking-tight">Comunidade dos pets</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                Acompanhe postagens, curtidas, amigos pets e atividades importantes do perfil social.
              </p>
            </div>
            <span className="status-pill">{sourcePets.length} pets ativos</span>
          </div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4">
            <label>
              <span className="field-label">Nova postagem</span>
              <textarea
                className="field min-h-28"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Compartilhe uma atualizacao do pet, um passeio, vacina ou conquista."
              />
            </label>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="helper-text">{draft.length}/280 caracteres</p>
              <button className="button-primary" type="button" onClick={() => setDraft("")}>
                Publicar
              </button>
            </div>
          </div>
        </div>

        {posts.map((post) => {
          const liked = Boolean(likedPosts[post.id]);
          const likeCount = liked ? post.likes + 1 : post.likes;

          return (
            <article key={post.id} className="glass-panel px-6 py-6">
              <div className="flex items-start gap-4">
                <div className="feed-avatar">{initials(post.petName)}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">{post.petName}</h2>
                      <p className="text-sm text-[var(--muted)]">
                        {post.breed} | ha {post.minutesAgo} min
                      </p>
                    </div>
                    <span className="status-pill">{post.tag}</span>
                  </div>

                  <p className="mt-4 leading-7 text-slate-100">{post.body}</p>

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
                      <strong>{120 + post.likes * 3}</strong>
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
              <span>Postagens</span>
              <strong>{posts.length}</strong>
            </div>
            <div className="feed-stat">
              <span>Amigos sugeridos</span>
              <strong>{friends.length}</strong>
            </div>
            <div className="feed-stat">
              <span>Curtidas totais</span>
              <strong>{posts.reduce((total, post) => total + post.likes, 0)}</strong>
            </div>
          </div>
        </section>
      </aside>
    </div>
  );
}
