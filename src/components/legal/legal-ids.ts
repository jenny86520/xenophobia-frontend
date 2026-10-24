import type { LegalKey } from "@/types/legal";

/**
 * Ids of the two legal dialogs (popovers) rendered once by the root layout. Any button on the page
 * opens one with `popoverTarget={LEGAL_DIALOG_ID.terms}`. A plain module, so both Server and Client
 * Components can import it.
 */
export const LEGAL_DIALOG_ID: Record<LegalKey, string> = {
  privacy: "legal-privacy",
  terms: "legal-terms",
};
