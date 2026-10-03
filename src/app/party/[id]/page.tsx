"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchPartyDetail, type PartyDetail } from "@/lib/public-content-client";
import { resolvePartyLifecycleStatus } from "@/utils/party-lifecycle";
import { PartyStatusBadges } from "@/components/party/party-status-badges";

type PartyDetailState =
  | { status: "loading" }
  | { status: "loaded"; party: PartyDetail }
  | { status: "not-found" }
  | { status: "error" };

export default function PartyDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  // Results are tagged with the id they belong to, so navigating to another party shows "loading" until its own result arrives.
  const [result, setResult] = useState<{ id: string; state: PartyDetailState } | null>(null);
  const state: PartyDetailState = result && result.id === id ? result.state : { status: "loading" };

  useEffect(() => {
    if (!id) return;
    fetchPartyDetail(id)
      .then((party) => setResult({ id, state: party ? { status: "loaded", party } : { status: "not-found" } }))
      .catch(() => setResult({ id, state: { status: "error" } }));
  }, [id]);

  if (state.status === "loading") {
    return <main className="page-shell"><section className="detail-shell">Loading...</section></main>;
  }

  if (state.status === "not-found" || state.status === "error") {
    return (
      <main className="page-shell">
        <section className="detail-shell">
          <Link href="/party">← Back to party list</Link>
          {state.status === "not-found" ? (
            <p className="empty-state">Party not found.</p>
          ) : (
            <p className="empty-state" role="alert">Failed to load this party. Please try again later.</p>
          )}
        </section>
      </main>
    );
  }

  const { party } = state;
  const lifecycle = resolvePartyLifecycleStatus(party.status);

  return (
    <main className="page-shell">
      <section className="detail-shell" data-format={party.format} data-category={party.category} data-lifecycle={lifecycle}>
        <Link href="/party">← Back to party list</Link>
        <h1>{party.title}</h1>
        <div className="event-card__tags">
          <span className="chip chip--category" data-value={party.category}>
            {party.category.toUpperCase()}
          </span>
        </div>
        <PartyStatusBadges format={party.format} lifecycle={lifecycle} />
        <p>{party.description}</p>


        <div className="detail-grid">
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
