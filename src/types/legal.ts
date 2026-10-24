/** The legal documents shown in the footer dialogs (GET /api/legal/:key). */
export type LegalKey = "privacy" | "terms";

export type LegalDocument = {
  key: LegalKey;
  title: string;
  /** Plain text; empty until an admin publishes it. */
  content: string;
  version: number;
  updatedAt: string | null;
};
