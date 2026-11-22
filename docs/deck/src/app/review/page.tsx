import { Review } from "@/components/Review";
import { allTags, loadCards } from "@/lib/content";

export default function ReviewPage() {
  const cards = loadCards();
  return <Review cards={cards} tags={allTags(cards)} />;
}
