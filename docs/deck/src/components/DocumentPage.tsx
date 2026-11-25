"use client";
import { useRef, useState } from "react";
import { Lightbox, type LightboxItem } from "./Lightbox";

// A desk or lab document: the title and the text. Top right two small icons, download (.md) and copy.
export function DocumentPage({ title, slug, markdown, html }: { title: string; slug: string; markdown: string; html: string }) {
  const [copied, setCopied] = useState(false);
  const [box, setBox] = useState<{ items: LightboxItem[]; i: number } | null>(null);
  const docRef = useRef<HTMLDivElement>(null);

  // a click on a picture opens it full screen; the arrows there go through all pictures of the page
  function openPicture(img: HTMLImageElement) {
    const all = Array.from(docRef.current?.querySelectorAll("img") ?? []);
    const items = all.map((el) => ({ src: el.src, alt: el.alt, caption: el.closest("figure")?.querySelector("figcaption")?.textContent ?? el.alt }));
    setBox({ items, i: Math.max(0, all.indexOf(img)) });
  }

  function download() {
    const url = URL.createObjectURL(new Blob([markdown], { type: "text/markdown" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // clipboard unavailable: nothing to do
    }
  }

  const icon = "ui-icon-btn";
  return (
    <article>
      <div className="flex items-start gap-2">
        <h1 className="text-2xl font-semibold leading-tight mr-auto">{title}</h1>
        <button type="button" onClick={download} aria-label="Download" title="Download" className={icon}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v12m0 0-4-4m4 4 4-4M4 20h16" />
          </svg>
        </button>
        <button type="button" onClick={copy} aria-label="Copy" title={copied ? "Copied" : "Copy"} className={icon}>
          {copied ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m5 12 5 5 9-10" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="11" height="11" rx="2" />
              <path d="M5 15V6a2 2 0 0 1 2-2h9" />
            </svg>
          )}
        </button>
      </div>
      <div
        ref={docRef}
        className="prose doc mt-4 leading-relaxed"
        onClick={(e) => {
          const t = e.target as HTMLElement;
          if (t.tagName === "IMG") openPicture(t as HTMLImageElement);
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {box && <Lightbox items={box.items} index={box.i} onIndex={(i) => setBox({ ...box, i })} onClose={() => setBox(null)} />}
    </article>
  );
}
