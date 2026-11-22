import { userNames } from "@/lib/auth";
import { allTags, loadCards, type Card } from "@/lib/content";
import { readProgress } from "@/lib/store";

export const dynamic = "force-dynamic";

// FSRS card state: 0 New, 1 Learning, 2 Review, 3 Relearning
type FsrsLike = { state?: number; reps?: number; due?: string; last_review?: string; lapses?: number };

type Stats = {
  seen: number;
  learning: number;
  review: number;
  due: number;
  reviews: number;
  lapses: number;
  last: Date | null;
  byTag: Map<string, number>;
};

function stats(cards: Card[], progress: Record<string, unknown>, now: Date): Stats {
  const s: Stats = { seen: 0, learning: 0, review: 0, due: 0, reviews: 0, lapses: 0, last: null, byTag: new Map() };
  for (const card of cards) {
    const p = progress[card.id] as FsrsLike | undefined;
    if (!p || !p.reps) continue;
    s.seen += 1;
    s.reviews += p.reps;
    s.lapses += p.lapses ?? 0;
    if (p.state === 2) s.review += 1;
    else s.learning += 1;
    if (p.due && new Date(p.due).getTime() <= now.getTime()) s.due += 1;
    if (p.last_review) {
      const d = new Date(p.last_review);
      if (!s.last || d > s.last) s.last = d;
    }
    for (const tag of card.tags) s.byTag.set(tag, (s.byTag.get(tag) ?? 0) + 1);
  }
  return s;
}

function when(d: Date | null): string {
  if (!d) return "never";
  return d.toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default async function ProgressPage() {
  const cards = loadCards();
  const tags = allTags(cards);
  const names = userNames();
  const now = new Date();
  const rows = await Promise.all(
    names.map(async (name) => ({ name, stats: stats(cards, await readProgress(name), now) })),
  );
  const perTag = new Map(tags.map((t) => [t, cards.filter((c) => c.tags.includes(t)).length]));

  const lines: { label: string; value: (s: Stats) => string }[] = [
    { label: `Cards seen (of ${cards.length})`, value: (s) => `${s.seen}` },
    { label: "In review (known)", value: (s) => `${s.review}` },
    { label: "Still learning", value: (s) => `${s.learning}` },
    { label: "Due now", value: (s) => `${s.due}` },
    { label: "Answers given", value: (s) => `${s.reviews}` },
    { label: "Forgotten again", value: (s) => `${s.lapses}` },
    { label: "Last review", value: (s) => when(s.last) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left">
            <th className="py-2 pr-3 font-medium"></th>
            {rows.map((r) => (
              <th key={r.name} className="py-2 pr-3 font-medium capitalize">
                {r.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => (
            <tr key={line.label} className="border-b border-line">
              <td className="py-2 pr-3 text-muted">{line.label}</td>
              {rows.map((r) => (
                <td key={r.name} className="py-2 pr-3 tabular-nums">
                  {line.value(r.stats)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left">
            <th className="py-2 pr-3 font-medium">Seen by tag</th>
            {rows.map((r) => (
              <th key={r.name} className="py-2 pr-3 font-medium capitalize">
                {r.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tags.map((tag) => (
            <tr key={tag} className="border-b border-line">
              <td className="py-2 pr-3 text-muted">
                {tag} <span className="text-xs">/ {perTag.get(tag)}</span>
              </td>
              {rows.map((r) => (
                <td key={r.name} className="py-2 pr-3 tabular-nums">
                  {r.stats.byTag.get(tag) ?? 0}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
