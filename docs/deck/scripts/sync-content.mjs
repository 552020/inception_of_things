// Copies the sources from ../ into content/, so a deploy from this folder has them:
//   ../evaluation/{cards,glossary}.md        -> content/
//   desk documents (see DESK below)          -> content/desk/<slug>.md
//   ../lab/<dir>/README.md or Vagrantfile    -> content/lab/<slug>.md (images in <dir>/img -> public/lab-img/<dir>/)
//   the lists of both                        -> content/library.json
// On Vercel ../ is absent; the committed copies in content/ are used as they are.
import { copyFileSync, cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname);
const docs = path.resolve(here, "../..");
const target = path.resolve(here, "../content");

if (!existsSync(path.join(docs, "evaluation"))) {
  for (const file of ["cards.md", "glossary.md", "library.json"]) {
    if (!existsSync(path.join(target, file))) {
      console.error(`missing content/${file}: neither ../ nor content/ has it`);
      process.exit(1);
    }
  }
  console.log("kept content/ (no ../evaluation here)");
  process.exit(0);
}

mkdirSync(path.join(target, "desk"), { recursive: true });
mkdirSync(path.join(target, "lab"), { recursive: true });

for (const file of ["cards.md", "glossary.md"]) {
  copyFileSync(path.join(docs, "evaluation", file), path.join(target, file));
  console.log(`synced ${file}`);
}

// Desk: group title, folder under docs/, files in the order shown.
const DESK = [
  { group: "Study", dir: "evaluation", files: ["oral-evaluation.md"] },
  { group: "Subject", dir: "subject", files: ["inception-of-things.md"] },
  { group: "Host VM", dir: "host-vm", files: ["vm-setup.md", "vagrant.md", "qemu.md", "qemu_essential.md", "hostname.md"] },
  { group: "Issues", dir: "issues", files: ["part1-todo.md", "implement-ansible.md", "yli-branch-ideas.md"] },
  { group: "Working notes", dir: ".", files: ["slombard-start-here.md"] },
];

// Two documents share the H1 of the subject; the list needs different names.
const DESK_TITLES = { "oral-evaluation": "Study document for the oral", "inception-of-things": "The subject" };

function plain(text) {
  return text
    .replace(/[*_`]/g, "")
    .replace(/^[^\p{L}\p{N}]+/u, "")
    .trim();
}

function titleOf(md, fallback) {
  const first = md.split("\n").find((l) => l.trim() !== "");
  const match = first && first.match(/^#\s+(.*)$/);
  return match ? plain(match[1]) : fallback;
}

function humanise(name) {
  return name.replace(/\.md$/, "").replace(/[-_]/g, " ");
}

const library = { desk: [], lab: [] };

for (const { group, dir, files } of DESK) {
  for (const file of files) {
    const source = path.join(docs, dir, file);
    if (!existsSync(source)) {
      console.log(`skipped ${dir}/${file} (not on this branch)`);
      continue;
    }
    const slug = file.replace(/\.md$/, "");
    const md = readFileSync(source, "utf8");
    writeFileSync(path.join(target, "desk", `${slug}.md`), md);
    library.desk.push({ group, slug, title: DESK_TITLES[slug] ?? titleOf(md, humanise(file)) });
  }
}

// Lab: one page per experiment folder. A README is the page; a folder with only a Vagrantfile shows that file.
const LAB_TITLES = { "docker-rpodack": "Docker provider setup" };
for (const entry of readdirSync(path.join(docs, "lab"), { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const dir = path.join(docs, "lab", entry.name);
  let md;
  let title;
  if (existsSync(path.join(dir, "README.md"))) {
    md = readFileSync(path.join(dir, "README.md"), "utf8");
    if (existsSync(path.join(dir, "img"))) {
      // images next to the page: img/x.png in the Markdown is served from /lab-img/<folder>/x.png
      rmSync(path.join(here, "../public/lab-img", entry.name), { recursive: true, force: true });
      cpSync(path.join(dir, "img"), path.join(here, "../public/lab-img", entry.name), { recursive: true });
      md = md.replaceAll("](img/", `](/lab-img/${entry.name}/`).replaceAll('src="img/', `src="/lab-img/${entry.name}/`);
    }
    title = LAB_TITLES[entry.name] ?? titleOf(md, humanise(entry.name));
  } else if (existsSync(path.join(dir, "Vagrantfile"))) {
    title = humanise(entry.name);
    md = `# ${title}\n\n\`\`\`ruby\n${readFileSync(path.join(dir, "Vagrantfile"), "utf8").trimEnd()}\n\`\`\`\n`;
  } else {
    continue;
  }
  writeFileSync(path.join(target, "lab", `${entry.name}.md`), md);
  library.lab.push({ slug: entry.name, title });
}
library.lab.sort((a, b) => a.title.localeCompare(b.title));

// Final-state sketches of the three parts, shown on the public pages /parts/1 to /parts/3. The sources live in
// docs/diagrams once that folder is on this branch; until then the committed copies in public/diagrams are used.
const sketches = path.join(docs, "diagrams");
if (existsSync(sketches)) {
  mkdirSync(path.join(here, "../public/diagrams"), { recursive: true });
  for (const n of [1, 2, 3]) {
    const file = `p${n}-final-state-sketch.png`;
    if (existsSync(path.join(sketches, file))) {
      copyFileSync(path.join(sketches, file), path.join(here, "../public/diagrams", file));
      console.log(`synced ${file}`);
    }
  }
}

writeFileSync(path.join(target, "library.json"), JSON.stringify(library, null, 2) + "\n");
console.log(`synced ${library.desk.length} desk documents and ${library.lab.length} lab pages`);
