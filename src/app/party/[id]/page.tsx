"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchPartyDetail, type PartyDetail } from "@/lib/public-content-client";

export default function PartyDetailPage() {
  const params = useParams();
  const [party, setParty] = useState<PartyDetail | null>(null);

  useEffect(() => {
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    if (!id) return;
    fetchPartyDetail(id).then(setParty);
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
