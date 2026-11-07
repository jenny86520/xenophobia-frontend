"use client";

import { useEffect } from "react";
import { markIceCreamsSeenAction } from "@/app/member/actions";

/**
 * Tells the backend the member has seen their new tokens, once the 冰炫風 tab is on screen. A
 * mounted island rather than a write during rendering, so prefetching never marks anything.
 * Renders nothing; without JavaScript the tokens stay new until the member's next action.
 */
export function MarkIceCreamsSeen() {
  useEffect(() => {
    void markIceCreamsSeenAction();
  }, []);
  return null;
}
