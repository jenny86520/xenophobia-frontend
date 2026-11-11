import { Clock, MapPin } from "lucide-react";
import { MetaLabel } from "@/components/brand/meta-label";
import { PlainText } from "@/components/brand/plain-text";
import { cn } from "@/lib/utils";
import type { MemberRegistrationView } from "@/types/member";
import type { SubParty } from "@/types/party";
import { mediaUrl } from "@/utils/media";
import { formatSubPartyRange, subPartyTimeParts } from "@/utils/party-time";
import { SubPartyRegistration } from "./sub-party-registration";

type SubPartyListProps = {
  /** Already in start order (the backend sorts them). */
  subParties: SubParty[];
  /** Set when the party takes registrations: each sub-party then gets its own block. */
  registration?: { partyId: string; member: MemberRegistrationView | null };
};

/**
 * A party's sub-parties as hairline-ruled rows: oversized time (start – end, 待定 or 時間待定), then
 * title, address (only when given), description (laid out like the legal documents, its "# " headings
 * one level under the sub-party's h3 title) and, when set, its cover; with registration, the
 * sub-party's sign-up is a third column (below the details on narrower screens).
 */
/** The day as a small label over the time of day in large type; read as one range by screen readers. */
function SubPartyTime({ startDateTime, endDateTime }: { startDateTime: string; endDateTime: string }) {
  const { day, time } = subPartyTimeParts(startDateTime, endDateTime);
  return (
    <p className="flex flex-col gap-1.5">
      <span className="sr-only">{formatSubPartyRange(startDateTime, endDateTime)}</span>
      {day && (
        <MetaLabel aria-hidden="true" className="inline-flex items-center gap-1.5">
          <Clock className="size-3.5 shrink-0" />
          {day}
        </MetaLabel>
      )}
      {startDateTime ? (
        <time
          dateTime={startDateTime}
          aria-hidden="true"
          className="font-mono text-h3 leading-tight tracking-tight text-ink tabular-nums"
        >
          {time}
        </time>
      ) : (
        <span aria-hidden="true" className="inline-flex items-center gap-1.5 font-mono text-h3 leading-tight text-ink">
          <Clock className="size-4 shrink-0 text-ink-muted" />
          {time}
        </span>
      )}
    </p>
  );
}

export function SubPartyList({ subParties, registration }: SubPartyListProps) {
  return (
    <ol className="flex flex-col">
      {subParties.map((sub) => (
        <li
          key={sub.id}
          className={cn(
            "grid grid-cols-1 gap-y-3 border-t border-line py-6 first:border-t-0 md:grid-cols-[minmax(0,3fr)_minmax(0,5fr)] md:gap-x-8",
            registration && "lg:grid-cols-[minmax(0,3fr)_minmax(0,5fr)_minmax(0,4fr)]",
          )}
        >
          <SubPartyTime startDateTime={sub.startDateTime} endDateTime={sub.endDateTime} />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 flex-col gap-2">
              <h3 className="font-heading text-h3 text-ink">{sub.title}</h3>
              {sub.location && (
                <p className="flex flex-wrap items-baseline gap-x-3 text-body text-ink">
                  <MetaLabel className="inline-flex items-center gap-1.5 self-center">
                    <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
                    Where
                  </MetaLabel>
                  <span>{sub.location}</span>
                </p>
              )}
              {sub.description && <PlainText text={sub.description} headingLevel={4} />}
            </div>
            {sub.coverUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- original upload on the backend origin
              <img
                src={mediaUrl(sub.coverUrl)}
                alt={`${sub.title} 封面`}
                loading="lazy"
                decoding="async"
                className="aspect-[4/3] w-full shrink-0 rounded-sm border border-line object-cover sm:w-40"
              />
            )}
          </div>
          {registration && sub.registration && (
            <div className="md:col-start-2 lg:col-start-auto">
              <SubPartyRegistration
                partyId={registration.partyId}
                subPartyId={sub.id}
                title={sub.title}
                summary={sub.registration}
                member={registration.member}
              />
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}
