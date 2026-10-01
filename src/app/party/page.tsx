"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchPartyList, type PartyListItem } from "@/lib/public-content-client";
import { PartyCard } from "@/components/party/party-card";

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
              <PartyCard key={party.id} party={party} showLifecycleBadge={true} metaFields="date-category" />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}


