import Link from "next/link";
import { CalendarDays, Clock, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { PartyListItem, PartySummary } from "@/types/party";
import { resolvePartyLifecycleStatus } from "@/utils/party-lifecycle";
import { PartyStatusBadges } from "./party-status-badges";

type PartyCardProps =
  | { party: PartySummary; showLifecycleBadge: false; metaFields: "date-time" }
  | { party: PartyListItem; showLifecycleBadge: true; metaFields: "date-category" };

/**
 * Shared party card used by the home page (compact) and the party list page
 * (with lifecycle badge). The whole card is a single link to the detail page.
 * Order: title, category, format/lifecycle badges, summary, meta row.
 */
export function PartyCard({ party, showLifecycleBadge, metaFields }: PartyCardProps) {
  const lifecycle = showLifecycleBadge
    ? resolvePartyLifecycleStatus((party as PartyListItem).status)
    : undefined;

  return (
    <Link
      href={`/party/${party.id}`}
      className="group block h-full rounded-lg focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <Card className="h-full transition-shadow group-hover:shadow-glow group-hover:ring-primary/60 group-focus-visible:shadow-glow">
        <CardHeader className="gap-2">
          <CardTitle className="text-lg font-semibold tracking-tight">{party.title}</CardTitle>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary">{party.category.toUpperCase()}</Badge>
          </div>
          <PartyStatusBadges format={party.format} lifecycle={lifecycle} />
        </CardHeader>
        <CardContent className="flex-1 text-sm text-muted-foreground">
          <p>{party.summary}</p>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays aria-hidden="true" className="size-4" />
            <span>{party.startDate}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            {metaFields === "date-time" ? (
              <Clock aria-hidden="true" className="size-4" />
            ) : (
              <Tag aria-hidden="true" className="size-4" />
            )}
            <span>{metaFields === "date-time" ? party.startTime : party.category}</span>
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
