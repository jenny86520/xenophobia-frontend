"use client";

import { useId, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CATEGORY_OPTIONS,
  FORMAT_OPTIONS,
  partyFiltersHref,
  STATUS_OPTIONS,
  type FilterOption,
  type PartyFilterValues,
} from "@/utils/party-filters";

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
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="font-mono text-meta text-ink-muted uppercase">
        {label}
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="w-full rounded-sm data-[size=default]:h-11 md:w-44">
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

/**
 * Status / Mode / Type filters. The URL is the source of truth: a change replaces the
 * URL (defaults omitted) and the server page re-renders with the new results.
 */
export function PartyFilters({ value }: { value: PartyFilterValues }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const update = (key: keyof PartyFilterValues) => (next: string) => {
    startTransition(() => {
      router.replace(partyFiltersHref({ ...value, [key]: next }), { scroll: false });
    });
  };

  return (
    <div
      aria-busy={pending || undefined}
      className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:flex md:flex-row md:gap-6"
      data-pending={pending || undefined}
    >
      <FilterSelect label="Status" value={value.status} options={STATUS_OPTIONS} onChange={update("status")} />
      <FilterSelect label="Mode" value={value.format} options={FORMAT_OPTIONS} onChange={update("format")} />
      <FilterSelect label="Type" value={value.category} options={CATEGORY_OPTIONS} onChange={update("category")} />
    </div>
  );
}
