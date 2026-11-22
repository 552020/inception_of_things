import { DesignProposal, type Proposal } from "@/components/DesignProposal";

// Five takes on the deck as a DevOps page. Each shows the same screen in light and dark.
const proposals: Proposal[] = [
  {
    name: "Ops console",
    idea: "A source-hosting console: slate panels with hairline borders, status chips, blue accent. Dark by default for the evaluation night, white by day.",
    light: { background: "#f6f8fa", foreground: "#1f2328", muted: "#656d76", surface: "#ffffff", line: "#d0d7de", accent: "#0969da", ok: "#1a7f37", header: "#24292f", headerText: "#ffffff" },
    dark: { background: "#0d1117", foreground: "#e6edf3", muted: "#8b949e", surface: "#161b22", line: "#30363d", accent: "#2f81f7", ok: "#3fb950", header: "#010409", headerText: "#e6edf3" },
    radius: 6, mono: false, caps: false, grid: false,
  },
  {
    name: "Terminal",
    idea: "Monospace everywhere, black with green phosphor, square corners, a shell prompt in the header. The page looks like the tools it teaches.",
    light: { background: "#ffffff", foreground: "#0f172a", muted: "#64748b", surface: "#f8fafc", line: "#cbd5e1", accent: "#15803d", ok: "#15803d", header: "#0f172a", headerText: "#86efac" },
    dark: { background: "#050805", foreground: "#c9f7d4", muted: "#5f8a6b", surface: "#0a110b", line: "#173a20", accent: "#4ade80", ok: "#4ade80", header: "#0a110b", headerText: "#4ade80" },
    radius: 2, mono: true, caps: false, grid: false,
  },
  {
    name: "Cluster blue",
    idea: "A Kubernetes dashboard: a solid blue header band, a pale blue-grey page, white panels, rounded chips. Calm and familiar to anyone who has opened a cluster UI.",
    light: { background: "#eef2f9", foreground: "#14213d", muted: "#5b6b8c", surface: "#ffffff", line: "#d6deec", accent: "#326ce5", ok: "#1d9a6c", header: "#326ce5", headerText: "#ffffff" },
    dark: { background: "#0e1626", foreground: "#e6ecf8", muted: "#8a98b8", surface: "#16213a", line: "#26365a", accent: "#5b8def", ok: "#34d399", header: "#1b2c52", headerText: "#e6ecf8" },
    radius: 10, mono: false, caps: false, grid: false,
  },
  {
    name: "Pipeline",
    idea: "A GitOps dashboard: dark navy, an orange accent for the action, teal for healthy. Capital labels like a build status board.",
    light: { background: "#f4f6fa", foreground: "#1a2233", muted: "#667085", surface: "#ffffff", line: "#dde2ec", accent: "#e8590c", ok: "#0e9384", header: "#1a2233", headerText: "#ffffff" },
    dark: { background: "#111827", foreground: "#f3f4f6", muted: "#9ca3af", surface: "#1a2336", line: "#2a3550", accent: "#fb923c", ok: "#2dd4bf", header: "#0b1220", headerText: "#fb923c" },
    radius: 4, mono: false, caps: true, grid: false,
  },
  {
    name: "Blueprint",
    idea: "An infrastructure drawing: engineering blue with a faint grid, thin white lines, monospace labels. The most distinctive one; it also suits the diagrams of Part 1 to 3.",
    light: { background: "#ffffff", foreground: "#0b2a4a", muted: "#4d6a8a", surface: "#ffffff", line: "#9db7d3", accent: "#0b5cad", ok: "#0b7a5a", header: "#0b2a4a", headerText: "#ffffff" },
    dark: { background: "#0b2a4a", foreground: "#e8f1fb", muted: "#9bb7d4", surface: "#0e335a", line: "#3f6c9e", accent: "#7cc4ff", ok: "#6ee7b7", header: "#08203a", headerText: "#e8f1fb" },
    radius: 0, mono: true, caps: true, grid: true,
  },
];

export default function DesignPage() {
  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-semibold">Design proposals</h1>
        <p className="text-sm text-muted mt-1">Palette only: these five change colours, radius and font, not the structure. Superseded by the graphics study, which comes first; structural proposals follow once it is discussed.</p>
      </div>
      {proposals.map((p, i) => (
        <DesignProposal key={p.name} p={p} index={i + 1} />
      ))}
    </div>
  );
}
