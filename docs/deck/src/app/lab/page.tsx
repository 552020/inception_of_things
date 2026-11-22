import Link from "next/link";
import { labEntries } from "@/lib/library";

export default function LabPage() {
  return (
    <ul className="flex flex-col gap-2">
      {[{ slug: "design", title: "Design proposals" }, ...labEntries()].map((e) => (
        <li key={e.slug}>
          <Link href={`/lab/${e.slug}`} className="block rounded-lg border border-line bg-surface px-4 py-3 font-medium leading-snug">
            {e.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}
