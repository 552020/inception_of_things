"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Card } from "@/lib/content";
import { grade, isDue, isNew, loadProgress, ratings, resetProgress, stateOf, type Stored } from "@/lib/progress";
import { TagFilter } from "./TagFilter";

type Props = { cards: Card[]; tags: string[] };

export function Review(props: Props) {
  return (
    <Suspense fallback={null}>
      <ReviewInner {...props} />
    </Suspense>
  );
}

function ReviewInner({ cards, tags }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const tag = params.get("tag");

  const [store, setStore] = useState<Stored | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [sessionStart] = useState(() => new Date());

  useEffect(() => {
    let active = true;
    loadProgress().then((loaded) => {
      if (active) setStore(loaded);
    });
    return () => {
      active = false;
    };
  }, []);

  const pool = useMemo(() => (tag ? cards.filter((c) => c.tags.includes(tag)) : cards), [cards, tag]);

  const queue = useMemo(() => {
    if (!store) return [];
    const now = new Date();
    return pool.filter((c) => isDue(stateOf(store, c.id), now));
  }, [pool, store]);

  const current = queue[0];
  const newCount = store ? queue.filter((c) => isNew(stateOf(store, c.id))).length : 0;
  const dueCount = queue.length - newCount;

  function setTag(next: string | null) {
    router.replace(next ? `${pathname}?tag=${encodeURIComponent(next)}` : pathname);
    setRevealed(false);
  }

  function answer(rating: (typeof ratings)[number]["rating"]) {
    if (!store || !current) return;
    setStore(grade(store, current.id, rating, new Date()));
    setRevealed(false);
  }

  function reset() {
    if (!confirm("Delete all your review progress?")) return;
    void resetProgress();
    setStore({});
    setRevealed(false);
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <TagFilter tags={tags} selected={tag} onChange={setTag} />

      {store && (
        <p className="text-sm text-muted">
          {queue.length === 0
            ? `Done for today. ${pool.length} cards in this set, next review when a card comes due.`
            : `${dueCount} due, ${newCount} new, ${pool.length} cards in this set`}
        </p>
      )}

      {store && current && (
        <section
          className="flex-1 flex flex-col rounded-lg border border-line bg-surface"
          onClick={() => !revealed && setRevealed(true)}
        >
          <div className="p-5">
            <h2 className="text-xl font-medium leading-snug">{current.front}</h2>
            <p className="mt-2 text-xs text-muted">{current.tags.join(" · ")}</p>
          </div>
          {revealed ? (
            <div className="prose p-5 pt-0 text-[17px] leading-relaxed" dangerouslySetInnerHTML={{ __html: current.back }} />
          ) : (
            <button
              type="button"
              className="mt-auto m-5 py-4 rounded-md bg-foreground text-background text-base font-medium"
              onClick={() => setRevealed(true)}
            >
              Show answer
            </button>
          )}
        </section>
      )}

      {store && current && revealed && (
        <div className="grid grid-cols-4 gap-2 sticky bottom-4">
          {ratings.map((r) => (
            <button
              key={r.label}
              type="button"
              onClick={() => answer(r.rating)}
              className="py-4 rounded-md border border-line bg-surface text-base font-medium active:bg-foreground active:text-background"
            >
              {r.label}
            </button>
          ))}
        </div>
      )}

      {store && queue.length === 0 && (
        <p className="text-sm text-muted">
          Nothing due since {sessionStart.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}. The list of all cards is under Cards.
        </p>
      )}

      <p className="mt-auto pt-6 text-xs text-muted">
        <button type="button" onClick={reset} className="underline">
          reset progress
        </button>
      </p>
    </div>
  );
}
