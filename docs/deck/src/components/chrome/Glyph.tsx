import type { GlyphName } from "./nav";

// Simple flat glyphs on a 32 grid. Colours come from CSS variables, so the two skins paint them differently
// (soft and rounded on the desktop, hard-edged pixels on the 98 skin).
export function Glyph({ name }: { name: GlyphName }) {
  const a = "var(--ic-a)";
  const b = "var(--ic-b)";
  const l = "var(--ic-line)";
  const common = { stroke: l, strokeWidth: 1.5 } as const;
  let shapes;
  switch (name) {
    case "home":
      shapes = (
        <>
          <polygon points="16,4 29,16 3,16" fill={b} {...common} />
          <rect x="7" y="16" width="18" height="12" rx="2" fill={a} {...common} />
          <rect x="14" y="20" width="5" height="8" fill={b} {...common} />
        </>
      );
      break;
    case "review":
      shapes = (
        <>
          <rect x="8" y="3" width="19" height="22" rx="3" fill={b} {...common} />
          <rect x="4" y="7" width="19" height="22" rx="3" fill={a} {...common} />
          <path d="M9 14h9M9 19h6" stroke={l} strokeWidth="1.5" />
        </>
      );
      break;
    case "cards":
      shapes = (
        <>
          <rect x="5" y="3" width="22" height="26" rx="2" fill={a} {...common} />
          <path d="M9 10h14M9 15h14M9 20h9" stroke={l} strokeWidth="1.5" />
        </>
      );
      break;
    case "glossary":
      shapes = (
        <>
          <rect x="5" y="3" width="21" height="26" rx="2" fill={b} {...common} />
          <rect x="5" y="3" width="5" height="26" fill={a} {...common} />
          <path d="M14 10h8M14 15h8" stroke={l} strokeWidth="1.5" />
        </>
      );
      break;
    case "progress":
      shapes = (
        <>
          <rect x="4" y="18" width="6" height="10" fill={a} {...common} />
          <rect x="13" y="11" width="6" height="17" fill={b} {...common} />
          <rect x="22" y="4" width="6" height="24" fill={a} {...common} />
        </>
      );
      break;
    case "desk":
      shapes = (
        <>
          <rect x="3" y="7" width="12" height="6" rx="2" fill={b} {...common} />
          <rect x="3" y="10" width="26" height="18" rx="2" fill={a} {...common} />
        </>
      );
      break;
    case "lab":
      shapes = (
        <>
          <polygon points="12,3 20,3 20,12 28,27 4,27 12,12" fill={a} {...common} />
          <path d="M8 22h16" stroke={b} strokeWidth="4" />
        </>
      );
      break;
    case "repo":
      shapes = (
        <>
          <rect x="3" y="5" width="26" height="22" rx="3" fill={a} {...common} />
          <path d="M13 12l-4 4 4 4M19 12l4 4-4 4" fill="none" stroke={l} strokeWidth="2" />
        </>
      );
      break;
    case "login":
      shapes = (
        <>
          <circle cx="11" cy="14" r="7" fill={b} {...common} />
          <rect x="16" y="13" width="13" height="4" fill={a} {...common} />
          <rect x="23" y="17" width="3" height="5" fill={a} {...common} />
        </>
      );
      break;
  }
  return (
    <svg className="glyph" viewBox="0 0 32 32" width="32" height="32" aria-hidden="true">
      {shapes}
    </svg>
  );
}
