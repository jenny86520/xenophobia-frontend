import type { PartyLifecycleStatus } from "@/utils/party-lifecycle";

export type PartyStatusBadgesProps = {
  format: string;
  lifecycle?: PartyLifecycleStatus;
};

/** Renders the format badge and, when provided, the lifecycle badge for a party. */
export function PartyStatusBadges({ format, lifecycle }: PartyStatusBadgesProps) {
  return (
    <div className="event-card__status">
      <span className="status-badge status-badge--format">
        {format === "online" ? "[ONLINE]" : "[OFFLINE]"}
      </span>
      {lifecycle && (
        <span className="status-badge status-badge--lifecycle">
          {lifecycle === "ongoing" ? "ACTIVE" : "ENDED"}
        </span>
      )}
    </div>
  );
}
