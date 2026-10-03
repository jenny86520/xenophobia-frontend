import { CircleDot, CircleSlash, MapPin, Wifi } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PartyLifecycleStatus } from "@/utils/party-lifecycle";

export type PartyStatusBadgesProps = {
  format: string;
  lifecycle?: PartyLifecycleStatus;
};

/**
 * Format badge and, when provided, lifecycle badge. Each state differs by text,
 * icon and badge style, so it is never conveyed by color alone. Format also gets a
 * translucent tint (online green, offline amber) so the two read apart at a glance.
 */
export function PartyStatusBadges({ format, lifecycle }: PartyStatusBadgesProps) {
  const isOnline = format === "online";
  const FormatIcon = isOnline ? Wifi : MapPin;

  return (
    <div className="flex flex-wrap gap-1.5">
      <Badge
        variant="outline"
        data-format={isOnline ? "online" : "offline"}
        className={cn(
          "font-mono",
          isOnline ? "border-success/40 bg-success/15 text-success" : "border-warning/40 bg-warning/15 text-warning",
        )}
      >
        <FormatIcon aria-hidden="true" />
        {isOnline ? "[ONLINE]" : "[OFFLINE]"}
      </Badge>
      {lifecycle === "ongoing" && (
        <Badge variant="secondary" className="font-mono">
          <CircleDot aria-hidden="true" />
          ACTIVE
        </Badge>
      )}
      {lifecycle === "ended" && (
        <Badge variant="outline" className="font-mono opacity-70">
          <CircleSlash aria-hidden="true" />
          ENDED
        </Badge>
      )}
    </div>
  );
}
