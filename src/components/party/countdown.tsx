"use client";

import { useCountdown } from "@/hooks/use-countdown";

type CountdownProps = {
  startDate: string;
  startTime: string;
  className?: string;
};

/**
 * The only client island on the home page: ticks every second toward the start.
 * Server HTML (and no-JS) shows the start date and time instead of a stale value.
 */
export function Countdown({ startDate, startTime, className }: CountdownProps) {
  const countdown = useCountdown(startDate, startTime);
  const ready = countdown !== "--";
  return (
    <span className={className} data-complete={countdown === "Starting now" ? "true" : undefined}>
      {ready ? countdown : `${startDate} ${startTime}`}
    </span>
  );
}
