"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchPartyList, type PartyListItem } from "@/lib/public-content-client";

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
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="all">All</option>
            </select>
          </div>

          <div className="filter-block">
            <label>Mode</label>
            <select value={format} onChange={(e) => setFormat(e.target.value)}>
              <option value="all">All</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          <div className="filter-block">
            <label>Type</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="all">All</option>
              <option value="games">Games</option>
              <option value="gathering">Gathering</option>
            </select>
          </div>
        </div>

        <div className="card-grid">
          {parties.map((party) => (
            <Link key={party.id} href={`/party/${party.id}`} className="event-card">
              <span className="tag">{party.format}</span>
              <h3>{party.title}</h3>
              <p>{party.summary}</p>
              <div className="event-meta">
                <span>{party.startDate}</span>
                <span>{party.category}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
