import type { ReactNode } from "react";
import type { LegalKey } from "@/types/legal";
import { LEGAL_DIALOG_ID } from "./legal-ids";

/**
 * A document name inside running text (e.g. a consent box) that opens its legal dialog on this page,
 * so a half-filled form is never left. type="button": it never submits the form, and inside a
 * <label> it does not toggle the checkbox.
 */
export function LegalDialogButton({ kind, children }: { kind: LegalKey; children: ReactNode }) {
  return (
    <button
      type="button"
      popoverTarget={LEGAL_DIALOG_ID[kind]}
      className="cursor-pointer text-ink underline decoration-line-strong underline-offset-4 hover:decoration-current focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      {children}
    </button>
  );
}
