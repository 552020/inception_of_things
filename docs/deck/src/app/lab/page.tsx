import Link from "next/link";
import { labEntries } from "@/lib/library";

export default function LabPage() {
  return (
    <ul className="flex flex-col gap-2">
      {[{ slug: "design", title: "Design proposals" }, ...labEntries()].map((e) => (
        <li key={e.slug}>
          <Link href={`/lab/${e.slug}`} className="ui-row">
            {e.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}
