export type NavItem = { href: string; label: string; glyph: GlyphName };
export type GlyphName = "home" | "review" | "cards" | "glossary" | "progress" | "desk" | "lab" | "repo" | "login";

// Desk items: shown only when logged in.
export const deskNav: NavItem[] = [
  { href: "/review", label: "Review", glyph: "review" },
  { href: "/cards", label: "Cards", glyph: "cards" },
  { href: "/glossary", label: "Glossary", glyph: "glossary" },
  { href: "/progress", label: "Progress", glyph: "progress" },
  { href: "/desk", label: "Desk", glyph: "desk" },
  { href: "/lab", label: "Lab", glyph: "lab" },
];

export const REPO = "https://github.com/552020/inception_of_things";

const titles: Record<string, string> = {
  "": "Welcome",
  review: "Review",
  cards: "Cards",
  glossary: "Glossary",
  progress: "Progress",
  desk: "Desk",
  lab: "Lab",
  login: "Log in",
};

export function windowTitle(pathname: string): string {
  const part = pathname.match(/^\/parts\/(\d)/);
  if (part) return `Part ${part[1]}`;
  const first = pathname.split("/")[1] ?? "";
  return titles[first] ?? "Inception of Things";
}
