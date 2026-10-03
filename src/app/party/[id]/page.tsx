"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { fetchPartyDetail, type PartyDetail } from "@/lib/public-content-client";
import { resolvePartyLifecycleStatus } from "@/utils/party-lifecycle";
import { PartyStatusBadges } from "@/components/party/party-status-badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { MetaLabel, formatCount } from "@/components/layout/meta-label";
import { Separator } from "@/components/ui/separator";

type PartyDetailState =
  | { status: "loading" }
  | { status: "loaded"; party: PartyDetail }
  | { status: "not-found" }
  | { status: "error" };

function BackToList() {
  return (
    <Button variant="ghost" asChild className="w-fit">
      <Link href="/party">
        <ArrowLeft aria-hidden="true" />
        Back to party list
      </Link>
    </Button>
  );
}

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
    return (
      <main>
        <p className="text-muted-foreground">Loading...</p>
      </main>
    );
  }

  if (state.status === "not-found" || state.status === "error") {
    return (
      <main className="flex flex-col gap-4">
        <BackToList />
        {state.status === "not-found" ? (
          <p className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            Party not found.
          </p>
        ) : (
          <p
            role="alert"
            className="rounded-lg border border-destructive/50 p-8 text-center text-destructive"
          >
            Failed to load this party. Please try again later.
          </p>
        )}
      </main>
    );
  }

  const { party } = state;
  const lifecycle = resolvePartyLifecycleStatus(party.status);
  const details = [
    { label: "Location", value: party.location },
    { label: "Date", value: party.startDate },
    { label: "Time", value: party.startTime },
    { label: "Created_by", value: party.createdBy },
    { label: "Updated_by", value: party.updatedBy ?? "—" },
  ];
  const timeline = party.timeline ?? [];

  return (
    <main className="flex flex-col gap-8 sm:gap-16">
      <div className="flex flex-col gap-6">
        <BackToList />
        <PageHeader eyebrow="PARTY / DETAIL" title={party.title} description={party.description} />
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary">{party.category.toUpperCase()}</Badge>
          <PartyStatusBadges format={party.format} lifecycle={lifecycle} />
        </div>
      </div>

      <dl className="grid border-t sm:grid-cols-2 lg:grid-cols-3">
        {details.map((item) => (
          <div key={item.label} className="flex flex-col gap-1 border-b py-4 sm:pr-6">
            <dt>
              <MetaLabel>{item.label}</MetaLabel>
            </dt>
            <dd className="text-lg font-medium">{item.value}</dd>
          </div>
        ))}
      </dl>

      {timeline.length > 0 && (
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <MetaLabel>Timeline / {formatCount(timeline.length)}</MetaLabel>
            <h2 className="text-2xl font-semibold tracking-tight">Timeline</h2>
          </div>
          <Separator />
          <ol className="flex flex-col gap-6 border-l pl-6">
            {timeline.map((item, index) => (
              <li key={item.id} className="flex flex-col gap-1">
                <MetaLabel>
                  {formatCount(index + 1)} — {new Date(item.startDateTime).toLocaleString()}
                </MetaLabel>
                <strong className="text-lg font-medium">{item.title}</strong>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </li>
            ))}
          </ol>
        </section>
      )}
    </main>
  );
}
