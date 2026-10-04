import { MetaLabel } from "@/components/brand/meta-label";
import type { SubParty } from "@/types/party";
import { formatSubPartyTime } from "@/utils/datetime";
import { mediaUrl } from "@/utils/media";

type SubPartyListProps = {
  /** Already in start order (the backend sorts them). */
  subParties: SubParty[];
};

/**
 * A party's sub-parties as hairline-ruled rows: oversized start time, then title,
 * address (only when given), description and, when set, the sub-party's cover.
 */
export function SubPartyList({ subParties }: SubPartyListProps) {
  return (
    <ol className="flex flex-col">
      {subParties.map((sub) => (
        <li
          key={sub.id}
          className="grid grid-cols-1 gap-y-3 border-t border-line py-6 first:border-t-0 md:grid-cols-[minmax(0,3fr)_minmax(0,5fr)] md:gap-x-8"
        >
          <time
            dateTime={sub.startDateTime}
            className="font-mono text-h2 leading-none tracking-tight text-ink tabular-nums"
          >
            {formatSubPartyTime(sub.startDateTime)}
          </time>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 flex-col gap-2">
              <h3 className="font-heading text-h3 text-ink">{sub.title}</h3>
              {sub.location && (
                <p className="flex flex-wrap items-baseline gap-x-3 text-body text-ink">
                  <MetaLabel>Where</MetaLabel>
                  <span>{sub.location}</span>
                </p>
              )}
              {sub.description && (
                <p className="max-w-[65ch] text-body whitespace-pre-line text-ink-secondary">{sub.description}</p>
              )}
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
        </li>
      ))}
    </ol>
  );
}
