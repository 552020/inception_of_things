import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, checkPassword, signSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const user = String(form.get("username") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? "/");
  if (!checkPassword(user, password)) {
    const url = new URL("/login", request.url);
    url.searchParams.set("error", "1");
    if (next !== "/") url.searchParams.set("next", next);
    return NextResponse.redirect(url, 303);
  }
  const session = await signSession(user);
  const response = NextResponse.redirect(new URL(next.startsWith("/") ? next : "/", request.url), 303);
  response.cookies.set(COOKIE, session.value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: session.expires,
    path: "/",
  });
  return response;
}
