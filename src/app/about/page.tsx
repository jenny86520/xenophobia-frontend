"use client";

import { useEffect, useState } from "react";
import { fetchAboutContent, type AboutContent } from "@/lib/public-content-client";
import { PageHeader } from "@/components/layout/page-header";
import { MetaLabel, formatCount } from "@/components/layout/meta-label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  const [aboutContent, setAboutContent] = useState<AboutContent>({});

  useEffect(() => {
    fetchAboutContent().then(setAboutContent);
  }, []);

  const milestones = aboutContent.milestones ?? [];
  const contactInfo = aboutContent.contactInfo ?? [];
  const highlights = aboutContent.highlights ?? [];

  return (
    <main className="flex flex-col gap-8 sm:gap-16">
      <section className="flex flex-col gap-6">
        <PageHeader
          eyebrow="TEAM / PROFILE"
          title={aboutContent.teamProfile?.name ?? "Team profile"}
          description={aboutContent.teamProfile?.introduction ?? "Loading team introduction..."}
        />
        <p className="max-w-prose leading-relaxed text-muted-foreground">
          {aboutContent.teamProfile?.mission ?? "Loading mission statement..."}
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="gap-2">
            <MetaLabel>Milestones / {formatCount(milestones.length)}</MetaLabel>
            <CardTitle>
              <h2 className="text-xl font-semibold tracking-tight">Milestones</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="flex flex-col gap-5 border-l pl-4">
              {milestones.map((item) => (
                <li key={item.id} className="flex flex-col gap-1">
                  <MetaLabel>{item.date}</MetaLabel>
                  <strong className="font-medium">{item.title}</strong>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="gap-2">
            <MetaLabel>Contact / {formatCount(contactInfo.length)}</MetaLabel>
            <CardTitle>
              <h2 className="text-xl font-semibold tracking-tight">Contact</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col gap-4">
              {contactInfo.map((item) => (
                <div key={item.id} className="flex flex-col gap-1">
                  <dt>
                    <MetaLabel>{item.label}</MetaLabel>
                  </dt>
                  <dd className="text-sm break-all">{item.value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="gap-2">
            <MetaLabel>Highlights / {formatCount(highlights.length)}</MetaLabel>
            <CardTitle>
              <h2 className="text-xl font-semibold tracking-tight">Website highlights</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
              {highlights.map((item, index) => (
                <li key={item} className="flex gap-3">
                  <span className="font-mono text-xs text-primary">{formatCount(index + 1)}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
