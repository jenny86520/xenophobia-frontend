import { IceCreamIcon } from "@/components/brand/ice-cream-icon";
import { stampSkin } from "@/components/member/stamp-card";
import { cn } from "@/lib/utils";
import type { CosmeticLook } from "@/types/cosmetic";
import { frameProps } from "./frame";
import { MemberTitleTag } from "./member-title-tag";

/** The name in a frame preview when no member is signed in (visitors, or no nickname given). */
export const SAMPLE_NAME = "你的名字";

/**
 * What a cosmetic looks like, for shop cards and the collection: the title tag itself, a name row in
 * the frame, one stamped seal, or the cup. Decorative (the name beside it says what it is). The frame
 * row shows `sampleName` (the signed-in member's own nickname), else 「你的名字」; a name too long for
 * the space keeps its start and ends in an ellipsis (CSS, by the width actually there).
 */
export function CosmeticPreview({
  kind,
  look,
  sampleName,
  className,
}: {
  kind: string;
  look: CosmeticLook;
  sampleName?: string | null;
  className?: string;
}) {
  return (
    <span aria-hidden="true" className={cn("flex max-w-full min-w-0 items-center justify-center", className)}>
      <PreviewBody kind={kind} look={look} sampleName={sampleName?.trim() || SAMPLE_NAME} />
    </span>
  );
}

function PreviewBody({ kind, look, sampleName }: { kind: string; look: CosmeticLook; sampleName: string }) {
  if (kind === "title") return <MemberTitleTag look={look} className="text-body" />;
  if (kind === "frame") {
    const frame = frameProps(look);
    return (
      <span
        data-frame={frame["data-frame"]}
        data-ornament={frame["data-ornament"]}
        style={frame.style}
        className={cn("max-w-full min-w-0 px-3 py-2 text-body text-ink", frame.className)}
      >
        {/* Truncated inside the frame, never on it: corner ornaments reach past the frame's edge. */}
        <span data-preview-name className="block truncate">
          {sampleName}
        </span>
      </span>
    );
  }
  if (kind === "stamp") {
    const skin = stampSkin(look);
    const seal = (
      <span className="relative flex size-16 items-center justify-center">
        <span
          style={skin?.style}
          className={cn(
            "absolute inset-[6%] flex -rotate-6 items-center justify-center rounded-full border-2 border-signal bg-signal/15 outline-1 outline-offset-2 outline-signal/50 outline-dashed",
            skin?.className,
          )}
        >
          {skin?.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={skin.imageUrl} alt="" width={40} height={40} className="size-[85%] object-contain" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/brand/xpa-logo.png" alt="" width={40} height={40} className="size-3/5 object-contain" />
          )}
        </span>
      </span>
    );
    // A card theme shows behind the seal, like a corner of the member's stamp card.
    if (!skin?.card) return seal;
    return (
      <span
        data-pattern={skin.card.pattern}
        style={skin.card.style}
        className={cn("flex items-center justify-center p-3!", skin.card.className)}
      >
        {seal}
      </span>
    );
  }
  return <IceCreamIcon className="size-14 text-ink-secondary" look={look} />;
}
