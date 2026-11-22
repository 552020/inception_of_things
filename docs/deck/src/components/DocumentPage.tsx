"use client";
import { useState } from "react";

// A desk or lab document: the title and the text. Top right two small icons, download (.md) and copy.
export function DocumentPage({ title, slug, markdown, html }: { title: string; slug: string; markdown: string; html: string }) {
  const [copied, setCopied] = useState(false);

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
      <div className="prose doc mt-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
