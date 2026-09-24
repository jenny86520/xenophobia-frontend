"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Party = {
  id: string;
  title: string;
  description: string;
  category: string;
  format: string;
  status: string;
  startDate: string;
  startTime: string;
  location: string;
  summary: string;
};

export default function PartyPage() {
  const [parties, setParties] = useState<Party[]>([]);
  const [status, setStatus] = useState("active");
  const [format, setFormat] = useState("all");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    const params = new URLSearchParams();
    if (status !== "all") params.set("status", status);
    if (format !== "all") params.set("format", format);
    if (category !== "all") params.set("category", category);

    fetch(`http://localhost:3001/api/parties?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setParties(Array.isArray(data) ? data : []));
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
