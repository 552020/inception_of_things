"""Experiments for the mark: the wheel as the whole pupil, without the inner circle (iris ring).
Usage: python3 gen-eye-variants.py <logo-study-img-dir>. Writes sketch-J1/J2/J3 sheets."""
import math, sys

def pol(r, deg, c=50): a = math.radians(deg); return c + r * math.cos(a), c + r * math.sin(a)

LID = '<path d="M4 50 Q50 -2 96 50 Q50 102 4 50 Z" fill="none" stroke="currentColor" stroke-width="9" stroke-linejoin="round"/>'

def wheel(rim, rim_w, n, handle_len, handle_w, spokes=None, hub=3, start=0):
    """rim ring, n handles beyond the rim, optional spokes (stroke) from the hub to the rim, a hub dot"""
    parts = [f'<circle cx="50" cy="50" r="{rim}" fill="none" stroke="currentColor" stroke-width="{rim_w}"/>']
    for i in range(n):
        ang = start + i * 360 / n
        if spokes:
            x1, y1 = pol(hub, ang); x2, y2 = pol(rim, ang)
            parts.append(f'<line x1="{x1:.2f}" y1="{y1:.2f}" x2="{x2:.2f}" y2="{y2:.2f}" stroke="currentColor" stroke-width="{spokes}" stroke-linecap="round"/>')
        x1, y1 = pol(rim, ang); x2, y2 = pol(rim + handle_len, ang)
        parts.append(f'<line x1="{x1:.2f}" y1="{y1:.2f}" x2="{x2:.2f}" y2="{y2:.2f}" stroke="currentColor" stroke-width="{handle_w}" stroke-linecap="round"/>')
    parts.append(f'<circle cx="50" cy="50" r="{hub}" fill="currentColor"/>')
    return "".join(parts)

# outer reach = rim + rim_w/2 ... rim + handle_len + handle_w/2 must stay about 4 clear of the lid (inner edge 21.5)
VARIANTS = {
    "J1-wheel": LID + wheel(rim=9.5, rim_w=4.5, n=8, handle_len=4.4, handle_w=4.6, hub=3.2),
    "J2-spokes": LID + wheel(rim=10.5, rim_w=4, n=8, handle_len=4, handle_w=4.4, spokes=2.8, hub=3.4),
    "J3-seven": LID + wheel(rim=10.5, rim_w=4, n=7, handle_len=4, handle_w=4.4, spokes=2.8, hub=3.4, start=-90),
}

def use(x, y, s, color, body): return f'<svg x="{x}" y="{y}" width="{s}" height="{s}" viewBox="0 0 100 100" style="color:{color}">{body}</svg>'

def sheet(name, body, out_dir):
    out = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 190" width="1040" height="380">']
    for i, (bg, fg) in enumerate([("#ffffff", "#326ce5"), ("#121a24", "#7ea4ea")]):
        x0 = i * 260
        out.append(f'<rect x="{x0}" y="0" width="260" height="190" fill="{bg}"/>')
        for (dx, dy, s) in ((20, 30, 110), (160, 25, 64), (160, 100, 32), (206, 100, 16), (160, 145, 20)): out.append(use(x0 + dx, dy, s, fg, body))
        out.append(f'<text x="{x0+20}" y="170" font-family="ui-monospace,Menlo,monospace" font-size="11" fill="{fg}" opacity=".7">{name}</text>')
    out.append('</svg>')
    open(f"{out_dir}/sketch-{name}.svg", "w").write("".join(out))

if __name__ == "__main__":
    for k, v in VARIANTS.items(): sheet(k, v, sys.argv[1])
    print("ok", list(VARIANTS))
