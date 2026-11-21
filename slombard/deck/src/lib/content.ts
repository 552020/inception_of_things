import { readFileSync } from "node:fs";
import path from "node:path";
import { blocks, inline, slug } from "./markdown";

export type Card = { id: string; front: string; back: string; tags: string[] };
export type GlossaryEntry = { term: string; definition: string };
export type GlossaryGroup = { title: string; entries: GlossaryEntry[] };

const contentDir = path.join(process.cwd(), "content");

function read(file: string): string {
  return readFileSync(path.join(contentDir, file), "utf8");
}

export function loadCards(): Card[] {
  const lines = read("cards.md").split("\n");
  const cards: Card[] = [];
  let current: { front: string; body: string[]; tags: string[] } | null = null;
  const flush = () => {
    if (!current) return;
    cards.push({
      id: slug(current.front),
      front: current.front,
      back: blocks(current.body),
      tags: current.tags,
    });
    current = null;
  };
  for (const line of lines) {
    const heading = line.match(/^###\s+(.*)$/);
    if (heading) {
      flush();
      current = { front: heading[1].trim(), body: [], tags: [] };
      continue;
    }
    if (!current) continue;
    const tags = line.match(/^tags:\s*(.*)$/);
    if (tags) {
      current.tags = tags[1].split(/\s+/).filter(Boolean);
      continue;
    }
    current.body.push(line);
  }
  flush();
  return cards;
}

export function allTags(cards: Card[]): string[] {
  const count = new Map<string, number>();
  for (const card of cards) for (const tag of card.tags) count.set(tag, (count.get(tag) ?? 0) + 1);
  return [...count.keys()].sort();
}

export function loadGlossary(): GlossaryGroup[] {
  const lines = read("glossary.md").split("\n");
  const groups: GlossaryGroup[] = [];
  let group: GlossaryGroup | null = null;
  for (const line of lines) {
    const heading = line.match(/^##\s+(.*)$/);
    if (heading) {
      group = { title: heading[1].trim(), entries: [] };
      groups.push(group);
      continue;
    }
    if (!group) continue;
    const entry = line.match(/^\*\*(.+?)\*\*\s+(.*)$/);
    if (entry) {
      group.entries.push({ term: entry[1], definition: inline(entry[2]) });
      continue;
    }
    const command = line.match(/^`([^`]+)`\s+(.*)$/);
    if (command) {
      group.entries.push({ term: command[1], definition: inline(command[2]) });
    }
  }
  return groups;
}
