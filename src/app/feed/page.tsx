import { PetFeed } from "@/components/pet-feed";
import { getSessionToken } from "@/lib/api";
import { getPets, type Pet } from "@/lib/pets";
import { getPetNews, type PetNews } from "@/lib/pet-news";

export default async function FeedPage() {
  let pets: Pet[] = [];
  let news: PetNews[] = [];
  let errorMessage = "";
  const isLoggedIn = Boolean(await getSessionToken());

  if (isLoggedIn) {
    try {
      pets = await getPets();
    } catch {
      pets = [];
    }
  }

  try {
    news = await getPetNews({ page: 1, limit: 20, published: true });
  } catch (error) {
    news = [];
    errorMessage = error instanceof Error ? error.message : "Nao foi possivel carregar o feed.";
  }

  return <PetFeed pets={pets} news={news} errorMessage={errorMessage} isLoggedIn={isLoggedIn} />;
}
