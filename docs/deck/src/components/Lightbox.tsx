"use client";
import { useEffect, useRef } from "react";

export type LightboxItem = { src: string; alt: string; caption: string };

// A picture full screen, with arrows to the previous and the next one (also the arrow keys and a swipe), Escape closes.
export function Lightbox({ items, index, onIndex, onClose }: { items: LightboxItem[]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const touch = useRef<number | null>(null);
  const last = items.length - 1;
  const go = (d: number) => onIndex(Math.min(last, Math.max(0, index + d)));

  useEffect(() => {
    function key(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") onIndex(Math.min(last, index + 1));
      else if (e.key === "ArrowLeft") onIndex(Math.max(0, index - 1));
      else if (e.key === "Home") onIndex(0);
      else if (e.key === "End") onIndex(last);
    }
    window.addEventListener("keydown", key);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // load the neighbours already
    for (const i of [index - 1, index + 1]) if (items[i]) new Image().src = items[i].src;
    return () => {
      window.removeEventListener("keydown", key);
      document.body.style.overflow = overflow;
    };
  }, [index, items, last, onClose, onIndex]);

  const item = items[index];
  const arrow = "lb-arrow";
  return (
    <div
      className="lb"
      role="dialog"
      aria-modal="true"
      aria-label="Picture"
      onClick={onClose}
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch.current === null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        touch.current = null;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      }}
    >
      <button type="button" className="lb-close" aria-label="Close" onClick={onClose}>
        ×
      </button>
      {index > 0 && (
        <button type="button" className={`${arrow} lb-prev`} aria-label="Previous" onClick={(e) => { e.stopPropagation(); go(-1); }}>
          ‹
        </button>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="lb-img" src={item.src} alt={item.alt} onClick={(e) => e.stopPropagation()} />
      {index < last && (
        <button type="button" className={`${arrow} lb-next`} aria-label="Next" onClick={(e) => { e.stopPropagation(); go(1); }}>
          ›
        </button>
      )}
      <div className="lb-bar" onClick={(e) => e.stopPropagation()}>
        <span className="lb-count">
          {index + 1} / {items.length}
        </span>
        <span>{item.caption}</span>
      </div>
    </div>
  );
}
