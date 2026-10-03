export type FilterOption = { value: string; label: string };

export const STATUS_OPTIONS: FilterOption[] = [
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
  { value: "all", label: "All" },
];
export const FORMAT_OPTIONS: FilterOption[] = [
  { value: "all", label: "All" },
  { value: "online", label: "Online" },
  { value: "offline", label: "Offline" },
];
export const CATEGORY_OPTIONS: FilterOption[] = [
  { value: "all", label: "All" },
  { value: "games", label: "Games" },
  { value: "gathering", label: "Gathering" },
];

export type PartyFilterValues = { status: string; format: string; category: string };

export const DEFAULT_FILTERS: PartyFilterValues = { status: "active", format: "all", category: "all" };

const OPTIONS: Record<keyof PartyFilterValues, FilterOption[]> = {
  status: STATUS_OPTIONS,
  format: FORMAT_OPTIONS,
  category: CATEGORY_OPTIONS,
};

type SearchParams = Record<string, string | string[] | undefined>;

/** Reads filters from the URL; a missing or unknown value falls back to that filter's default. */
export function parsePartyFilters(searchParams: SearchParams): PartyFilterValues {
  const pick = (key: keyof PartyFilterValues) => {
    const raw = searchParams[key];
    const value = Array.isArray(raw) ? raw[0] : raw;
    return OPTIONS[key].some((option) => option.value === value) ? (value as string) : DEFAULT_FILTERS[key];
  };
  return { status: pick("status"), format: pick("format"), category: pick("category") };
}

/** The /party URL for these filters; default values are left out of the query string. */
export function partyFiltersHref(filters: PartyFilterValues): string {
  const params = new URLSearchParams();
  for (const key of ["status", "format", "category"] as const) {
    if (filters[key] !== DEFAULT_FILTERS[key]) params.set(key, filters[key]);
  }
  const query = params.toString();
  return query ? `/party?${query}` : "/party";
}
