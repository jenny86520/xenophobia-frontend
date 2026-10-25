import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MetaLabel } from "@/components/brand/meta-label";
import type { MatchSummary } from "@/types/match";
import { MatchStatusLabel } from "./match-status";

/** One match in a list: title, game and party, status and head count; the whole row links to it. */
export function MatchRow({
  match,
  titleAs: Title = "h3",
  note,
}: {
  match: MatchSummary;
  titleAs?: "h2" | "h3";
  /** Extra text beside the status, e.g. the viewer's team. */
  note?: string;
}) {
  return (
    <li className="list-row border-t border-line">
      <Link
        href={`/matches/${match.id}`}
        className="grid grid-cols-4 gap-x-4 gap-y-3 px-2 py-6 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none md:grid-cols-8 md:gap-x-6 lg:grid-cols-12"
      >
        <div className="col-span-4 flex flex-col gap-1 md:col-span-5 lg:col-span-6">
          <Title className="font-heading text-h3 text-ink">{match.title}</Title>
          <MetaLabel>{match.party ? `${match.game.name} / ${match.party.title}` : match.game.name}</MetaLabel>
        </div>
        <div className="col-span-4 flex flex-wrap items-center gap-x-6 gap-y-2 md:col-span-3 lg:col-span-5">
          <MatchStatusLabel status={match.status} />
          <span className="font-mono text-label text-ink-secondary tabular-nums">
            {match.playerCount} / {match.capacity}
          </span>
          {note && <span className="text-body text-ink">{note}</span>}
        </div>
        <div className="hidden items-start justify-end lg:col-span-1 lg:flex">
          <ArrowRight aria-hidden="true" className="list-row-arrow size-5 text-ink-muted" />
        </div>
      </Link>
    </li>
  );
}
