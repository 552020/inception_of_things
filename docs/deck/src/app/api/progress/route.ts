import { NextResponse, type NextRequest } from "next/server";
import { currentUser } from "@/lib/session";
import { readProgress, writeProgress } from "@/lib/store";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "not logged in" }, { status: 401 });
  return NextResponse.json({ user, progress: await readProgress(user) });
}

export async function PUT(request: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "not logged in" }, { status: 401 });
  const body = await request.json();
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "body must be an object" }, { status: 400 });
  }
  await writeProgress(user, body);
  return NextResponse.json({ ok: true });
}
