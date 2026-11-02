import { CalendarCheck, CalendarRange, Crosshair, Ghost, Swords, Trophy, type LucideIcon } from "lucide-react";
import { EditorialGrid } from "@/components/brand/editorial-grid";
import { formatCount, MetaLabel } from "@/components/brand/meta-label";
import { InfoDialog } from "@/components/brand/info-dialog";
import { Section } from "@/components/brand/section";
import { Heading } from "@/components/brand/typography";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MEDAL_PLACES, MEDALS } from "./medals";

/** Decorative icon per board code; a code added later on the backend gets the trophy. */
const BOARD_ICONS: Record<string, LucideIcon> = {
  overall: Trophy,
  "scrim-rating": Crosshair,
  "party-attendance": CalendarCheck,
  "sub-party-attendance": CalendarRange,
  "scrim-matches": Swords,
  "scrim-cancelled": Ghost,
};

type LegendBoardProps = {
  /** Board code; also builds the heading id. */
  code: string;
  title: string;
  /** What the board counts, shown under the title. */
  metric: string;
  unit: string;
  countsTowardOverall: boolean;
  entries: Array<{ rank: number; nickname: string; value: number }>;
  /** A line for visitors under the heading (what the board celebrates). */
  tagline?: string;
  /** How the board is counted, shown in an ⓘ popover. */
  rules?: string;
};

/**
 * One Legends board: heading with its icon, then hairline rows of place (mono; places 1 to 3 add a
 * gold, silver or bronze trophy), nickname and value with its unit. Rows are not interactive. An empty board says so instead of a placeholder:
 * nobody qualifying is a real state, not missing content.
 */
export function LegendBoard({
  code,
  title,
  metric,
  unit,
  countsTowardOverall,
  entries,
  tagline,
  rules,
}: LegendBoardProps) {
  const Icon = BOARD_ICONS[code] ?? Trophy;
  const headingId = `board-${code}`;
  return (
    <Section labelledBy={headingId} ruled spacing="tight">
      <EditorialGrid className="gap-y-6">
        <div className="col-span-4 flex flex-col gap-3 md:col-span-8 lg:col-span-4">
          <Heading level={2} id={headingId} className="flex items-center gap-3">
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
        <div className="col-span-4 md:col-span-8 lg:col-span-8 lg:col-start-5">
          {entries.length > 0 ? (
            <ol aria-label={title} className="border-b border-line">
              {entries.map((entry) => (
                <li
                  key={`${entry.rank}-${entry.nickname}`}
                  className="flex items-baseline gap-5 border-t border-line py-4 md:gap-8"
                >
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
                  <span className="min-w-0 flex-1 truncate text-lead text-ink">{entry.nickname}</span>
                  <span className="shrink-0 font-mono text-body text-ink-secondary tabular-nums">
                    {entry.value} {unit}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="border-t border-b border-line py-6 text-body text-ink-secondary">還沒有會員上榜</p>
          )}
        </div>
      </EditorialGrid>
    </Section>
  );
}
