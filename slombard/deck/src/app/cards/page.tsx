import { CardList } from "@/components/CardList";
import { allTags, loadCards } from "@/lib/content";

export default function CardsPage() {
  const cards = loadCards();
  return <CardList cards={cards} tags={allTags(cards)} />;
}
