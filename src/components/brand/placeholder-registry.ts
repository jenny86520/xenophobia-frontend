/**
 * Placeholders that render no matter what the backend returns, because the
 * content or asset does not exist anywhere yet (design §8). Data-driven
 * placeholders (empty brand fields, game descriptions, social links) are
 * derived from GET /api/about by `npm run check:content` instead.
 *
 * Keep in sync with the <Placeholder name="..."> usages.
 */
export const STATIC_PLACEHOLDERS = [
  { name: "brand.key-visual", label: "主視覺", pages: ["/"] },
  { name: "gallery.photo-1", label: "活動照片", pages: ["/"] },
  { name: "gallery.photo-2", label: "活動照片", pages: ["/"] },
  { name: "gallery.photo-3", label: "活動照片", pages: ["/"] },
  { name: "gallery.photo-4", label: "活動照片", pages: ["/"] },
  { name: "legal.privacy", label: "隱私權政策", pages: ["*"] },
  { name: "legal.terms", label: "使用條款", pages: ["*"] },
] as const;

export type StaticPlaceholderName = (typeof STATIC_PLACEHOLDERS)[number]["name"];
