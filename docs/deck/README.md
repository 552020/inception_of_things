# Inception of Things

Flashcards and glossary for the oral evaluation, as a web page. Live at https://iot42.vercel.app (open it in Safari on the phone, "Add to Home Screen" for a full-screen app).

Source of truth: `../evaluation/cards.md` (one `###` heading per card: front, text under it: back, `tags:` line) and `../evaluation/glossary.md`. `pnpm build` copies both into `content/` first (`scripts/sync-content.mjs`); commit the copies, the deploy uses them.

Pages: `/` the public page about the project (the only page without login), `/review` review with FSRS scheduling (ts-fsrs), `/cards` the whole list with a tag filter and downloads (Anki import file, Markdown), `/glossary`, `/progress` both users' numbers side by side, `/desk` the project's documents (study document, subject, host VM, issues, notes), `/lab` the experiments from `docs/lab`. Desk and lab pages show the title and the text, with download and copy as two small icons.

Content: `scripts/sync-content.mjs` copies the cards, the glossary, the desk documents and the lab pages from `../` into `content/` and writes `content/library.json`, the list of both. A new desk document is added in the `DESK` table of that script. On Vercel `../` is absent and the committed `content/` is used, so run `node scripts/sync-content.mjs` and commit `content/` before deploying.

Login: one account per person, name and password from the environment variable `DECK_USERS` (`name:password,name:password`), session cookie signed with `DECK_SECRET` (`src/lib/auth.ts`, `src/proxy.ts`). Progress is stored per user as one JSON file in the project's private Vercel Blob store (`src/lib/store.ts`, `BLOB_READ_WRITE_TOKEN`), read and written through `/api/progress`; the browser keeps a copy in localStorage so the page opens at once, and progress made before the login existed is uploaded on the first login. All three variables are set on Vercel; `vercel env pull .env.local` for local work.

Deploy: `vercel --prod --yes` from this folder (project iot-deck on the 552020 account).
