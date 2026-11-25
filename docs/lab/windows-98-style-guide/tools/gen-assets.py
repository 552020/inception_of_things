"""Generates src/styles/win98-assets.css: the small pixel images of the 98 style as CSS custom properties
(cursors, scrollbar arrows, check mark, radio buttons, select arrow, title bar glyphs).
Run: python3 gen-assets.py ../../../deck/src/styles/win98-assets.css"""
import math, sys
from urllib.parse import quote

PAL = {'K': '#000000', 'W': '#ffffff', 'S': '#c0c0c0', 'L': '#dfdfdf', 'D': '#808080'}

def svg_from_rows(rows, scale=1, pal=PAL):
    h, w = len(rows), max(len(r) for r in rows)
    rects = []
    for y, row in enumerate(rows):
        x = 0
        while x < len(row):
            ch = row[x]; n = 1
            while x + n < len(row) and row[x + n] == ch: n += 1
            if ch != '.' and ch in pal:
                rects.append(f'<rect x="{x}" y="{y}" width="{n}" height="1" fill="{pal[ch]}"/>')
            x += n
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w*scale}" height="{h*scale}" viewBox="0 0 {w} {h}" '
            f'shape-rendering="crispEdges">' + "".join(rects) + '</svg>')

def uri(svg): return 'url("data:image/svg+xml,' + quote(svg, safe="/:=, ") .replace(" ", "%20") + '")'

ARROW = [
 "K...........","KK..........","KWK.........","KWWK........","KWWWK.......","KWWWWK......","KWWWWWK.....",
 "KWWWWWWK....","KWWWWWWWK...","KWWWWWWWWK..","KWWWWWKKKKK.","KWWKWWK.....","KWK.KWWK....","KK..KWWK....",
 "K....KWWK...",".....KWWK...","......KK....",
]
HAND = [
 ".....KK.........","....KWWK........","....KWWK........","....KWWK........","....KWWKKK......",
 "....KWWKWWKKK...",".KKKKWWKWWKWWK..","KWWKKWWWWWWWWWK.","KWWWKWWWWWWWWWK.",".KWWWWWWWWWWWWK.",
 "..KWWWWWWWWWWWK.","..KWWWWWWWWWWWK.","...KWWWWWWWWWK..","...KWWWWWWWWWK..","....KWWWWWWWK...","....KKKKKKKKK...",
]
def canvas(w, h): return [['.'] * w for _ in range(h)]
def rows(c): return ["".join(r) for r in c]

def arrow(direction):
    c = canvas(16, 16)
    for k in range(4):  # 1,3,5,7 wide
        half = k
        if direction == 'up':
            y = 6 + k
            for x in range(7 - half, 8 + half): c[y][x] = 'K'
        elif direction == 'down':
            y = 9 - k
            for x in range(7 - half, 8 + half): c[y][x] = 'K'
        elif direction == 'left':
            x = 6 + k
            for y in range(7 - half, 8 + half): c[y][x] = 'K'
        else:
            x = 9 - k
            for y in range(7 - half, 8 + half): c[y][x] = 'K'
    return rows(c)

CHECK = ["........", ".......K", "......KK", "K....KK.", "KK..KK..", ".KKKK...", "..KK....", "........"]
# the check mark is 7 wide; drop the empty column and rows
CHECK = [r[1:] for r in CHECK[1:7]]

def radio(on):
    n = 13; c = canvas(n, n); mid = (n - 1) / 2
    for y in range(n):
        for x in range(n):
            dx, dy = x - mid, y - mid; d = math.hypot(dx, dy); tl = (dx + dy) < 0
            if d <= 4.6: c[y][x] = 'W'
            elif d <= 5.6: c[y][x] = 'K' if tl else 'L'
            elif d <= 6.6: c[y][x] = 'D' if tl else 'W'
    if on:
        for y in range(n):
            for x in range(n):
                if math.hypot(x - mid, y - mid) <= 2.2: c[y][x] = 'K'
    return rows(c)

def select_button():
    w, h = 16, 17; c = canvas(w, h)
    for y in range(h):
        for x in range(w): c[y][x] = 'S'
    for x in range(w): c[0][x] = 'L'; c[h - 1][x] = 'K'
    for y in range(h): c[y][0] = 'L'; c[y][w - 1] = 'K'
    for x in range(1, w - 1): c[1][x] = 'W'; c[h - 2][x] = 'D'
    for y in range(1, h - 1): c[y][1] = 'W'; c[y][w - 2] = 'D'
    for x in range(w): c[0][x] = 'W' if x < w - 1 else 'K'; 
    for y in range(h): c[y][0] = 'W'
    for k in range(4):
        y = 7 + k
        for x in range(7 - (3 - k), 8 + (3 - k)): c[y][x] = 'K'
    return rows(c)

def tb_glyph(kind):
    c = canvas(16, 14)
    if kind == 'min':
        for y in (9, 10):
            for x in range(4, 10): c[y][x] = 'K'
    elif kind == 'max':
        for x in range(3, 12): c[2][x] = 'K'; c[3][x] = 'K'; c[10][x] = 'K'
        for y in range(2, 11): c[y][3] = 'K'; c[y][11] = 'K'
    elif kind == 'restore':
        for x in range(5, 12): c[2][x] = 'K'; c[3][x] = 'K'; c[8][x] = 'K'
        for y in range(2, 9): c[y][5] = 'K'; c[y][11] = 'K'
        for y in range(5, 11):
            for x in range(3, 10): c[y][x] = 'S'
        for x in range(3, 10): c[5][x] = 'K'; c[6][x] = 'K'; c[10][x] = 'K'
        for y in range(5, 11): c[y][3] = 'K'; c[y][9] = 'K'
    else:
        X = ["KK....KK", ".KK..KK.", "..KKKK..", "...KK...", "..KKKK..", ".KK..KK.", "KK....KK"]
        for j, r in enumerate(X):
            for i, ch in enumerate(r):
                if ch == 'K': c[3 + j][4 + i] = 'K'
    return rows(c)

vars_ = {
    '--w98-cursor-arrow': uri(svg_from_rows(ARROW, 2)) + ' 0 0, default',
    '--w98-cursor-hand': uri(svg_from_rows(HAND, 2)) + ' 10 0, pointer',
    '--w98-img-up': uri(svg_from_rows(arrow('up'))),
    '--w98-img-down': uri(svg_from_rows(arrow('down'))),
    '--w98-img-left': uri(svg_from_rows(arrow('left'))),
    '--w98-img-right': uri(svg_from_rows(arrow('right'))),
    '--w98-img-check': uri(svg_from_rows(CHECK)),
    '--w98-img-radio': uri(svg_from_rows(radio(False))),
    '--w98-img-radio-on': uri(svg_from_rows(radio(True))),
    '--w98-img-select': uri(svg_from_rows(select_button())),
    '--w98-img-min': uri(svg_from_rows(tb_glyph('min'))),
    '--w98-img-max': uri(svg_from_rows(tb_glyph('max'))),
    '--w98-img-restore': uri(svg_from_rows(tb_glyph('restore'))),
    '--w98-img-close': uri(svg_from_rows(tb_glyph('close'))),
}
css = "/* Generated by docs/lab/windows-98-style-guide/tools/gen-assets.py. Do not edit. */\n.w98-scope, html[data-skin=\"win98\"] {\n"
css += "".join(f"  {k}: {v};\n" for k, v in vars_.items()) + "}\n"
out = sys.argv[1] if len(sys.argv) > 1 else 'win98-assets.css'
open(out, 'w').write(css)
print("wrote", out, len(css), "bytes")
