# Inception-of-Things cards

Flashcards and glossary for the oral evaluation, as a web page. Live at https://iot-deck-pi.vercel.app (open it in Safari on the phone, "Add to Home Screen" for a full-screen app).

Source of truth: `../evaluation/cards.md` (one `###` heading per card: front, text under it: back, `tags:` line) and `../evaluation/glossary.md`. `pnpm build` copies both into `content/` first (`scripts/sync-content.mjs`); commit the copies, the deploy uses them.

Pages: `/` review with FSRS scheduling (ts-fsrs), progress in the browser's localStorage, `/cards` the whole list with a tag filter, `/glossary`.

Deploy: `vercel --prod --yes` from this folder (project iot-deck on the 552020 account).
