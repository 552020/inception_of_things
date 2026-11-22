# Windows 98 style: working notes

The live guide is at `/lab/windows-98` in the deck (login needed). It shows every component, with its rules, in windows that can be moved, minimized, maximized and closed.

## Where things are

| What | File |
|---|---|
| Design system: tokens, components, scrollbars, site chrome | `docs/deck/src/styles/win98.css` |
| Cursors, scrollbar arrows, check mark, radio, select arrow, title bar glyphs, generated as CSS variables | `docs/deck/src/styles/win98-assets.css`, made by `tools/gen-assets.py` |
| 32 by 32 pixel icons (twelve), generated from drawing primitives | `docs/deck/src/components/chrome/PixelIcon.tsx`, made by `tools/gen-icons.py` |
| Window manager: drag, minimize to the taskbar, maximize (also by double click), close, front | `docs/deck/src/components/win98/WindowManager.tsx` |
| Site chrome in this style | `docs/deck/src/components/chrome/Win98Chrome.tsx` |
| The guide page | `docs/deck/src/app/lab/windows-98/page.tsx` |

Regenerate after changing a drawing:

```
python3 docs/lab/windows-98-style-guide/tools/gen-icons.py      # writes icons.json; paste into PixelIcon.tsx
python3 docs/lab/windows-98-style-guide/tools/gen-assets.py docs/deck/src/styles/win98-assets.css
```

## Rules in short

- Flat grey, 1 pixel edges for raised and sunken, no radius, no blur, no gradient except title bars.
- Two faces: WIN95FA at 16 px with 1 px letter spacing for controls, titles and labels; Tahoma 13 px for running text.
- Icons 32 by 32, 16 colours, light edge top left, shadow edge bottom right.
- The page is an application window on a teal desktop: title bar, grey client area, status bar; the taskbar is docked on top, desk icons left, site icons right.
- Closing the site window leaves the desktop; a click on an icon or the brand opens it again.
- No cross inside a circle, no four-armed shapes (a pixel wheel with four spokes was dropped because it reads as a sun cross).

## Credits

WIN95FA by Alina Sava (SIL Open Font License, via Fontsource). Values and sizes checked against 98.css by Jordan Scales (MIT); the code is written from scratch. An homage: no Microsoft logos, product names, sounds or artwork.
