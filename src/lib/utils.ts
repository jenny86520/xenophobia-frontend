import { createCn } from "cn/config";

/** The design system's text sizes (the --text-* tokens in globals.css). */
const TEXT_SIZES = ["display", "h1", "h2", "h3", "lead", "body", "caption", "meta", "label"];

/**
 * Merges class names like clsx + tailwind-merge. The design system's text sizes are registered as
 * font sizes: unknown to the default config, `text-meta` would otherwise be taken for a colour and
 * dropped next to `text-ink-muted`, leaving the text at 16px.
 */
export const cn = createCn({
  extend: { classGroups: { "font-size": [{ text: TEXT_SIZES }] } },
});
