/**
 * Placeholders that render no matter what the backend returns, because the
 * content or asset does not exist anywhere yet (design §8). Data-driven
 * placeholders (empty brand fields, game descriptions, social links, unpublished
 * legal documents) are derived from the backend by `npm run check:content` instead.
 *
 * Keep in sync with the <Placeholder name="..."> usages.
 */
export const STATIC_PLACEHOLDERS: ReadonlyArray<{ name: string; label: string; pages: readonly string[] }> = [];
