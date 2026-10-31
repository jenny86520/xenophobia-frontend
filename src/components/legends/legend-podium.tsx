import { Trophy } from "lucide-react";
import type { CSSProperties } from "react";
import { formatCount } from "@/components/brand/meta-label";
import { cn } from "@/lib/utils";
import type { Legends } from "@/types/legends";
import { MEDAL_PLACES, MEDALS } from "./medals";
import { PodiumReveal } from "./podium-reveal";

/** Column (2nd left, 1st centre, 3rd right), trophy size and pedestal height per place. */
const STEPS: Record<number, { column: string; trophy: string; pedestal: string }> = {
  1: { column: "col-start-2", trophy: "size-20 md:size-28", pedestal: "h-24 md:h-32" },
  2: { column: "col-start-1", trophy: "size-14 md:size-20", pedestal: "h-16 md:h-24" },
  3: { column: "col-start-3", trophy: "size-10 md:size-14", pedestal: "h-10 md:h-16" },
};

/**
 * The top three of the overall ranking as a podium: gold, silver and bronze trophies sized large,
 * medium and small, laid out 2-1-3. The list stays in place order (1, 2, 3) for assistive tech;
 * only the grid columns move. Tied members share a step (two golds leave the silver step empty).
 */
export function LegendPodium({ title, entries }: { title: string; entries: Legends["overall"]["entries"] }) {
  const steps = Array.from({ length: MEDAL_PLACES }, (_, i) => i + 1)
    .map((rank) => ({ rank, members: entries.filter((entry) => entry.rank === rank) }))
    .filter((step) => step.members.length > 0);
  return (
    <PodiumReveal>
      <ol aria-label={`${title}前三名`} className="grid grid-cols-[1fr_1.2fr_1fr] items-end gap-3 md:gap-6">
        {steps.map(({ rank, members }) => (
          <li
            key={rank}
            className={cn("podium-step row-start-1 flex min-w-0 flex-col items-center text-center", STEPS[rank].column)}
            style={{ "--pop-order": rank - 1 } as CSSProperties}
          >
            <span className="podium-trophy">
              <Trophy
                aria-hidden="true"
                strokeWidth={1.5}
                className={cn("podium-trophy-icon", STEPS[rank].trophy, MEDALS[rank].text)}
              />
            </span>
            <span className="sr-only">第 {rank} 名</span>
            <span className="mt-4 flex w-full min-w-0 flex-col">
              {members.map((member, i) => (
                <span key={i} className="truncate font-heading text-lead text-ink md:text-h3">
                  {i > 0 && <span className="sr-only">、</span>}
                  {member.nickname}
                </span>
              ))}
            </span>
            <span className="mt-1 font-mono text-label text-ink-secondary tabular-nums">
              {members[0].points} <span lang="en">PTS</span>
            </span>
            <span
              aria-hidden="true"
              className={cn(
                "podium-pedestal mt-4 flex w-full justify-center border-t-2 bg-surface pt-3 font-mono text-h3 leading-none text-ink tabular-nums",
                STEPS[rank].pedestal,
                MEDALS[rank].border,
              )}
            >
              {formatCount(rank)}
            </span>
          </li>
        ))}
      </ol>
    </PodiumReveal>
  );
}
