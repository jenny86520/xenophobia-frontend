import { IceCreamIcon } from "@/components/brand/ice-cream-icon";
import { stampSkin } from "@/components/member/stamp-card";
import { cn } from "@/lib/utils";
import type { CosmeticLook } from "@/types/cosmetic";
import { frameProps } from "./frame";
import { MemberTitleTag } from "./member-title-tag";

/**
 * What a cosmetic looks like, for shop cards and the collection: the title tag itself, a sample name
 * row in the frame, one stamped seal, or the cup. Decorative (the name beside it says what it is).
 */
export function CosmeticPreview({ kind, look, className }: { kind: string; look: CosmeticLook; className?: string }) {
  return (
    <span aria-hidden="true" className={cn("flex items-center justify-center", className)}>
      <PreviewBody kind={kind} look={look} />
    </span>
  );
}

function PreviewBody({ kind, look }: { kind: string; look: CosmeticLook }) {
  if (kind === "title") return <MemberTitleTag look={look} className="text-body" />;
  if (kind === "frame") {
    const frame = frameProps(look);
    return (
      <span data-frame={frame["data-frame"]} style={frame.style} className={cn("px-3 py-2 text-body text-ink", frame.className)}>
        你的名字
      </span>
    );
  }
  if (kind === "stamp") {
    const skin = stampSkin(look);
    return (
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
            <img src={skin.imageUrl} alt="" width={40} height={40} className="size-3/5 object-contain" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/brand/xpa-logo.png" alt="" width={40} height={40} className="size-3/5 object-contain" />
          )}
        </span>
      </span>
    );
  }
  return <IceCreamIcon className="size-14 text-ink-secondary" look={look} />;
}
