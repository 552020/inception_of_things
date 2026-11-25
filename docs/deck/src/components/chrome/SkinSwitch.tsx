"use client";
import { useTransition } from "react";
import { setSkin } from "@/app/skin-action";
import { SKINS, type Skin } from "@/lib/skin-shared";

const labels: Record<Skin, string> = { desktop: "Desktop", win98: "98" };

export function SkinSwitch({ skin }: { skin: Skin }) {
  const [, start] = useTransition();
  return (
    <div className="skin-switch" role="group" aria-label="Style">
      {SKINS.map((s) => (
        <button key={s} type="button" onClick={() => start(() => setSkin(s))} aria-pressed={skin === s} className="skin-switch-btn">
          {labels[s]}
        </button>
      ))}
    </div>
  );
}
