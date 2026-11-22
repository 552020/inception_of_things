"use server";
import { cookies } from "next/headers";
import { SKINS, SKIN_COOKIE, type Skin } from "@/lib/skin-shared";

// The switch is a cookie, like a dark mode preference; the layout reads it and renders the chosen chrome.
export async function setSkin(skin: Skin): Promise<void> {
  if (!SKINS.includes(skin)) return;
  (await cookies()).set(SKIN_COOKIE, skin, { path: "/", maxAge: 31536000, sameSite: "lax" });
}
