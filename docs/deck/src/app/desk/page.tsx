import Link from "next/link";
import { deskGroups } from "@/lib/library";

export default function DeskPage() {
  return (
    <div className="flex flex-col gap-6">
      {deskGroups().map((g) => (
        <section key={g.group}>
          <h2 className="text-sm text-muted mb-2">{g.group}</h2>
          <ul className="flex flex-col gap-2">
            {g.entries.map((e) => (
              <li key={e.slug}>
                <Link href={`/desk/${e.slug}`} className="block rounded-lg border border-line bg-surface px-4 py-3 font-medium leading-snug">
                  {e.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
