"use client";

import { useEffect, useState } from "react";

type Entry = { term: string; definition: string };
type Group = { title: string; entries: Entry[] };

// Terms that get a jump link in the bar. Order is the order shown.
const KEY_TERMS = [
  "Pod",
  "Cluster",
  "Control plane",
  "Deployment",
  "Service",
  "Ingress",
  "K3s vs K3d",
  "Vagrant",
  "GitOps",
  "Argo CD",
];

function idOf(term: string) {
  return "term-" + term.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function letterOf(term: string) {
  const m = term.match(/[a-z0-9]/i);
  return m ? m[0].toUpperCase() : "#";
}

export default function GlossaryView({ groups }: { groups: Group[] }) {
  const [group, setGroup] = useState<string>("all");
  const [view, setView] = useState<"groups" | "az">("groups");
  const [target, setTarget] = useState<string | null>(null);
  const [mark, setMark] = useState<string | null>(null);

  const shown = group === "all" ? groups : groups.filter((g) => g.title === group);

  const sorted = shown.flatMap((g) => g.entries).sort((a, b) => a.term.localeCompare(b.term, "en", { sensitivity: "base" }));
  const byLetter = new Map<string, Entry[]>();
  for (const e of sorted) {
    const l = letterOf(e.term);
    byLetter.set(l, [...(byLetter.get(l) ?? []), e]);
  }
  const letters = Array.from(byLetter.keys());

  // After a jump the right group may only just have been shown; scroll once it is in the DOM.
  useEffect(() => {
    if (!target) return;
    const el = document.getElementById(target);
    if (el) {
      el.scrollIntoView({ block: target.startsWith("letter-") ? "start" : "center", behavior: "smooth" });
      if (!target.startsWith("letter-")) {
        setMark(target);
        setTimeout(() => setMark(null), 1800);
      }
      setTarget(null);
    }
  }, [target, group, view]);

  function jumpToTerm(term: string) {
    const inShown = shown.some((g) => g.entries.some((e) => e.term === term));
    if (!inShown) setGroup("all");
    setTarget(idOf(term));
  }

  const keyTerms = KEY_TERMS.filter((t) => groups.some((g) => g.entries.some((e) => e.term === t)));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 text-sm">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by group">
          <button type="button" className={`ui-chip ${group === "all" ? "ui-chip-on" : ""}`} aria-pressed={group === "all"} onClick={() => setGroup("all")}>
            All
          </button>
          {groups.map((g) => (
            <button key={g.title} type="button" className={`ui-chip ${group === g.title ? "ui-chip-on" : ""}`} aria-pressed={group === g.title} onClick={() => setGroup(g.title)}>
              {g.title}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="text-muted">Key terms</span>
          {keyTerms.map((t) => (
            <a key={t} href={`#${idOf(t)}`} className="underline underline-offset-2" onClick={(e) => { e.preventDefault(); jumpToTerm(t); }}>
              {t}
            </a>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="text-muted">Order</span>
          <button type="button" className={view === "groups" ? "font-medium underline underline-offset-2" : "text-muted"} aria-pressed={view === "groups"} onClick={() => setView("groups")}>
            By group
          </button>
          <button type="button" className={view === "az" ? "font-medium underline underline-offset-2" : "text-muted"} aria-pressed={view === "az"} onClick={() => setView("az")}>
            A to Z
          </button>
          {view === "az" && (
            <span className="flex flex-wrap gap-x-2 ml-2">
              {letters.map((l) => (
                <a key={l} href={`#letter-${l}`} className="underline underline-offset-2" onClick={(e) => { e.preventDefault(); setTarget(`letter-${l}`); }}>
                  {l}
                </a>
              ))}
            </span>
          )}
        </div>
      </div>

      {view === "groups" ? (
        shown.map((g) => (
          <section key={g.title}>
            <h2 className="text-lg font-medium mb-3">{g.title}</h2>
            <EntryList entries={g.entries} mark={mark} />
          </section>
        ))
      ) : (
        letters.map((l) => (
          <section key={l}>
            <h2 id={`letter-${l}`} className="text-lg font-medium mb-3 scroll-mt-4">
              {l}
            </h2>
            <EntryList entries={byLetter.get(l)!} mark={mark} />
          </section>
        ))
      )}
    </div>
  );
}

function EntryList({ entries, mark }: { entries: Entry[]; mark: string | null }) {
  return (
    <dl className="grid gap-x-6 gap-y-3 md:grid-cols-[max-content_1fr]">
      {entries.map((e) => (
        <div key={e.term} className="md:contents">
          <Row entry={e} mark={mark} />
        </div>
      ))}
    </dl>
  );
}

function Row({ entry, mark }: { entry: Entry; mark: string | null }) {
  const id = idOf(entry.term);
  const on = mark === id;
  return (
    <>
      <dt id={id} className="term font-medium scroll-mt-4" style={on ? { background: "color-mix(in srgb, var(--accent, #c80) 25%, transparent)" } : undefined}>
        {entry.term}
      </dt>
      <dd className="text-muted leading-relaxed md:mb-0" dangerouslySetInnerHTML={{ __html: entry.definition }} />
    </>
  );
}
