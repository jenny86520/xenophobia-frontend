import { cn } from "@/lib/utils";
import { MetaLabel } from "./meta-label";

type EyebrowProps = {
  /** Chapter number, rendered as "01 — ". */
  index?: number;
  /** "SECTION / DETAIL"; the " / " separator is drawn in the signal color. */
  children: string;
  className?: string;
  id?: string;
};

/** Section opener metadata, e.g. "01 — WHO WE ARE" or "PARTY / INDEX". */
export function Eyebrow({ index, children, className, id }: EyebrowProps) {
  const [first, ...rest] = children.split(" / ");
  return (
    <MetaLabel id={id} className={cn("block", className)}>
      {index !== undefined && (
        <>
          {String(index).padStart(2, "0")}
          <span className="text-signal"> — </span>
        </>
      )}
      {first}
      {rest.length > 0 && (
        <>
          <span className="text-signal"> / </span>
          {rest.join(" / ")}
        </>
      )}
    </MetaLabel>
  );
}
