import { PetFeed } from "@/components/pet-feed";
import { getSessionToken } from "@/lib/api";
import { getPets, type Pet } from "@/lib/pets";
import { getPetNews, type PetNews } from "@/lib/pet-news";
import {
  getFriendSuggestions,
  getPetComments,
  type FriendSuggestion,
  type PetComment,
} from "@/lib/pet-social";

export default async function FeedPage() {
  let pets: Pet[] = [];
  let news: PetNews[] = [];
  let commentsByNewsId: Record<string, PetComment[]> = {};
  let friendSuggestions: FriendSuggestion[] = [];
  let errorMessage = "";
  const isLoggedIn = Boolean(await getSessionToken());

  if (isLoggedIn) {
    try {
      pets = await getPets();
      friendSuggestions = await getFriendSuggestions(pets);
    } catch {
      pets = [];
      friendSuggestions = [];
    }
  }

  try {
    news = await getPetNews({ page: 1, limit: 20, published: true });
    commentsByNewsId = Object.fromEntries(
      await Promise.all(news.map(async (item) => [item.id, await getPetComments(item.id)] as const)),
    );
  } catch (error) {
    news = [];
    commentsByNewsId = {};
    errorMessage = error instanceof Error ? error.message : "Nao foi possivel carregar o feed.";
  }

  return (
    <PetFeed
      pets={pets}
      news={news}
      commentsByNewsId={commentsByNewsId}
      friendSuggestions={friendSuggestions}
      errorMessage={errorMessage}
      isLoggedIn={isLoggedIn}
    />
  );
}
