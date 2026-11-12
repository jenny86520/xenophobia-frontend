"use client";

import { useEffect } from "react";
import { markNewsReadAction } from "@/app/news/actions";

/**
 * Tells the backend the member opened this message's page (the /news list never marks anything:
 * a message counts as read only once opened). A mounted island rather than a write during
 * rendering, so prefetching never marks anything. Renders nothing; without JavaScript messages
 * count as read only through the reminder popup or 全部標記已讀.
 */
export function MarkNewsSeen({ ids }: { ids: string[] }) {
  const key = ids.join(",");
  useEffect(() => {
    if (key) void markNewsReadAction(key.split(","));
  }, [key]);
  return null;
}
