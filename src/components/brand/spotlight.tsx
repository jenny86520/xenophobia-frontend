"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Only a mouse-like pointer gets the light; touch has no cursor to follow. */
const FINE_POINTER = "(hover: hover) and (pointer: fine)";

/**
 * Wraps a group of cards marked `data-spotlight` and lights the ones near the cursor (spec
 * 品牌特效, CSS in globals.css): on pointer moves it writes the cursor position relative to each
 * card as --spot-x/--spot-y (once per frame) and sets data-spot-on on itself while the pointer is
 * inside. Without JavaScript, on touch, or where matchMedia is missing it never sets anything, so
 * the cards look exactly as before.
 */
export function Spotlight({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || !window.matchMedia?.(FINE_POINTER).matches) return;
    let frame = 0;
    let pointer: { x: number; y: number } | null = null;

    const paint = () => {
      frame = 0;
      if (!pointer) return;
      for (const card of root.querySelectorAll<HTMLElement>("[data-spotlight]")) {
        const box = card.getBoundingClientRect();
        card.style.setProperty("--spot-x", `${pointer.x - box.left}px`);
        card.style.setProperty("--spot-y", `${pointer.y - box.top}px`);
      }
    };
    const move = (event: MouseEvent) => {
      pointer = { x: event.clientX, y: event.clientY };
      root.dataset.spotOn = "";
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const leave = () => {
      delete root.dataset.spotOn;
    };

    root.addEventListener("pointermove", move);
    root.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(frame);
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerleave", leave);
      delete root.dataset.spotOn;
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
