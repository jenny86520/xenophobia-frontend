"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const VETO_REFRESH_MS = 3000;

/**
 * While the veto is on, re-renders the page from the server every few seconds (only while the tab
 * is visible), so both captains see the other's ban without reloading. Renders nothing; without
 * JavaScript a reload does the same.
 */
export function VetoAutoRefresh({ active }: { active: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, VETO_REFRESH_MS);
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
 * The time left for the current step. The server's view (the deadline, or 已逾時) is rendered
 * first, so it reads right without JavaScript; after hydration it counts down every second.
 */
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
    return <span>{overdue ? "已逾時" : `期限 ${clock(deadline)}（台灣時間）`}</span>;
  }
  const left = Math.ceil((new Date(deadline).getTime() - now) / 1000);
  return <span>{left > 0 ? `剩 ${left} 秒` : "已逾時"}</span>;
}
