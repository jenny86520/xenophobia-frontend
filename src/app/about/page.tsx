"use client";

import { useEffect, useState } from "react";
import { fetchAboutContent, type AboutContent } from "@/lib/public-content-client";

export default function AboutPage() {
  const [aboutContent, setAboutContent] = useState<AboutContent>({});

  useEffect(() => {
    fetchAboutContent().then(setAboutContent);
  }, []);

  return (
    <main className="page-shell">
      <section className="about-shell">
        <h1>{aboutContent.teamProfile?.name ?? "Team profile"}</h1>
        <p>{aboutContent.teamProfile?.introduction ?? "Loading team introduction..."}</p>
        <p style={{ marginTop: 12 }}>{aboutContent.teamProfile?.mission ?? "Loading mission statement..."}</p>

        <div className="about-grid">
          <div className="info-block">
            <h2>Milestones</h2>
            <ul>
              {(aboutContent.milestones ?? []).map((item) => (
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
              {(aboutContent.contactInfo ?? []).map((item) => (
                <li key={item.id}>
                  <strong>{item.label}</strong>: {item.value}
                </li>
              ))}
            </ul>
          </div>

          <div className="info-block">
            <h2>Website highlights</h2>
            <ul>
              {(aboutContent.highlights ?? []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}

