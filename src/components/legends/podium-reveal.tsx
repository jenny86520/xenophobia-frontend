"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Arms the podium's trophies once JavaScript runs (`data-podium="armed"` hides them) and pops them
 * up when the podium scrolls into view (`"shown"`), once; the CSS in globals.css does the rest.
 * Reduced motion, a missing IntersectionObserver or no JavaScript leave the trophies as they are.
 */
export function PodiumReveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || !("IntersectionObserver" in window)) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    element.dataset.podium = "armed";
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        element.dataset.podium = "shown";
      },
      { threshold: 0.4 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref}>{children}</div>;
}
