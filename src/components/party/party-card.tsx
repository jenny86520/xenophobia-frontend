import Link from "next/link";
import type { PartyListItem, PartySummary } from "@/types/party";
import { resolvePartyLifecycleStatus } from "@/utils/party-lifecycle";
import { PartyStatusBadges } from "./party-status-badges";

type PartyCardProps =
  | { party: PartySummary; showLifecycleBadge: false; metaFields: "date-time" }
  | { party: PartyListItem; showLifecycleBadge: true; metaFields: "date-category" };

/** Shared party card used by the home page (compact) and the party list page (full, with lifecycle badge). */
export function PartyCard({ party, showLifecycleBadge, metaFields }: PartyCardProps) {
  const lifecycle = showLifecycleBadge
    ? resolvePartyLifecycleStatus((party as PartyListItem).status)
    : undefined;

  return (
    <Link
      href={`/party/${party.id}`}
      className="event-card"
      data-format={party.format}
      data-category={party.category}
      data-lifecycle={lifecycle}
    >
      <h3 className="event-card__title">{party.title}</h3>
      <div className="event-card__tags">
        <span className="chip chip--category" data-value={party.category}>
          {party.category.toUpperCase()}
        </span>
      </div>
      <PartyStatusBadges format={party.format} lifecycle={lifecycle} />
      <p>{party.summary}</p>
      <div className="event-meta">
        <span>{party.startDate}</span>
        <span>{metaFields === "date-time" ? party.startTime : party.category}</span>
      </div>
    </Link>
  );
}
