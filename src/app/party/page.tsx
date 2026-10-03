"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { fetchPartyList, type PartyListItem } from "@/lib/public-content-client";
import { PartyCard } from "@/components/party/party-card";
import { PageHeader } from "@/components/layout/page-header";
import { MetaLabel, formatCount } from "@/components/layout/meta-label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FilterOption = { value: string; label: string };

const STATUS_OPTIONS: FilterOption[] = [
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
  { value: "all", label: "All" },
];
const FORMAT_OPTIONS: FilterOption[] = [
  { value: "all", label: "All" },
  { value: "online", label: "Online" },
  { value: "offline", label: "Offline" },
];
const CATEGORY_OPTIONS: FilterOption[] = [
  { value: "all", label: "All" },
  { value: "games", label: "Games" },
  { value: "gathering", label: "Gathering" },
];

type FilterSelectProps = {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
};

/** A labelled filter dropdown; the visible <label> names the trigger for assistive tech. */
function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-mono text-xs tracking-[0.06em] text-muted-foreground uppercase">
        {label}
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="w-full sm:w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default function PartyPage() {
  const [parties, setParties] = useState<PartyListItem[]>([]);
  const [status, setStatus] = useState("active");
  const [format, setFormat] = useState("all");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    fetchPartyList({ status, format, category }).then(setParties);
  }, [status, format, category]);

  return (
    <main className="flex flex-col gap-8 sm:gap-16">
      <PageHeader
        eyebrow="PARTY / INDEX"
        title="Party listing"
        description="Browse community events by status, mode and type."
        actions={
          <Button variant="outline" asChild>
            <Link href="/">Home</Link>
          </Button>
        }
      />

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 border-y py-5 sm:flex-row">
          <FilterSelect label="Status" value={status} options={STATUS_OPTIONS} onChange={setStatus} />
          <FilterSelect label="Mode" value={format} options={FORMAT_OPTIONS} onChange={setFormat} />
          <FilterSelect label="Type" value={category} options={CATEGORY_OPTIONS} onChange={setCategory} />
        </div>

        <MetaLabel>Results / {formatCount(parties.length)}</MetaLabel>

        {parties.length === 0 ? (
          <p className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            No parties match the current filters.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {parties.map((party) => (
              <PartyCard key={party.id} party={party} showLifecycleBadge={true} metaFields="date-category" />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
