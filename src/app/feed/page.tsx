import { PetFeed } from "@/components/pet-feed";
import { getPets, type Pet } from "@/lib/pets";

export default async function FeedPage() {
  let pets: Pet[] = [];

  try {
    pets = await getPets();
  } catch {
    pets = [];
  }

  return <PetFeed pets={pets} />;
}
