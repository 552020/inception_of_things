import { loadGlossary } from "@/lib/content";

export default function GlossaryPage() {
  const groups = loadGlossary();
  return (
    <div className="flex flex-col gap-8">
      <nav className="flex flex-wrap gap-2 text-sm">
        {groups.map((g) => (
          <a key={g.title} href={`#${slugOf(g.title)}`} className="px-3 py-1.5 rounded-full border border-line">
            {g.title}
          </a>
        ))}
      </nav>
      {groups.map((g) => (
        <section key={g.title} id={slugOf(g.title)}>
          <h2 className="text-lg font-medium mb-3">{g.title}</h2>
          <dl className="grid gap-x-6 gap-y-3 md:grid-cols-[max-content_1fr]">
            {g.entries.map((e) => (
              <div key={e.term} className="md:contents">
                <dt className="term font-medium">{e.term}</dt>
                <dd className="text-muted leading-relaxed md:mb-0" dangerouslySetInnerHTML={{ __html: e.definition }} />
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}

function slugOf(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
