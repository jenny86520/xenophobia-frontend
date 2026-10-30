import type { CSSProperties } from "react";

/** Splits text into user-perceived characters (grapheme clusters), so CJK, emoji and accents stay whole. */
export function graphemes(text: string): string[] {
  return [...new Intl.Segmenter("zh-Hant", { granularity: "grapheme" }).segment(text)].map((part) => part.segment);
}

/**
 * Text that lights up character by character as it scrolls in (`.lit-text`/`.lit-char`, a CSS
 * view timeline; spec 品牌特效). Each character is an aria-hidden span carrying its position --p
 * (0..1); assistive tech reads the whole sentence once from the sr-only copy (unselectable, so a
 * copy is not doubled). Without support or with reduced motion the text is simply its normal colour.
 */
export function LitText({ text }: { text: string }) {
  const parts = graphemes(text);
  const last = Math.max(parts.length - 1, 1);
  return (
    <span className="lit-text">
      <span aria-hidden="true">
        {parts.map((part, i) => (
          <span key={i} className="lit-char" style={{ "--p": (i / last).toFixed(3) } as CSSProperties}>
            {part}
          </span>
        ))}
      </span>
      {/* Unselectable, so copying the sentence takes the visible characters only, once. */}
      <span className="sr-only select-none">{text}</span>
    </span>
  );
}
