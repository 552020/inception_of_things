import { NextResponse, type NextRequest } from "next/server";
import { COOKIE } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url), 303);
  response.cookies.delete(COOKIE);
  return response;
}
