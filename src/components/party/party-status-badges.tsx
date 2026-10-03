import { CircleDot, CircleSlash, MapPin, Wifi } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PartyLifecycleStatus } from "@/utils/party-lifecycle";

export type PartyStatusBadgesProps = {
  format: string;
  lifecycle?: PartyLifecycleStatus;
};

/**
 * Format badge and, when provided, lifecycle badge. Each state differs by text,
 * icon and badge style, so it is never conveyed by color alone.
 */
export function PartyStatusBadges({ format, lifecycle }: PartyStatusBadgesProps) {
  const isOnline = format === "online";
  const FormatIcon = isOnline ? Wifi : MapPin;

  return (
    <div className="flex flex-wrap gap-1.5">
      <Badge variant="outline" className="font-mono">
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
