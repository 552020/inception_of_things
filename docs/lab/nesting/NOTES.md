# Nesting sketches: how they are made

The pictures are shown on the lab page Sketches (`docs/lab/sketches/README.md`), from `/diagrams/nesting-*.png`; the sync script copies the PNGs from `img/` to `docs/deck/public/diagrams`.

`tools/gen.py` writes the four HTML sources in `src/` (one inline SVG each, in the hand-drawn style of the other sketches). The PNGs in `img/` are screenshots of them at 2x with the font Patrick Hand:

```
python3 tools/gen.py
# then a headless browser, window 1532 x 992, scale 2, one screenshot per html file
```

To change a picture, edit the function of that part in `gen.py` (coordinates are on a 1500 by 960 canvas) and render again.
