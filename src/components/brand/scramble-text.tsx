"use client";

import { useEffect, useRef, useState } from "react";

/** What a not-yet-settled character shows: the mono glyphs of a terminal readout. */
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/_";
/** The whole label settles within this time (spec 品牌特效: ≤ 800ms). */
export const SCRAMBLE_MS = 600;

/**
 * The text with its first `settled` characters in place and every later letter or digit replaced
 * by a random glyph. Spaces and punctuation stay, so a mono label keeps its exact width.
 */
export function scramble(text: string, settled: number, random: () => number = Math.random): string {
  return [...text]
    .map((ch, i) => (i < settled || !/[A-Za-z0-9]/.test(ch) ? ch : GLYPHS[Math.floor(random() * GLYPHS.length)]))
    .join("");
}

/**
 * A label that decodes from random glyphs the first time it scrolls into view (spec 品牌特效),
 * left to right within SCRAMBLE_MS, once per element. The real text is always the only text in the
 * page (what assistive tech reads and what a copy takes); while decoding it is only made
 * transparent under an aria-hidden layer of glyphs, which is removed at the end. Reduced motion, a
 * missing IntersectionObserver or no JavaScript leave the real text as it is.
 */
export function ScrambleText({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  /** The glyph layer while decoding; null otherwise. */
  const [glyphs, setGlyphs] = useState<string | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || !("IntersectionObserver" in window)) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / SCRAMBLE_MS, 1);
          setGlyphs(progress < 1 ? scramble(text, Math.floor(progress * text.length)) : null);
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [text]);

  return (
    <span ref={ref} className="relative">
      <span className={glyphs === null ? undefined : "text-transparent"}>{text}</span>
      {glyphs !== null && (
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 whitespace-nowrap select-none">
          {glyphs}
        </span>
      )}
    </span>
  );
}
