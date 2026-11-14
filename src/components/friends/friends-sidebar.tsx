import { Users, X } from "lucide-react";
import { PendingCount } from "@/components/brand/pending-count";
import { Heading } from "@/components/brand/typography";
import type { FriendsOverview } from "@/types/friends";
import { FRIENDS_PANEL_ID } from "./friends-panel-id";
import { FriendsSidebarCloser } from "./friends-sidebar-closer";
import { FriendsSidebarContent } from "./friends-sidebar-content";

/**
 * The friends sidebar, on every page for a signed-in member (the root layout renders it only when
 * the friends could be read). Folded, it is a handle on the right edge, centred vertically, clear
 * of 回到頂端 (bottom right) and the shop's 我的點數 (top right), with what waits for the member's
 * friends (`pending`, counted by the backend). The handle opens a native popover panel from the
 * right, so it works without JavaScript: Esc, a click outside or 關閉 folds it, and the browser
 * returns focus to the handle. Any `OpenFriendsButton` opens it too.
 */
export function FriendsSidebar({ overview, pending }: { overview: FriendsOverview; pending: number }) {
  const titleId = `${FRIENDS_PANEL_ID}-title`;
  return (
    <>
      <button
        type="button"
        popoverTarget={FRIENDS_PANEL_ID}
        className="fixed top-1/2 right-0 z-40 flex -translate-y-1/2 cursor-pointer flex-col items-center gap-2 rounded-l-sm border border-r-0 border-line-strong bg-surface-elevated px-2 py-3 text-body text-ink transition-[border-color,box-shadow] duration-200 hover:border-signal hover:shadow-glow focus-visible:border-signal focus-visible:shadow-glow focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <Users aria-hidden="true" className="size-5" />
        <span className="[writing-mode:vertical-rl]">好友</span>
        <PendingCount count={pending} />
      </button>
      <div id={FRIENDS_PANEL_ID} popover="auto" role="dialog" aria-labelledby={titleId} className="friends-panel">
        <header className="flex items-start justify-between gap-6 border-b border-line-subtle px-6 py-4">
          <Heading level={2} size={3} id={titleId}>
            好友
          </Heading>
          <button
            type="button"
            popoverTarget={FRIENDS_PANEL_ID}
            popoverTargetAction="hide"
            autoFocus
            aria-label="關閉"
            className="legal-dialog-close -mt-1 -mr-2 inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-transparent text-ink-secondary hover:border-signal hover:text-ink focus-visible:border-signal"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </header>
        <div className="friends-panel-body px-6 py-6">
          <FriendsSidebarContent overview={overview} />
        </div>
      </div>
      <FriendsSidebarCloser panelId={FRIENDS_PANEL_ID} />
    </>
  );
}
