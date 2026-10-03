import { parsePartyFilters, partyFiltersHref } from "./party-filters";

describe("parsePartyFilters", () => {
  it("defaults to active / all / all", () => {
    expect(parsePartyFilters({})).toEqual({ status: "active", format: "all", category: "all" });
  });

  it("reads valid values from the URL", () => {
    expect(parsePartyFilters({ status: "expired", format: "offline" })).toEqual({
      status: "expired",
      format: "offline",
      category: "all",
    });
  });

  it("falls back to the default for unknown values", () => {
    expect(parsePartyFilters({ status: "unknown", category: ["games", "x"] })).toEqual({
      status: "active",
      format: "all",
      category: "games",
    });
  });
});

describe("partyFiltersHref", () => {
  it("leaves default values out of the URL", () => {
    expect(partyFiltersHref({ status: "active", format: "all", category: "all" })).toBe("/party");
    expect(partyFiltersHref({ status: "all", format: "online", category: "all" })).toBe(
      "/party?status=all&format=online",
    );
  });
});
