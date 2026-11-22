"""The mark: an eye with a wheel as pupil (sketch G of the logo study). Prints the pixel path for Logo.tsx and writes the
vector favicon and the study sketches. Usage: python3 gen-logo.py <deck-dir> <logo-study-img-dir>"""
import math, sys, json

# --- vector geometry on a 100 grid: the lid is stroke 9 around y=24 (inner edge 28.5, 21.5 from the centre)
IRIS_R, IRIS_W = 14, 6        # outer 17: 4.5 clear of the lid
RING_R, RING_W = 5, 3.5
HANDLE_A, HANDLE_B = 5, 7.6   # handles end 9.35 from the centre, 1.6 clear of the iris
DOT_R = 2

def pol(r, deg): a = math.radians(deg); return 50 + r * math.cos(a), 50 + r * math.sin(a)

def vector_inner(color_class=None):
    stroke = 'currentColor'
    parts = [f'<path d="M4 50 Q50 -2 96 50 Q50 102 4 50 Z" fill="none" stroke="{stroke}" stroke-width="9" stroke-linejoin="round"/>',
             f'<circle cx="50" cy="50" r="{IRIS_R}" fill="none" stroke="{stroke}" stroke-width="{IRIS_W}"/>',
             f'<circle cx="50" cy="50" r="{RING_R}" fill="none" stroke="{stroke}" stroke-width="{RING_W}"/>']
    for i in range(8):
        x1, y1 = pol(HANDLE_A, i * 45); x2, y2 = pol(HANDLE_B, i * 45)
        parts.append(f'<line x1="{x1:.2f}" y1="{y1:.2f}" x2="{x2:.2f}" y2="{y2:.2f}" stroke="{stroke}" stroke-width="{RING_W}" stroke-linecap="round"/>')
    parts.append(f'<circle cx="50" cy="50" r="{DOT_R}" fill="{stroke}"/>')
    return "".join(parts)

# --- pixel form on a 32 grid: taller lid, iris and pupil kept clear of it
def pixel_cells():
    n = 32; c = (n - 1) / 2; cells = set()
    W, SO, SI, WI = 15.6, 11.5, 9.2, 13.8
    for y in range(n):
        for x in range(n):
            dx, dy = x - c, y - c
            def inside(s, ww): return abs(dx) <= ww and abs(dy) <= s * (1 - (dx / ww) ** 2)
            d = math.hypot(dx, dy)
            if inside(SO, W) and not inside(SI, WI): cells.add((x, y))
            if 5.6 <= d <= 6.8 and inside(SI, WI): cells.add((x, y))      # iris
            if 2.2 <= d <= 3.2: cells.add((x, y))                          # pupil ring
    for k in range(8):                                                     # eight single-pixel handles
        a = math.radians(k * 45); cells.add((round(c + 4.5 * math.cos(a)), round(c + 4.5 * math.sin(a))))
    for p in [(15, 15), (16, 15), (15, 16), (16, 16)]: cells.add(p) if False else None
    return cells

def pixel_path(cells): return "".join(f"M{x} {y}h1v1h-1z" for x, y in sorted(cells))

if __name__ == "__main__":
    deck, img = sys.argv[1], sys.argv[2]
    path = pixel_path(pixel_cells())
    # favicon, with a dark-mode colour
    inner = vector_inner().replace('stroke="currentColor"', 'class="m"').replace('fill="currentColor"', 'class="f"')
    inner = inner.replace('class="m" stroke-width', 'class="m" stroke-width')
    fav = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><style>.m{stroke:#326ce5;fill:none}.f{fill:#326ce5;stroke:none}'
           '@media (prefers-color-scheme:dark){.m{stroke:#7ea4ea}.f{fill:#7ea4ea}}</style>' + inner + '</svg>')
    open(f"{deck}/public/icon.svg", "w").write(fav)
    # sketch sheets
    def use(x, y, s, color, body, vb): return f'<svg x="{x}" y="{y}" width="{s}" height="{s}" viewBox="0 0 {vb} {vb}" style="color:{color}">{body}</svg>'
    def sheet(name, body, vb, big=110):
        out = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 190" width="1040" height="380">']
        for i, (bg, fg) in enumerate([("#ffffff", "#326ce5"), ("#121a24", "#7ea4ea")]):
            x0 = i * 260
            out.append(f'<rect x="{x0}" y="0" width="260" height="190" fill="{bg}"/>')
            for (dx, dy, s) in ((20, 30, big), (160, 25, 64), (160, 100, 32), (206, 100, 16), (160, 145, 20)): out.append(use(x0 + dx, dy, s, fg, body, vb))
            out.append(f'<text x="{x0+20}" y="170" font-family="ui-monospace,Menlo,monospace" font-size="11" fill="{fg}" opacity=".7">{name}</text>')
        out.append('</svg>'); open(f"{img}/sketch-{name}.svg", "w").write("".join(out))
    sheet("G-eye-wheel", vector_inner(), 100)
    sheet("G-pixel32", f'<path fill="currentColor" shape-rendering="crispEdges" d="{path}"/>', 32, big=128)
    json.dump({"pixel_path": path}, open("/tmp/logo-pixel.json", "w"))
    print("ok", len(path))
