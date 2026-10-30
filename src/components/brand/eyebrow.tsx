import { cn } from "@/lib/utils";
import { MetaLabel } from "./meta-label";
import { ScrambleText } from "./scramble-text";

type EyebrowProps = {
  /** Chapter number, rendered as "01 — ". */
  index?: number;
  /** "SECTION / DETAIL"; the " / " separator is drawn in the signal color. */
  children: string;
  className?: string;
  id?: string;
};

/**
 * Section opener metadata, e.g. "01 — WHO WE ARE" or "PARTY / INDEX". Each text part decodes from
 * random glyphs the first time it scrolls in (ScrambleText); the signal separators stay put.
 */
export function Eyebrow({ index, children, className, id }: EyebrowProps) {
  const [first, ...rest] = children.split(" / ");
  return (
    <MetaLabel id={id} className={cn("block", className)}>
      {index !== undefined && (
        <>
          <ScrambleText text={String(index).padStart(2, "0")} />
          <span className="text-signal"> — </span>
        </>
      )}
      <ScrambleText text={first} />
      {rest.length > 0 && (
        <>
          <span className="text-signal"> / </span>
          <ScrambleText text={rest.join(" / ")} />
        </>
      )}
    </MetaLabel>
  );
}
