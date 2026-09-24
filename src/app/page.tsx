"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type PartySummary = {
  id: string;
  title: string;
  summary: string;
  category: string;
  format: string;
  startDate: string;
  startTime: string;
};

type UpcomingResponse = {
  nextParty?: {
    id: string;
    title: string;
    description: string;
    category: string;
    format: string;
    startDate: string;
    startTime: string;
    location: string;
  };
  recentParties?: PartySummary[];
};

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
  const [data, setData] = useState<UpcomingResponse>({});
  const [countdown, setCountdown] = useState("--");

  useEffect(() => {
    fetch("http://localhost:3001/api/parties/upcoming")
      .then((res) => res.json())
      .then((payload) => {
        setData(payload);
      })
      .catch(() => {
        setData({
          nextParty: {
            id: "1",
            title: "Night of Strategy",
            description: "A tabletop evening with strategy games and relaxed social play.",
            category: "games",
            format: "offline",
            startDate: "2026-09-30",
            startTime: "18:30",
            location: "Red Room Studio, Taipei",
          },
          recentParties: [
            { id: "1", title: "Night of Strategy", summary: "Strategy-focused game night for team members and friends.", category: "games", format: "offline", startDate: "2026-09-30", startTime: "18:30" },
            { id: "2", title: "Online Hangout Roundtable", summary: "Casual online community meetup and planning session.", category: "gathering", format: "online", startDate: "2026-10-05", startTime: "20:00" },
          ],
        });
      });
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
        <div className="countdown-row">
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
            <Link key={party.id} href={`/party/${party.id}`} className="event-card">
              <span className="tag">{party.format}</span>
              <h3>{party.title}</h3>
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
