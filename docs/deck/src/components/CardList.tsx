"use client";
import { useMemo, useState } from "react";
import type { Card } from "@/lib/content";
import { TagFilter } from "./TagFilter";

export function CardList({ cards, tags }: { cards: Card[]; tags: string[] }) {
  const [tag, setTag] = useState<string | null>(null);
  const shown = useMemo(() => (tag ? cards.filter((c) => c.tags.includes(tag)) : cards), [cards, tag]);
  return (
    <div className="flex flex-col gap-4">
      <TagFilter tags={tags} selected={tag} onChange={setTag} />
      <p className="text-sm text-muted">
        {shown.length} cards ·{" "}
        <a className="underline" href={`/cards/download?format=anki${tag ? `&tag=${encodeURIComponent(tag)}` : ""}`}>
          download for Anki
        </a>{" "}
        ·{" "}
        <a className="underline" href="/cards/download?format=md">
          download as Markdown
        </a>
      </p>
      <ul className="flex flex-col gap-2">
        {shown.map((card) => (
          <li key={card.id} id={card.id}>
            <details className="rounded-lg border border-line bg-surface">
              <summary className="cursor-pointer list-none px-4 py-3 font-medium leading-snug">
                {card.front}
                <span className="block mt-1 text-xs font-normal text-muted">{card.tags.join(" · ")}</span>
              </summary>
              <div className="prose px-4 pb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: card.back }} />
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}
