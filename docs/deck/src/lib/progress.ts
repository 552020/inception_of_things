"use client";
import { createEmptyCard, fsrs, generatorParameters, Rating, type Card as FsrsCard, type Grade } from "ts-fsrs";

// Progress lives on the server, one file per user (see lib/store.ts).
// localStorage keeps a copy so the page opens without waiting, and is the
// source for a one-time migration of progress made before the login existed.
const KEY = "iot-deck-progress-v1";
export type Stored = Record<string, FsrsCard>;

const scheduler = fsrs(generatorParameters({ enable_fuzz: true }));

function revive(parsed: Stored): Stored {
  for (const card of Object.values(parsed)) {
    card.due = new Date(card.due);
    if (card.last_review) card.last_review = new Date(card.last_review);
  }
  return parsed;
}

function readLocal(): Stored {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? revive(JSON.parse(raw) as Stored) : {};
  } catch {
    return {};
  }
}

function writeLocal(store: Stored) {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    // storage unavailable: the server copy is the one that counts
  }
}

async function push(store: Stored): Promise<void> {
  await fetch("/api/progress", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(store),
  });
}

/** Server copy, falling back to the local one; migrates local progress to an empty server file once. */
export async function loadProgress(): Promise<Stored> {
  const local = readLocal();
  try {
    const res = await fetch("/api/progress", { cache: "no-store" });
    if (!res.ok) return local;
    const data = (await res.json()) as { progress: Stored };
    const server = revive(data.progress ?? {});
    if (Object.keys(server).length === 0 && Object.keys(local).length > 0) {
      await push(local);
      return local;
    }
    writeLocal(server);
    return server;
  } catch {
    return local;
  }
}

export function stateOf(store: Stored, id: string): FsrsCard {
  return store[id] ?? createEmptyCard(new Date());
}

export function isDue(card: FsrsCard, now: Date): boolean {
  return card.due.getTime() <= now.getTime();
}

export function isNew(card: FsrsCard): boolean {
  return card.reps === 0;
}

export function grade(store: Stored, id: string, rating: Grade, now: Date): Stored {
  const current = stateOf(store, id);
  const result = scheduler.next(current, now, rating);
  const next = { ...store, [id]: result.card };
  writeLocal(next);
  void push(next);
  return next;
}

export async function resetProgress(): Promise<void> {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // nothing to remove
  }
  await push({});
}

export const ratings = [
  { rating: Rating.Again as Grade, label: "Again" },
  { rating: Rating.Hard as Grade, label: "Hard" },
  { rating: Rating.Good as Grade, label: "Good" },
  { rating: Rating.Easy as Grade, label: "Easy" },
];
