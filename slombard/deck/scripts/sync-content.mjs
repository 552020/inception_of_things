// Copies the card and glossary sources from ../docs into content/, so a deploy from this folder has them.
// On Vercel ../docs is absent; the committed copies in content/ are used as they are.
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname);
const docs = path.resolve(here, "../../docs");
const target = path.resolve(here, "../content");
mkdirSync(target, { recursive: true });
for (const file of ["cards.md", "glossary.md"]) {
  const source = path.join(docs, file);
  const copy = path.join(target, file);
  if (existsSync(source)) {
    copyFileSync(source, copy);
    console.log(`synced ${file}`);
  } else if (existsSync(copy)) {
    console.log(`kept ${file} (no ../docs here)`);
  } else {
    console.error(`missing ${file}: neither ../docs nor content/ has it`);
    process.exit(1);
  }
}
