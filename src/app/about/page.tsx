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
      .then((payload) => setData(payload))
      .catch(() => {
        setData({
          teamProfile: {
            name: "Xenophobia Team",
            introduction: "We build memorable community experiences around games, gatherings, and collaborative creativity.",
            mission: "To create welcoming spaces where people connect, share ideas, and enjoy meaningful events together.",
          },
          milestones: [
            { id: "m1", title: "Community Founded", description: "The team was established to connect players and friends around shared interests.", date: "2024-01-15" },
            { id: "m2", title: "First Public Meetup", description: "We hosted our first open gathering and welcomed new members to the community.", date: "2024-06-20" },
          ],
          contactInfo: [
            { id: "c1", label: "Email", type: "email", value: "hello@xenophobia.team" },
            { id: "c2", label: "Website", type: "website", value: "https://xenophobia.team" },
          ],
          highlights: [
            "Public-facing event directory",
            "Community-first design",
            "Clear event timelines and updates",
          ],
        });
      });
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
