import { cookies } from "next/headers";
import { SKINS, SKIN_COOKIE, type Skin } from "./skin-shared";

export async function currentSkin(): Promise<Skin> {
  const store = await cookies();
  const value = store.get(SKIN_COOKIE)?.value;
  return SKINS.find((s) => s === value) ?? "desktop";
}
