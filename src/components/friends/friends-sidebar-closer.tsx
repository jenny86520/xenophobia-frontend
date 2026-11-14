"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Folds the friends sidebar away when the member moves to another page. The sidebar lives in the
 * root layout, which client navigation never remounts, so without this it would stay open over the
 * next page (after a friend's name, or a group invite that leads to its match). A Server Action's
 * refresh keeps the path, so the sidebar stays open with its message after a form is sent.
 */
export function FriendsSidebarCloser({ panelId }: { panelId: string }) {
  const pathname = usePathname();
  const shownFor = useRef(pathname);

  useEffect(() => {
    if (shownFor.current === pathname) return;
    shownFor.current = pathname;
    const panel = document.getElementById(panelId);
    try {
      // Hiding a popover that is not open does nothing (older browsers threw).
      panel?.hidePopover();
    } catch {
      // Already closed.
    }
  }, [panelId, pathname]);

  return null;
}
