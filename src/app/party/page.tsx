"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchPartyList, type PartyListItem } from "@/lib/public-content-client";

const toLifecycle = (partyStatus: string) => (partyStatus === "expired" ? "ended" : "ongoing");

export default function PartyPage() {
  const [parties, setParties] = useState<PartyListItem[]>([]);
  const [status, setStatus] = useState("active");
  const [format, setFormat] = useState("all");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    fetchPartyList({ status, format, category }).then(setParties);
  }, [status, format, category]);

  return (
    <main className="page-shell">
      <section className="section-block">
        <div className="section-header">
          <h2>Party listing</h2>
          <Link href="/">Home</Link>
        </div>

        <div className="filter-row">
          <div className="filter-block">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} data-applied={status !== "active" ? "true" : undefined}>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="all">All</option>
            </select>
          </div>

          <div className="filter-block">
            <label>Mode</label>
            <select value={format} onChange={(e) => setFormat(e.target.value)} data-applied={format !== "all" ? "true" : undefined}>
              <option value="all">All</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          <div className="filter-block">
            <label>Type</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} data-applied={category !== "all" ? "true" : undefined}>
              <option value="all">All</option>
              <option value="games">Games</option>
              <option value="gathering">Gathering</option>
            </select>
          </div>
        </div>

        {parties.length === 0 ? (
          <p className="empty-state">No parties match the current filters.</p>
        ) : (
          <div className="card-grid">
            {parties.map((party) => (
              <Link
                key={party.id}
                href={`/party/${party.id}`}
                className="event-card"
                data-format={party.format}
                data-category={party.category}
                data-lifecycle={toLifecycle(party.status)}
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
                  <span className="status-badge status-badge--lifecycle">
                    {toLifecycle(party.status) === "ongoing" ? "ACTIVE" : "ENDED"}
                  </span>
                </div>
                <p>{party.summary}</p>
                <div className="event-meta">
                  <span>{party.startDate}</span>
                  <span>{party.category}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

