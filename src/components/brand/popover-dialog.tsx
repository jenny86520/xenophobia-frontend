import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Heading } from "./typography";

type PopoverDialogProps = {
  /** Unique on the page; buttons open it with `popoverTarget={id}`. */
  id: string;
  title: string;
  /** `info` is the narrow width (short notes, confirmations); `wide` the legal dialogs' width. */
  size?: "info" | "wide";
  children: ReactNode;
};

/**
 * A native popover dialog, like the legal dialogs: no JavaScript needed, Esc or a click outside
 * closes it, the close button takes focus, and the browser returns focus to the opening button.
 * Opened by any `<button popoverTarget={id}>`.
 */
export function PopoverDialog({ id, title, size = "info", children }: PopoverDialogProps) {
  return (
    <div
      id={id}
      popover="auto"
      role="dialog"
      aria-labelledby={`${id}-title`}
      className={size === "info" ? "legal-dialog info-dialog" : "legal-dialog"}
    >
      <header className="flex items-start justify-between gap-6 border-b border-line-subtle px-6 py-4">
        <Heading level={2} size={3} id={`${id}-title`}>
          {title}
        </Heading>
        <button
          type="button"
          popoverTarget={id}
          popoverTargetAction="hide"
          autoFocus
          aria-label="關閉"
          className="legal-dialog-close -mt-1 -mr-2 inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-transparent text-ink-secondary hover:border-signal hover:text-ink focus-visible:border-signal"
        >
          <X aria-hidden="true" className="size-5" />
        </button>
      </header>
      <div className="legal-dialog-body flex flex-col gap-3 px-6 py-5 text-body text-ink-secondary">{children}</div>
    </div>
  );
}
