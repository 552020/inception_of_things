import { readFileSync } from "node:fs";
import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import { loadCards } from "@/lib/content";

// /cards/download?format=anki  tab-separated file for Anki's import (front, back as HTML, tags)
// /cards/download?format=md    the source file cards.md
// An optional ?tag= limits the download to one tag (anki only).
function field(value: string): string {
  return `"${value.replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
}

export async function GET(request: NextRequest) {
  const format = request.nextUrl.searchParams.get("format") ?? "anki";
  if (format === "md") {
    const text = readFileSync(path.join(process.cwd(), "content", "cards.md"), "utf8");
    return new NextResponse(text, {
      headers: {
        "content-type": "text/markdown; charset=utf-8",
        "content-disposition": 'attachment; filename="iot-cards.md"',
      },
    });
  }
  const tag = request.nextUrl.searchParams.get("tag");
  const cards = loadCards().filter((c) => !tag || c.tags.includes(tag));
  const lines = [
    "#separator:tab",
    "#html:true",
    "#tags column:3",
    ...cards.map((c) => [field(c.front), field(c.back), c.tags.join(" ")].join("\t")),
  ];
  return new NextResponse(lines.join("\n") + "\n", {
    headers: {
      "content-type": "text/tab-separated-values; charset=utf-8",
      "content-disposition": `attachment; filename="iot-cards${tag ? `-${tag}` : ""}.txt"`,
    },
  });
}
