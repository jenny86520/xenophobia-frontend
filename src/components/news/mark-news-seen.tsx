"use client";

import { useEffect } from "react";
import { markNewsReadAction } from "@/app/news/actions";

/**
 * Tells the backend the member has these messages on screen (/news or one message's page). A
 * mounted island rather than a write during rendering, so prefetching never marks anything.
 * Renders nothing; without JavaScript messages count as read only through the reminder popup.
 */
export function MarkNewsSeen({ ids }: { ids: string[] }) {
  const key = ids.join(",");
  useEffect(() => {
    if (key) void markNewsReadAction(key.split(","));
  }, [key]);
  return null;
}
