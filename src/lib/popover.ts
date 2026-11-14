/** Whether a native popover is showing; false where the browser (or jsdom) cannot tell. */
export function isPopoverOpen(element: Element): boolean {
  try {
    return element.matches(":popover-open");
  } catch {
    return false;
  }
}
