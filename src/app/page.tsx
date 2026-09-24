"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchUpcomingParty, type UpcomingPartyResponse } from "@/lib/public-content-client";

const formatCountdown = (targetDate: string, targetTime: string) => {
  const target = new Date(`${targetDate}T${targetTime}:00`);
  const now = new Date();
  const diff = Math.max(target.getTime() - now.getTime(), 0);

  if (diff === 0) return "Starting now";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};

export default function HomePage() {
  const [data, setData] = useState<UpcomingPartyResponse>({});
  const [countdown, setCountdown] = useState("--");

  useEffect(() => {
    fetchUpcomingParty().then(setData);
  }, []);

  useEffect(() => {
    if (!data.nextParty?.startDate || !data.nextParty?.startTime) return;

    const tick = () => {
      setCountdown(formatCountdown(data.nextParty!.startDate, data.nextParty!.startTime));
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [data.nextParty]);

  return (
    <main className="page-shell">
      <section className="hero-card">
        <span className="eyebrow">Upcoming event</span>
        <h1>{data.nextParty?.title ?? "Loading upcoming event..."}</h1>
        <div className="countdown-row" data-complete={countdown === "Starting now" ? "true" : undefined}>
          <span className="countdown-label">Countdown</span>
          <strong>{countdown}</strong>
        </div>
        <p>{data.nextParty?.description ?? "Preparing the next community event."}</p>
        <div className="meta-grid">
          <div>
            <span>When</span>
            <strong>{data.nextParty ? `${data.nextParty.startDate} ${data.nextParty.startTime}` : "--"}</strong>
          </div>
          <div>
            <span>Where</span>
            <strong>{data.nextParty?.location ?? "--"}</strong>
          </div>
          <div>
            <span>Type</span>
            <strong>{data.nextParty?.category ?? "--"}</strong>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-header">
          <h2>Recent parties</h2>
          <Link href="/party">View all</Link>
        </div>
        <div className="card-grid">
          {(data.recentParties ?? []).map((party) => (
            <Link
              key={party.id}
              href={`/party/${party.id}`}
              className="event-card"
              data-format={party.format}
              data-category={party.category}
            >
              <h3 className="event-card__title">{party.title}</h3>
              <div className="event-card__tags">
                <span className="chip chip--category" data-value={party.category}>
                  {party.category.toUpperCase()}
                </span>
              </div>
              <div className="event-card__status">
                <span className="status-badge status-badge--format">
                  {party.format === "online" ? "[ONLINE]" : "[OFFLINE]"}
                </span>
              </div>
              <p>{party.summary}</p>
              <div className="event-meta">
                <span>{party.startDate}</span>
                <span>{party.startTime}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

