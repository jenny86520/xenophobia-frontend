import { Crown } from "lucide-react";
import { MemberTitleTag } from "@/components/cosmetics/member-title-tag";
import { IceShowcaseStrip } from "@/components/ice-cream/ice-showcase-strip";
import type { CosmeticLook } from "@/types/cosmetic";
import type { IceShowcaseItem } from "@/types/ice-cream";

/**
 * One player's line in the scrim room (roster, team columns, candidates): the captain mark and name
 * on the left, then the equipped title, the shown ice creams and the rating. It tries to stay on one
 * line; when it cannot, what wraps lines up on the right (`justify-end`, the name keeping the left
 * with `mr-auto`), so the name never moves and the extras never sit under it.
 */
export function PlayerLineItems({
  player,
  idPrefix,
  rating,
}: {
  player: {
    name: string;
    isCaptain?: boolean;
    memberTitle?: CosmeticLook | null;
    iceShowcase?: IceShowcaseItem[];
  };
  idPrefix: string;
  /** Left out for visitors. */
  rating?: number;
}) {
  return (
    <span className="flex flex-wrap items-center justify-end gap-x-2 gap-y-1 text-body text-ink">
      <span className="mr-auto inline-flex items-center gap-2">
        {player.isCaptain && (
          <>
            <Crown aria-hidden="true" className="size-4 shrink-0 text-signal" />
            <span className="sr-only">隊長</span>
          </>
        )}
        {player.name}
      </span>
      <MemberTitleTag look={player.memberTitle} />
      <IceShowcaseStrip items={player.iceShowcase} idPrefix={idPrefix} />
      {rating !== undefined && (
        <span className="ml-2 font-mono text-label whitespace-nowrap text-ink-secondary tabular-nums">
          {rating}
        </span>
      )}
    </span>
  );
}
