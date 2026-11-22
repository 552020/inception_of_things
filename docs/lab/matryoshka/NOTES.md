# Matryoshka sketches: how they are made

`tools/gen.py` writes the four HTML sources in `src/` (one inline SVG each, in the hand-drawn style of the other sketches). The PNGs in `img/` are screenshots of them at 2x with the font Patrick Hand:

```
python3 tools/gen.py
# then a headless browser, window 1532 x 992, scale 2, one screenshot per html file
```

To change a picture, edit the function of that part in `gen.py` (coordinates are on a 1500 by 960 canvas) and render again.
