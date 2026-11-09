import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";
import { MetaLabel } from "@/components/brand/meta-label";
import { Heading } from "@/components/brand/typography";
import type { LegendBoard } from "@/types/legends";
import { legendTabHref, tabOf } from "@/utils/legend-tabs";
import { BOARD_ICONS } from "./legend-board";

/**
 * 各榜榜首: every board in the backend's order with its first place (ties all listed), each row a
 * link to that board on its tab. A board nobody is on says so.
 */
export function LegendLeaders({ boards }: { boards: LegendBoard[] }) {
  if (boards.length === 0) return null;
  return (
    <section aria-labelledby="legend-leaders-title" className="flex flex-col gap-4">
      <Heading level={2} id="legend-leaders-title">
        各榜榜首
      </Heading>
      <ul aria-label="各榜榜首" className="border-b border-line">
        {boards.map((board) => {
          const Icon = BOARD_ICONS[board.code] ?? Trophy;
          const leaders = board.entries.filter((entry) => entry.rank === 1);
          return (
            <li key={board.code} className="list-row relative isolate overflow-hidden border-t border-line">
              <Link
                href={legendTabHref(tabOf(board.code), board.code)}
                className="flex items-center gap-4 px-2 py-4 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <Icon aria-hidden="true" className="size-5 shrink-0 text-signal" />
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-lead text-ink">{board.title}</span>
                  <MetaLabel>{board.metric}</MetaLabel>
                </span>
                <span className="min-w-0 text-right text-body">
                  {leaders.length > 0 ? (
                    <>
                      <span className="text-ink">{leaders.map((entry) => entry.nickname).join("、")}</span>
                      <span className="font-mono text-ink-secondary tabular-nums">
                        ・{leaders[0].value} {board.unit}
                      </span>
                    </>
                  ) : (
                    <span className="text-ink-secondary">還沒有會員上榜</span>
                  )}
                </span>
                <ArrowRight aria-hidden="true" className="list-row-arrow hidden size-5 shrink-0 text-ink-muted md:block" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
