import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MetaLabel } from "@/components/brand/meta-label";
import type { PartyListItem, PartySummary } from "@/types/party";
import { resolvePartyLifecycleStatus } from "@/utils/party-lifecycle";
import { PartyStatusBadges } from "./party-status-badges";

type PartyRowProps = (
  | { party: PartySummary; showLifecycleBadge: false; metaFields: "date-time" }
  | { party: PartyListItem; showLifecycleBadge: true; metaFields: "date-category" }
) & {
  /** Heading level of the title; follows the page outline. */
  titleAs?: "h2" | "h3";
};

/**
 * Editorial list row for a party (design §5): date (mono), title, category, format and
 * lifecycle, summary. The whole row is one link to the detail page. Render inside a
 * <ul>/<ol>; rows are separated by hairline rules.
 */
export function PartyRow({ party, showLifecycleBadge, metaFields, titleAs: Title = "h3" }: PartyRowProps) {
  const lifecycle = showLifecycleBadge
    ? resolvePartyLifecycleStatus((party as PartyListItem).status)
    : undefined;

  return (
    <li className="list-row border-t border-line">
      <Link
        href={`/party/${party.id}`}
        className="grid grid-cols-4 gap-x-4 gap-y-3 px-2 py-6 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none md:grid-cols-8 md:gap-x-6 lg:grid-cols-12"
      >
        <div className="col-span-4 flex items-baseline gap-3 md:col-span-2 md:flex-col md:gap-1">
          <span className="list-row-index font-mono text-label text-ink tabular-nums">{party.startDate}</span>
          <MetaLabel>{metaFields === "date-time" ? party.startTime : party.category}</MetaLabel>
        </div>
        <div className="col-span-4 flex flex-col gap-2 md:col-span-6 lg:col-span-6">
          <Title className="font-heading text-h3 text-ink">{party.title}</Title>
          {party.summary && <p className="max-w-[65ch] text-body text-ink-secondary">{party.summary}</p>}
        </div>
        <div className="col-span-4 flex flex-col items-start gap-2 md:col-span-6 md:col-start-3 lg:col-span-3 lg:col-start-auto">
          {metaFields === "date-time" && <MetaLabel>{party.category}</MetaLabel>}
          <PartyStatusBadges format={party.format} lifecycle={lifecycle} />
        </div>
        <div className="hidden items-start justify-end lg:col-span-1 lg:flex">
          <ArrowRight aria-hidden="true" className="list-row-arrow size-5 text-ink-muted" />
        </div>
      </Link>
    </li>
  );
}
