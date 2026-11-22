# Inception-of-Things cards

Flashcards and glossary for the oral evaluation, as a web page. Live at https://iot42.vercel.app (open it in Safari on the phone, "Add to Home Screen" for a full-screen app).

Source of truth: `../evaluation/cards.md` (one `###` heading per card: front, text under it: back, `tags:` line) and `../evaluation/glossary.md`. `pnpm build` copies both into `content/` first (`scripts/sync-content.mjs`); commit the copies, the deploy uses them.

Pages: `/` review with FSRS scheduling (ts-fsrs), `/cards` the whole list with a tag filter, `/glossary`, `/progress` both users' numbers side by side.

Login: one account per person, name and password from the environment variable `DECK_USERS` (`name:password,name:password`), session cookie signed with `DECK_SECRET` (`src/lib/auth.ts`, `src/proxy.ts`). Progress is stored per user as one JSON file in the project's private Vercel Blob store (`src/lib/store.ts`, `BLOB_READ_WRITE_TOKEN`), read and written through `/api/progress`; the browser keeps a copy in localStorage so the page opens at once, and progress made before the login existed is uploaded on the first login. All three variables are set on Vercel; `vercel env pull .env.local` for local work.

Deploy: `vercel --prod --yes` from this folder (project iot-deck on the 552020 account).
