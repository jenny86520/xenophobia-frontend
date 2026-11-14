import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PopoverDialog } from "./popover-dialog";

/** The look of the buttons that open and cancel a confirmation (a secondary, outlined button). */
export const CONFIRM_TRIGGER_CLASSES = cn(
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-sm border border-line-strong px-4 py-2 text-body text-ink",
  "hover:border-signal focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
);

/**
 * A second confirmation for something that cannot be undone (buying, deleting): a native popover
 * dialog that explains what will happen (`children`) and holds the real form (`confirm`, usually a
 * Server Action button) beside a cancel button. Opened by a `<button popoverTarget={id}>`, so it
 * works without JavaScript; Esc, a click outside or the cancel button closes it and sends nothing.
 */
export function ConfirmDialog({
  id,
  title,
  confirm,
  cancelLabel = "取消",
  children,
}: {
  id: string;
  title: string;
  confirm: ReactNode;
  cancelLabel?: string;
  children: ReactNode;
}) {
  return (
    <PopoverDialog id={id} title={title}>
      {children}
      <div className="flex flex-wrap items-start gap-2 pt-2">
        {confirm}
        <button type="button" popoverTarget={id} popoverTargetAction="hide" className={CONFIRM_TRIGGER_CLASSES}>
          {cancelLabel}
        </button>
      </div>
    </PopoverDialog>
  );
}
