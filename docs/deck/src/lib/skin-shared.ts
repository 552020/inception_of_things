// Safe to import from client components (no next/headers).
export const SKINS = ["desktop", "win98"] as const;
export type Skin = (typeof SKINS)[number];
export const SKIN_COOKIE = "deck-skin";
