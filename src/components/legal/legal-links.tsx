import { LEGAL_DIALOG_ID } from "./legal-ids";

/**
 * The footer's 「隱私權政策 / 使用條款」: buttons that open the legal dialogs, styled as the bottom
 * row's mono metadata and as text links (underline from the left, brighter on hover and focus), not
 * as buttons.
 */
export function LegalLinks() {
  const link =
    "link-underline cursor-pointer text-ink-secondary hover:text-ink focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none";
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-meta">
      <button type="button" popoverTarget={LEGAL_DIALOG_ID.privacy} className={link}>
        隱私權政策
      </button>
      <span aria-hidden="true" className="text-signal">
        /
      </span>
      <button type="button" popoverTarget={LEGAL_DIALOG_ID.terms} className={link}>
        使用條款
      </button>
    </p>
  );
}
