import type { CSSProperties } from "react";

export type Palette = {
  background: string;
  foreground: string;
  muted: string;
  surface: string;
  line: string;
  accent: string;
  ok: string; // status colour for "Synced" / "Healthy"
  header: string; // header band
  headerText: string;
};

export type Proposal = {
  name: string;
  idea: string;
  light: Palette;
  dark: Palette;
  radius: number;
  mono: boolean;
  caps: boolean;
  grid: boolean; // blueprint grid behind the page
};

// A small live mock-up of the deck as a DevOps page: header band, status chips, a command line,
// the front of a card, the answer button and the four ratings.
function Preview({ p, palette, mode }: { p: Proposal; palette: Palette; mode: string }) {
  const font = p.mono ? "var(--font-geist-mono), ui-monospace, monospace" : "var(--font-geist-sans), system-ui, sans-serif";
  const mono = "var(--font-geist-mono), ui-monospace, monospace";
  const box: CSSProperties = { background: palette.surface, border: `1px solid ${palette.line}`, borderRadius: p.radius };
  const label: CSSProperties = p.caps ? { textTransform: "uppercase", letterSpacing: "0.08em", fontSize: 11 } : { fontSize: 13 };
  const gridImage = p.grid
    ? `linear-gradient(${palette.line}55 1px, transparent 1px), linear-gradient(90deg, ${palette.line}55 1px, transparent 1px)`
    : undefined;
  const chip = (text: string, color: string): CSSProperties => ({
    border: `1px solid ${color}`,
    color,
    borderRadius: p.radius > 6 ? 999 : p.radius,
    padding: "1px 8px",
    fontSize: 12,
    fontFamily: mono,
  });
  return (
    <div
      style={{
        background: palette.background,
        backgroundImage: gridImage,
        backgroundSize: "20px 20px",
        color: palette.foreground,
        fontFamily: font,
        border: `1px solid ${palette.line}`,
        borderRadius: p.radius,
      }}
      className="overflow-hidden"
    >
      <div style={{ background: palette.header, color: palette.headerText, borderBottom: `1px solid ${palette.line}`, ...label }} className="flex items-center gap-4 px-4 py-2">
        <span style={{ fontWeight: 600 }}>iot / review</span>
        <span style={{ opacity: 0.7 }}>cards</span>
        <span style={{ opacity: 0.7 }}>glossary</span>
        <span style={{ opacity: 0.7 }}>desk</span>
        <span style={{ marginLeft: "auto", opacity: 0.7 }}>{mode}</span>
      </div>
      <div className="p-4 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span style={chip("Synced", palette.ok)}>● Synced</span>
          <span style={chip("Healthy", palette.ok)}>● Healthy</span>
          <span style={chip("12 due", palette.accent)}>12 due</span>
          <span style={{ color: palette.muted, ...label }}>3 new · 138 cards</span>
        </div>
        <div style={{ ...box, fontFamily: mono, fontSize: 12, padding: "8px 12px", color: palette.muted }}>
          <span style={{ color: palette.ok }}>$</span> kubectl get nodes
          <br />
          rpodackS <span style={{ color: palette.ok }}>Ready</span> control-plane
        </div>
        <div style={box} className="p-4 flex flex-col gap-3">
          <div style={{ fontSize: 19, fontWeight: 500, lineHeight: 1.3 }}>Why did the host VM move from VirtualBox to QEMU/KVM?</div>
          <div style={{ color: palette.muted, fontFamily: mono, fontSize: 12 }}>vagrant · host-vm · part1</div>
          <div style={{ background: palette.accent, color: palette.background, borderRadius: p.radius, textAlign: "center", fontWeight: 600 }} className="py-3 mt-4">
            Show answer
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {["Again", "Hard", "Good", "Easy"].map((r) => (
            <div key={r} style={{ ...box, textAlign: "center", fontWeight: 500, fontSize: 14 }} className="py-3">
              {r}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DesignProposal({ p, index }: { p: Proposal; index: number }) {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-lg font-medium">
          {index}. {p.name}
        </h2>
        <p className="text-sm text-muted mt-1">{p.idea}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Preview p={p} palette={p.light} mode="light" />
        <Preview p={p} palette={p.dark} mode="dark" />
      </div>
    </section>
  );
}
