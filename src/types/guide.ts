/** A fixed entry's key, one per feature with a 「怎麼玩？」 button (the backend's GUIDE_SLOTS). */
export type GuideSlot = "checkin" | "ice-cream";

/** /guide's list: published guides, fixed ones first. */
export type GuideSummary = { ref: string; title: string; kind: "fixed" | "free" };

export type GuideVideo = { source: "youtube"; youtubeId: string } | { source: "upload"; url: string; mimeType: string };

export type Guide = {
  /** The fixed key (e.g. "checkin") or a free entry's id; its page is /guide/<ref>. */
  ref: string;
  title: string;
  /** Plain text in the legal documents' format (blank line, "# ", "- "). */
  content: string;
  imageUrl: string | null;
  imageAlt: string;
  video: GuideVideo | null;
};
