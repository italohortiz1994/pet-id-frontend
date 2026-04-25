import { PetFeed } from "@/components/pet-feed";
import { getPets, type Pet } from "@/lib/pets";
import { getPetNews, type PetNews } from "@/lib/pet-news";

export default async function FeedPage() {
  let pets: Pet[] = [];
  let news: PetNews[] = [];
  let errorMessage = "";

  try {
    pets = await getPets();
  } catch {
    pets = [];
  }

  try {
    news = await getPetNews({ page: 1, limit: 20 });
  } catch (error) {
    news = [];
    errorMessage = error instanceof Error ? error.message : "Nao foi possivel carregar o feed.";
  }

  return <PetFeed pets={pets} news={news} errorMessage={errorMessage} />;
}
