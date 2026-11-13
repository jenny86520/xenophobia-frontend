import {
  CalendarCheck,
  CalendarDays,
  CalendarRange,
  Coins,
  Crosshair,
  Ghost,
  Swords,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { formatCount, MetaLabel } from "@/components/brand/meta-label";
import { InfoDialog } from "@/components/brand/info-dialog";
import { Heading } from "@/components/brand/typography";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MemberTitleTag } from "@/components/cosmetics/member-title-tag";
import type { LegendEntry } from "@/types/legends";
import { MEDAL_PLACES, MEDALS } from "./medals";

/** Decorative icon per board code; a code added later on the backend gets the trophy. */
export const BOARD_ICONS: Record<string, LucideIcon> = {
  overall: Trophy,
  "scrim-rating": Crosshair,
  "party-attendance": CalendarCheck,
  "sub-party-attendance": CalendarRange,
  "scrim-matches": Swords,
  "scrim-cancelled": Ghost,
  "points-earned": Coins,
  "checkin-streak": CalendarDays,
};

/** The id of a board's heading, also the anchor the 各榜榜首 links jump to. */
export const boardHeadingId = (code: string) => `board-${code}`;

/** Nobody qualifying is a real state, not missing content, so this is never a placeholder. */
export function EmptyBoard() {
  return <p className="border-t border-b border-line py-6 text-body text-ink-secondary">還沒有會員上榜</p>;
}

/**
 * Hairline rows of place (mono, with an sr-only 「第 N 名」; places 1 to 3 add a gold, silver or bronze
 * trophy), nickname with the member's equipped title, and value with its unit. Rows are not interactive.
 */
export function LegendRows({ label, unit, entries }: { label: string; unit: string; entries: LegendEntry[] }) {
  return (
    <ol aria-label={label} className="border-b border-line">
      {entries.map((entry) => (
        <li key={`${entry.rank}-${entry.nickname}`} className="flex items-baseline gap-5 border-t border-line py-4 md:gap-8">
          <span
            className={cn(
              "flex w-20 shrink-0 items-center gap-2 font-mono text-h3 leading-none tabular-nums",
              entry.rank <= MEDAL_PLACES ? "text-ink" : "text-ink-muted",
            )}
          >
            <span className="sr-only">第 {entry.rank} 名</span>
            <span aria-hidden="true">{formatCount(entry.rank)}</span>
            {entry.rank <= MEDAL_PLACES && (
              <Trophy aria-hidden="true" className={cn("size-5 shrink-0", MEDALS[entry.rank].text)} />
            )}
          </span>
          <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
            <span className="min-w-0 truncate text-lead text-ink">{entry.nickname}</span>
            <MemberTitleTag look={entry.memberTitle} />
          </span>
          <span className="shrink-0 font-mono text-body text-ink-secondary tabular-nums">
            {entry.value} {unit}
          </span>
        </li>
      ))}
    </ol>
  );
}

export type LegendBoardHeaderProps = {
  /** Board code; also builds the heading id. */
  code: string;
  title: string;
  /** What the board counts, shown under the title. */
  metric: string;
  unit: string;
  countsTowardOverall: boolean;
  /** A line for visitors under the heading (what the board celebrates). */
  tagline?: string;
  /** How the board is counted, shown in an ⓘ popover. */
  rules?: string;
};

/** A board's heading with its icon, 「metric・單位：unit」, the 不計入總排行 badge, the ⓘ and the tagline. */
export function LegendBoardHeader({
  code,
  title,
  metric,
  unit,
  countsTowardOverall,
  tagline,
  rules,
}: LegendBoardHeaderProps) {
  const Icon = BOARD_ICONS[code] ?? Trophy;
  return (
    <div className="flex flex-col gap-3">
      <Heading level={2} id={boardHeadingId(code)} className="flex scroll-mt-24 items-center gap-3">
        <Icon aria-hidden="true" className="size-[0.8em] shrink-0 text-signal" />
        {title}
      </Heading>
      <div className="flex flex-wrap items-center gap-2">
        <MetaLabel>
          {metric}・單位：{unit}
        </MetaLabel>
        {!countsTowardOverall && <Badge variant="outline">不計入總排行</Badge>}
        {rules && (
          <InfoDialog id={`legend-rules-${code}`} title={`${title}怎麼算`}>
            <p>{rules}</p>
          </InfoDialog>
        )}
      </div>
      {tagline && <p className="max-w-[45ch] text-body text-ink-secondary">{tagline}</p>}
    </div>
  );
}

/**
 * One Legends board, stacked so it fits a column of a tab's grid: the header, then its rows (or
 * 「還沒有會員上榜」).
 */
export function LegendBoard(props: LegendBoardHeaderProps & { entries: LegendEntry[] }) {
  return (
    <section aria-labelledby={boardHeadingId(props.code)} className="flex min-w-0 flex-col gap-6">
      <LegendBoardHeader {...props} />
      {props.entries.length > 0 ? (
        <LegendRows label={props.title} unit={props.unit} entries={props.entries} />
      ) : (
        <EmptyBoard />
      )}
    </section>
  );
}
