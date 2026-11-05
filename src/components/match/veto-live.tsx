"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const MATCH_REFRESH_MS = 3000;

/**
 * While something moves on its own (the veto, the server getting ready, a match in game), re-renders
 * the page from the server every few seconds (only while the tab is visible), so everyone sees the
 * other captain's ban or the live score without reloading. Renders nothing; without JavaScript a
 * reload does the same.
 */
export function MatchAutoRefresh({ active }: { active: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, MATCH_REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [active, router]);
  return null;
}

/** "18:42:05" in Taiwan time. */
function clock(iso: string): string {
  return new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

/**
 * The time left for the current step. The server's view (the deadline, or that time is up) is
 * rendered first, so it reads right without JavaScript; after hydration it counts down every second.
 */
/** Time is up: the backend bans at random for that team within a few seconds. */
export const TIME_UP_TEXT = "時間到，即將隨機 Ban";

export function StepCountdown({ deadline, overdue }: { deadline: string; overdue: boolean }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = window.setTimeout(tick, 0);
    const timer = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
    };
  }, []);

  if (now === null) {
    return <span>{overdue ? TIME_UP_TEXT : `期限 ${clock(deadline)}（台灣時間）`}</span>;
  }
  const left = Math.ceil((new Date(deadline).getTime() - now) / 1000);
  return <span>{left > 0 ? `剩 ${left} 秒` : TIME_UP_TEXT}</span>;
}
