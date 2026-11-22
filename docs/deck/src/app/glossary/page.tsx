import { loadGlossary } from "@/lib/content";
import GlossaryView from "@/components/GlossaryView";

export default function GlossaryPage() {
  return <GlossaryView groups={loadGlossary()} />;
}
