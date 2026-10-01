"use client";

import { useEffect, useState } from "react";
import { formatCountdownToStart } from "@/utils/countdown";

/** Ticks every second and returns the formatted countdown string toward the given start date/time. */
export function useCountdown(targetDate?: string, targetTime?: string): string {
  const [countdown, setCountdown] = useState("--");

  useEffect(() => {
    if (!targetDate || !targetTime) return;

    const tick = () => {
      setCountdown(formatCountdownToStart(targetDate, targetTime));
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [targetDate, targetTime]);

  return countdown;
}
