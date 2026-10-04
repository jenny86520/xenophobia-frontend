import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EditorialGrid } from "@/components/brand/editorial-grid";
import { Eyebrow } from "@/components/brand/eyebrow";
import { MetaLabel } from "@/components/brand/meta-label";
import { Section } from "@/components/brand/section";
import { TextLink } from "@/components/brand/text-link";
import { Heading } from "@/components/brand/typography";
import { PartyCoverBackdrop } from "@/components/party/party-cover-backdrop";
import { PartyRow } from "@/components/party/party-row";
import { PartyStatusBadges } from "@/components/party/party-status-badges";
import type { NextParty, PartySummary } from "@/types/party";
import { cn } from "@/lib/utils";

type EventsProps = {
  nextParty: NextParty | null;
  recentParties: PartySummary[];
};

/**
 * 4 · Events: the next party as this issue's cover story, then recent issues. The whole
 * next-party block is clickable through its one title link (stretched with ::after); any
 * other interactive element added inside must sit above it (`relative z-10`).
 */
export function Events({ nextParty, recentParties }: EventsProps) {
  return (
    <Section labelledBy="events-title" ruled className="reveal" id="events">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-4">
          <Eyebrow index={3}>Events</Eyebrow>
          <Heading level={2} id="events-title">
            活動
          </Heading>
        </div>
        <TextLink href="/party" lang="en" className="cta-secondary text-body text-ink">
          More Party <span aria-hidden="true">→</span>
        </TextLink>
      </div>

      {nextParty ? (
        <article
          aria-labelledby="next-party-title"
          className={cn(
            "next-party relative isolate mt-12 overflow-hidden border-t pt-8",
            nextParty.coverUrl && "px-4 pb-8 md:px-6",
          )}
        >
          <PartyCoverBackdrop coverUrl={nextParty.coverUrl} />
          <EditorialGrid className="gap-y-6">
            <div className="col-span-4 md:col-span-2 lg:col-span-3">
              <MetaLabel>Next</MetaLabel>
              <p className="mt-2 font-mono text-h1 leading-none tracking-tight text-ink tabular-nums">
                {nextParty.startDate.slice(5).replace("-", "/")}
              </p>
            </div>
            <div className="col-span-4 flex flex-col gap-3 md:col-span-6 lg:col-span-5">
              <h3 id="next-party-title" className="font-heading text-h2 text-balance text-ink">
                <Link
                  href={`/party/${nextParty.id}`}
                  className="link-underline after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
                >
                  {nextParty.title}
                </Link>
                <ArrowRight aria-hidden="true" className="next-party-arrow ml-3 inline size-6 align-middle" />
              </h3>
              {nextParty.description && (
                <p className="max-w-[60ch] text-body text-ink-secondary">{nextParty.description}</p>
              )}
            </div>
            <dl className="col-span-4 flex flex-col md:col-span-8 lg:col-span-3 lg:col-start-10">
              {[
                { label: "When", value: `${nextParty.startDate} ${nextParty.startTime}` },
                { label: "Where", value: nextParty.location },
                { label: "Type", value: nextParty.category },
              ].map((row) => (
                <div key={row.label} className="flex justify-between gap-4 border-t border-line py-3">
                  <dt>
                    <MetaLabel>{row.label}</MetaLabel>
                  </dt>
                  <dd className="text-right text-body text-ink">{row.value}</dd>
                </div>
              ))}
              <div className="border-t border-line pt-3">
                <PartyStatusBadges format={nextParty.format} />
              </div>
            </dl>
          </EditorialGrid>
        </article>
      ) : (
        <p className="mt-12 border-t border-line-strong pt-8 text-lead text-ink-secondary">目前沒有即將舉辦的活動</p>
      )}

      {recentParties.length > 0 && (
        <div className="mt-section-tight">
          <MetaLabel>Recent</MetaLabel>
          <ul className="mt-4 border-b border-line">
            {recentParties.map((party) => (
              <PartyRow key={party.id} party={party} showLifecycleBadge={false} metaFields="date-time" />
            ))}
          </ul>
        </div>
      )}
    </Section>
  );
}
