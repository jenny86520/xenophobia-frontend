"use client";

import { useEffect, useState } from "react";

type AboutData = {
  teamProfile?: {
    name: string;
    introduction: string;
    mission: string;
  };
  milestones?: Array<{ id: string; title: string; description: string; date: string }>;
  contactInfo?: Array<{ id: string; label: string; type: string; value: string }>;
  highlights?: string[];
};

export default function AboutPage() {
  const [data, setData] = useState<AboutData>({});

  useEffect(() => {
    fetch("http://localhost:3001/api/about")
      .then((res) => res.json())
      .then((payload) => setData(payload ?? {}));
  }, []);

  return (
    <main className="page-shell">
      <section className="about-shell">
        <h1>{data.teamProfile?.name ?? "Team profile"}</h1>
        <p>{data.teamProfile?.introduction ?? "Loading team introduction..."}</p>
        <p style={{ marginTop: 12 }}>{data.teamProfile?.mission ?? "Loading mission statement..."}</p>

        <div className="about-grid">
          <div className="info-block">
            <h2>Milestones</h2>
            <ul>
              {(data.milestones ?? []).map((item) => (
                <li key={item.id}>
                  <strong>{item.title}</strong> — {item.date}
                  <p>{item.description}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="info-block">
            <h2>Contact</h2>
            <ul>
              {(data.contactInfo ?? []).map((item) => (
                <li key={item.id}>
                  <strong>{item.label}</strong>: {item.value}
                </li>
              ))}
            </ul>
          </div>

          <div className="info-block">
            <h2>Website highlights</h2>
            <ul>
              {(data.highlights ?? []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
