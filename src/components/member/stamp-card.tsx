import Image from "next/image";
import type { CSSProperties } from "react";
import { MetaLabel } from "@/components/brand/meta-label";
import { TextLink } from "@/components/brand/text-link";
import { cn } from "@/lib/utils";
import type { CosmeticLook } from "@/types/cosmetic";
import { choice, skinVars } from "@/utils/cosmetics";
import { mediaUrl } from "@/utils/media";
import { pointsTabHref } from "@/utils/member-tabs";
import { type StampProgress, type StampSlot, stampCard, stampProgressText } from "@/utils/stamp-card";

/**
 * One slot: a red seal bearing the XPA logo once stamped, else a dashed ring with the day (「+1」 on the bonus
 * day), so stamped and empty differ by shape and text, not colour alone. The data-* attributes drive
 * the stamp animation (.stamp-mark in globals.css), played by CheckInPanel right after a check-in.
 */
function Slot({ slot, look }: { slot: StampSlot; look?: StampSkin | null }) {
  return (
    <li
      data-stamped={slot.stamped || undefined}
      data-stamp-today={slot.today || undefined}
      data-stamp-bonus={slot.bonus || undefined}
      className={cn(
        "relative flex aspect-square items-center justify-center rounded-full font-mono",
        !slot.stamped && "border border-dashed text-caption",
        !slot.stamped && (slot.bonus ? "border-signal text-signal" : "border-line-strong text-ink-secondary"),
        !slot.stamped && slot.today && "border-solid border-ink-secondary",
      )}
    >
      {slot.stamped ? (
        <span
          style={look?.style}
          className={cn(
            "stamp-mark absolute inset-[6%] flex -rotate-6 items-center justify-center rounded-full border-2 border-signal bg-signal/15 outline-1 outline-offset-2 outline-signal/50 outline-dashed",
            look?.className,
          )}
        >
          {look?.imageUrl ? (
            // A cosmetic's stamp image comes from the backend's origin, like party covers (no next/image).
            // eslint-disable-next-line @next/next/no-img-element
            <img src={look.imageUrl} alt="" width={64} height={64} className="size-3/5 object-contain" />
          ) : (
            <Image src="/brand/xpa-logo.png" alt="" width={64} height={64} className="size-3/5" />
          )}
        </span>
      ) : slot.bonus ? (
        "+1"
      ) : (
        slot.day
      )}
      {slot.stamped && slot.bonus && (
        <span className="stamp-bonus absolute -top-1 -right-1 rounded-sm bg-cta px-1 text-meta text-cta-ink">+1</span>
      )}
    </li>
  );
}

/** Links to the neighbouring cards of a long campaign; the ledger's page stays as it is. */
function CardPages({ index, count, ledgerPage }: { index: number; count: number; ledgerPage: number }) {
  const href = (card: number) => `${pointsTabHref({ page: ledgerPage, card })}#stamp-card`;
  return (
    <nav aria-label="集點卡分頁" className="flex items-center justify-between gap-4 text-body">
      {index > 1 ? <TextLink href={href(index - 1)}>上一張</TextLink> : <span />}
      <MetaLabel>
        第 {index} / {count} 張
      </MetaLabel>
      {index < count ? <TextLink href={href(index + 1)}>下一張</TextLink> : <span />}
    </nav>
  );
}

/** The equipped stamp card look, turned into classes and CSS variables for the stamped slots. */
type StampSkin = { className: string; style: CSSProperties; imageUrl: string | null };

/**
 * A stamp card cosmetic (spec member-cosmetics): the seal takes its ink colour (border, a light
 * fill, the dashed outline) and image; the square seal is square, with a single or double border.
 * Unknown templates keep the default red XPA seal.
 */
export function stampSkin(look: CosmeticLook | null | undefined): StampSkin | null {
  if (!look || (look.template !== "stamp.seal" && look.template !== "stamp.square")) return null;
  const style = skinVars(look.params, { "--skin-ink": "inkColor" });
  if (!("--skin-ink" in style)) return null;
  const square = look.template === "stamp.square";
  const double = square && choice(look.params.border, ["single", "double"] as const, "single") === "double";
  return {
    style,
    imageUrl: look.imageUrl ? mediaUrl(look.imageUrl) : null,
    className: cn(
      "border-(--skin-ink) bg-[color-mix(in_oklch,var(--skin-ink)_15%,transparent)] outline-[color-mix(in_oklch,var(--skin-ink)_50%,transparent)]",
      square && "rounded-sm",
      double && "border-4 border-double",
    ),
  };
}

type StampCardProps = StampProgress & {
  /** The member's equipped stamp card look; null or missing = the default seal. */
  look?: CosmeticLook | null;
  /** `?card=` from the URL, used when it names an existing card. */
  requestedCard?: number;
  /** The ledger's current page, kept by the card links. */
  ledgerPage: number;
};

/**
 * The running campaign's stamp card (spec 連續簽到集點卡): ten slots a row (five when narrow), the
 * whole run up to 30 days, longer runs one card of ten at a time. The slots are decorative; the
 * progress line is what assistive tech reads.
 */
export function StampCard({ requestedCard, ledgerPage, look, ...progress }: StampCardProps) {
  const { slots, page } = stampCard(progress, requestedCard);
  const skin = stampSkin(look);
  return (
    <div id="stamp-card" className="@container flex scroll-mt-24 flex-col gap-4">
      <ol aria-hidden="true" className="grid grid-cols-5 gap-3 @md:grid-cols-10">
        {slots.map((slot) => (
          <Slot key={slot.day} slot={slot} look={skin} />
        ))}
      </ol>
      <p className="font-mono text-lead text-ink">{stampProgressText(progress.streak, progress.requiredDays)}</p>
      {page && <CardPages index={page.index} count={page.count} ledgerPage={ledgerPage} />}
    </div>
  );
}
