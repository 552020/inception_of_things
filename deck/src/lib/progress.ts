"use client";
import { createEmptyCard, fsrs, generatorParameters, Rating, type Card as FsrsCard, type Grade } from "ts-fsrs";

const KEY = "iot-deck-progress-v1";
type Stored = Record<string, FsrsCard>;

const scheduler = fsrs(generatorParameters({ enable_fuzz: true }));

function readStore(): Stored {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Stored;
    for (const card of Object.values(parsed)) {
      card.due = new Date(card.due);
      if (card.last_review) card.last_review = new Date(card.last_review);
    }
    return parsed;
  } catch {
    return {};
  }
}

function writeStore(store: Stored) {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    // storage unavailable: progress lives for this page view only
  }
}

export function loadProgress(): Stored {
  return readStore();
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
  writeStore(next);
  return next;
}

export function resetProgress() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // nothing to remove
  }
}

export const ratings = [
  { rating: Rating.Again as Grade, label: "Again" },
  { rating: Rating.Hard as Grade, label: "Hard" },
  { rating: Rating.Good as Grade, label: "Good" },
  { rating: Rating.Easy as Grade, label: "Easy" },
];
