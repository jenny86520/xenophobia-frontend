"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { fetchUpcomingParty, type UpcomingPartyResponse } from "@/lib/public-content-client";
import { useCountdown } from "@/hooks/use-countdown";
import { PartyCard } from "@/components/party/party-card";
import { PageHeader } from "@/components/layout/page-header";
import { MetaLabel, formatCount } from "@/components/layout/meta-label";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const [upcomingPartyData, setUpcomingPartyData] = useState<UpcomingPartyResponse>({});
  const nextParty = upcomingPartyData.nextParty;
  const recentParties = upcomingPartyData.recentParties ?? [];
  const countdown = useCountdown(nextParty?.startDate, nextParty?.startTime);

  useEffect(() => {
    fetchUpcomingParty().then(setUpcomingPartyData);
  }, []);

  const meta = [
    { label: "When", value: nextParty ? `${nextParty.startDate} ${nextParty.startTime}` : "--" },
    { label: "Where", value: nextParty?.location ?? "--" },
    { label: "Type", value: nextParty?.category ?? "--" },
  ];

  return (
    <main className="flex flex-col gap-8 sm:gap-16">
      <section className="flex flex-col gap-8">
        <PageHeader
          eyebrow="HOME / NEXT EVENT"
          title={nextParty?.title ?? "Loading upcoming event..."}
          description={nextParty?.description ?? "Preparing the next community event."}
        />

        <div
          className="flex flex-wrap items-center gap-x-4 gap-y-2"
          data-complete={countdown === "Starting now" ? "true" : undefined}
        >
          <span className="inline-flex items-center gap-2">
            <span aria-hidden="true" className="size-2 rounded-full bg-primary shadow-glow motion-safe:animate-pulse" />
            <MetaLabel>Countdown</MetaLabel>
          </span>
          <strong className="font-mono text-2xl font-medium tracking-tight sm:text-3xl">{countdown}</strong>
        </div>

        <dl className="grid border-t sm:grid-cols-3">
          {meta.map((item) => (
            <div key={item.label} className="flex flex-col gap-1 border-b py-4 sm:border-b-0 sm:py-5 sm:pr-6">
              <dt>
                <MetaLabel>{item.label}</MetaLabel>
              </dt>
              <dd className="text-lg font-medium">{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <MetaLabel>Recent / {formatCount(recentParties.length)}</MetaLabel>
            <h2 className="text-2xl font-semibold tracking-tight">Recent parties</h2>
          </div>
          <Button variant="outline" asChild>
            <Link href="/party">
              View all
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recentParties.map((party) => (
            <PartyCard key={party.id} party={party} showLifecycleBadge={false} metaFields="date-time" />
          ))}
        </div>
      </section>
    </main>
  );
}
