import { Info } from "lucide-react";
import type { ReactNode } from "react";
import { PopoverDialog } from "./popover-dialog";

type InfoDialogProps = {
  /** Unique on the page; ties the ⓘ button to its popover. */
  id: string;
  /** Dialog heading, also the button's name (「<title>」說明). */
  title: string;
  /** Shows this text beside the ⓘ, for a dialog people should notice; the button is then named by it. */
  label?: string;
  children: ReactNode;
};

/**
 * A small ⓘ button that opens a short explanation as a native popover dialog, like the legal
 * dialogs: no JavaScript needed, Esc or a click outside closes it, the close button takes focus.
 * Keeps details such as counting rules out of the page while leaving them one click away.
 */
export function InfoDialog({ id, title, label, children }: InfoDialogProps) {
  return (
    <>
      {label ? (
        <button
          type="button"
          popoverTarget={id}
          className="inline-flex cursor-pointer items-center gap-2 self-start text-body text-ink underline decoration-line-strong underline-offset-4 hover:decoration-current focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <Info aria-hidden="true" className="size-4 shrink-0 text-ink-secondary" />
          {label}
        </button>
      ) : (
        <button
          type="button"
          popoverTarget={id}
          aria-label={`「${title}」說明`}
          className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink-muted transition-colors hover:text-ink focus-visible:text-ink focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <Info aria-hidden="true" className="size-5" />
        </button>
      )}
      <PopoverDialog id={id} title={title}>
        {children}
      </PopoverDialog>
    </>
  );
}
