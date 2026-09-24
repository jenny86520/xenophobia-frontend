"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type TimelineItem = {
  id: string;
  title: string;
  description: string;
  startDateTime: string;
};

type PartyDetail = {
  id: string;
  title: string;
  description: string;
  category: string;
  format: string;
  status: string;
  startDate: string;
  startTime: string;
  location: string;
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
  timeline?: TimelineItem[];
};

export default function PartyDetailPage() {
  const params = useParams();
  const [party, setParty] = useState<PartyDetail | null>(null);

  useEffect(() => {
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    fetch(`http://localhost:3001/api/parties/${id}`)
      .then((res) => res.json())
      .then((data) => setParty(data))
      .catch(() => {
        setParty({
          id: "1",
          title: "Night of Strategy",
          description: "A tabletop evening with strategy games and relaxed social play.",
          category: "games",
          format: "offline",
          status: "active",
          startDate: "2026-09-30",
          startTime: "18:30",
          location: "Red Room Studio, Taipei",
          createdBy: "Admin Team",
          createdAt: "2026-09-20T12:00:00Z",
          updatedBy: "Admin Team",
          updatedAt: "2026-09-22T09:00:00Z",
          timeline: [
            { id: "t1", title: "Setup and greetings", description: "Check-in and introductions", startDateTime: "2026-09-30T18:30:00Z" },
            { id: "t2", title: "Game rounds", description: "Multiple sessions across the night", startDateTime: "2026-09-30T19:00:00Z" },
            { id: "t3", title: "Wrap-up", description: "Results and community chat", startDateTime: "2026-09-30T21:30:00Z" },
          ],
        });
      });
  }, [params.id]);

  if (!party) return <main className="page-shell"><section className="detail-shell">Loading...</section></main>;

  return (
    <main className="page-shell">
      <section className="detail-shell">
        <Link href="/party">← Back to party list</Link>
        <h1>{party.title}</h1>
        <p>{party.description}</p>

        <div className="detail-grid">
          <div>
            <span>Category</span>
            <strong>{party.category}</strong>
          </div>
          <div>
            <span>Format</span>
            <strong>{party.format}</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>{party.status}</strong>
          </div>
          <div>
            <span>Location</span>
            <strong>{party.location}</strong>
          </div>
          <div>
            <span>Date</span>
            <strong>{party.startDate}</strong>
          </div>
          <div>
            <span>Time</span>
            <strong>{party.startTime}</strong>
          </div>
          <div>
            <span>Created by</span>
            <strong>{party.createdBy}</strong>
          </div>
          <div>
            <span>Updated by</span>
            <strong>{party.updatedBy ?? "—"}</strong>
          </div>
        </div>

        {party.timeline && party.timeline.length > 0 && (
          <div>
            <h2 style={{ marginTop: 24 }}>Timeline</h2>
            <ul className="timeline">
              {party.timeline.map((item) => (
                <li key={item.id}>
                  <strong>{item.title}</strong>
                  <span>{new Date(item.startDateTime).toLocaleString()}</span>
                  <p>{item.description}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </main>
  );
}
