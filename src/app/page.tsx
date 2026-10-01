"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchUpcomingParty, type UpcomingPartyResponse } from "@/lib/public-content-client";
import { useCountdown } from "@/hooks/use-countdown";
import { PartyCard } from "@/components/party/party-card";

export default function HomePage() {
  const [upcomingPartyData, setUpcomingPartyData] = useState<UpcomingPartyResponse>({});
  const countdown = useCountdown(
    upcomingPartyData.nextParty?.startDate,
    upcomingPartyData.nextParty?.startTime,
  );

  useEffect(() => {
    fetchUpcomingParty().then(setUpcomingPartyData);
  }, []);

  return (
    <main className="page-shell">
      <section className="hero-card">
        <span className="eyebrow">Upcoming event</span>
        <h1>{upcomingPartyData.nextParty?.title ?? "Loading upcoming event..."}</h1>
        <div className="countdown-row" data-complete={countdown === "Starting now" ? "true" : undefined}>
          <span className="countdown-label">Countdown</span>
          <strong>{countdown}</strong>
        </div>
        <p>{upcomingPartyData.nextParty?.description ?? "Preparing the next community event."}</p>
        <div className="meta-grid">
          <div>
            <span>When</span>
            <strong>
              {upcomingPartyData.nextParty
                ? `${upcomingPartyData.nextParty.startDate} ${upcomingPartyData.nextParty.startTime}`
                : "--"}
            </strong>
          </div>
          <div>
            <span>Where</span>
            <strong>{upcomingPartyData.nextParty?.location ?? "--"}</strong>
          </div>
          <div>
            <span>Type</span>
            <strong>{upcomingPartyData.nextParty?.category ?? "--"}</strong>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-header">
          <h2>Recent parties</h2>
          <Link href="/party">View all</Link>
        </div>
        <div className="card-grid">
          {(upcomingPartyData.recentParties ?? []).map((party) => (
            <PartyCard key={party.id} party={party} showLifecycleBadge={false} metaFields="date-time" />
          ))}
        </div>
      </section>
    </main>
  );
}


