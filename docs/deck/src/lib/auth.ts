// Session cookie: "<user>.<expires>.<hmac>", signed with DECK_SECRET.
// Web Crypto only, so the same code runs in the proxy and in route handlers.

export const COOKIE = "deck-session";
const DAYS = 90;

export function users(): Map<string, string> {
  const map = new Map<string, string>();
  for (const pair of (process.env.DECK_USERS ?? "").split(",")) {
    const i = pair.indexOf(":");
    if (i > 0) map.set(pair.slice(0, i).trim(), pair.slice(i + 1).trim());
  }
  return map;
}

export function userNames(): string[] {
  return [...users().keys()];
}

async function hmac(message: string): Promise<string> {
  const secret = process.env.DECK_SECRET;
  if (!secret) throw new Error("DECK_SECRET is not set");
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/=+$/, "");
}

export async function signSession(user: string): Promise<{ value: string; expires: Date }> {
  const expires = new Date(Date.now() + DAYS * 24 * 3600 * 1000);
  const payload = `${user}.${expires.getTime()}`;
  return { value: `${payload}.${await hmac(payload)}`, expires };
}

export async function verifySession(value: string | undefined): Promise<string | null> {
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length !== 3) return null;
  const [user, exp, sig] = parts;
  if (Number(exp) < Date.now()) return null;
  if ((await hmac(`${user}.${exp}`)) !== sig) return null;
  return users().has(user) ? user : null;
}

export function checkPassword(user: string, password: string): boolean {
  const expected = users().get(user);
  return expected !== undefined && expected === password;
}
