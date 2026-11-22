import { readFileSync } from "node:fs";
import path from "node:path";
import { marked } from "marked";

export type DeskEntry = { group: string; slug: string; title: string };
export type LabEntry = { slug: string; title: string };
export type Kind = "desk" | "lab";

const contentDir = path.join(process.cwd(), "content");

function manifest(): { desk: DeskEntry[]; lab: LabEntry[] } {
  return JSON.parse(readFileSync(path.join(contentDir, "library.json"), "utf8"));
}

export function deskGroups(): { group: string; entries: DeskEntry[] }[] {
  const groups: { group: string; entries: DeskEntry[] }[] = [];
  for (const entry of manifest().desk) {
    let g = groups.find((x) => x.group === entry.group);
    if (!g) groups.push((g = { group: entry.group, entries: [] }));
    g.entries.push(entry);
  }
  return groups;
}

export function labEntries(): LabEntry[] {
  return manifest().lab;
}

/** Title, raw Markdown and rendered body (without the first H1, which the page shows as its title). */
export function loadDocument(kind: Kind, slug: string): { title: string; markdown: string; html: string } | null {
  const entry = manifest()[kind].find((e) => e.slug === slug);
  if (!entry) return null;
  const markdown = readFileSync(path.join(contentDir, kind, `${slug}.md`), "utf8");
  const lines = markdown.split("\n");
  const firstText = lines.findIndex((l) => l.trim() !== "");
  const body = firstText >= 0 && /^#\s/.test(lines[firstText]) ? lines.slice(firstText + 1).join("\n") : markdown;
  return { title: entry.title, markdown, html: marked.parse(body, { gfm: true, async: false }) as string };
}
