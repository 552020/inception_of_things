import { cookies } from "next/headers";
import { COOKIE, verifySession } from "./auth";

export async function currentUser(): Promise<string | null> {
  const store = await cookies();
  return verifySession(store.get(COOKIE)?.value);
}
