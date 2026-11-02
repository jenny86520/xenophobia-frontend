import { parsePartyFilters, partyFiltersHref } from "./party-filters";

describe("parsePartyFilters", () => {
  it("defaults to all / all / all, newest first", () => {
    expect(parsePartyFilters({})).toEqual({ status: "all", format: "all", category: "all", order: "desc" });
  });

  it("reads valid values from the URL", () => {
    expect(parsePartyFilters({ status: "expired", format: "offline" })).toEqual({
      status: "expired",
      format: "offline",
      category: "all",
      order: "desc",
    });
    expect(parsePartyFilters({ order: "asc" }).order).toBe("asc");
  });

  it("falls back to the default for unknown values", () => {
    expect(parsePartyFilters({ status: "unknown", category: ["games", "x"], order: "newest" })).toEqual({
      status: "all",
      format: "all",
      category: "games",
      order: "desc",
    });
  });
});

describe("partyFiltersHref", () => {
  it("leaves default values out of the URL", () => {
    expect(partyFiltersHref({ status: "all", format: "all", category: "all", order: "desc" })).toBe("/party");
    expect(partyFiltersHref({ status: "active", format: "online", category: "all", order: "desc" })).toBe(
      "/party?status=active&format=online",
    );
    expect(partyFiltersHref({ status: "all", format: "all", category: "all", order: "asc" })).toBe(
      "/party?order=asc",
    );
  });
});
