import type { ReactNode } from "react";
import { FRIENDS_PANEL_ID } from "./friends-panel-id";

/**
 * A button that opens the friends sidebar where the member is, instead of a link to another page
 * (e.g. 「去完成」 for the first-friend quest). Native popover invoker, so it works without
 * JavaScript; only shown to signed-in members, who have the sidebar. The caller gives the look.
 */
export function OpenFriendsButton({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <button type="button" popoverTarget={FRIENDS_PANEL_ID} popoverTargetAction="show" className={className}>
      {children}
    </button>
  );
}
