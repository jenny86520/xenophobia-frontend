import { render, screen } from "@testing-library/react";
import { PartyCard } from "./party-card";
import type { PartyListItem, PartySummary } from "@/types/party";

const partySummary: PartySummary = {
  id: "1",
  title: "Night of Strategy",
  summary: "Strategy-focused game night.",
  category: "games",
  format: "offline",
  startDate: "2026-09-30",
  startTime: "18:30",
};

const partyListItem: PartyListItem = {
  id: "1",
  title: "Night of Strategy",
  description: "A tabletop evening.",
  category: "games",
  format: "offline",
  status: "active",
  startDate: "2026-09-30",
  startTime: "18:30",
  location: "Red Room Studio, Taipei",
  summary: "Strategy-focused game night.",
};

describe("PartyCard", () => {
  it("renders the home-page usage without a lifecycle badge and shows date + time", () => {
    render(<PartyCard party={partySummary} showLifecycleBadge={false} metaFields="date-time" />);

    expect(screen.queryByText("ACTIVE")).not.toBeInTheDocument();
    expect(screen.queryByText("ENDED")).not.toBeInTheDocument();
    expect(screen.getByText("2026-09-30")).toBeInTheDocument();
    expect(screen.getByText("18:30")).toBeInTheDocument();
  });

  it("renders the party-list usage with a lifecycle badge and shows date + category", () => {
    render(<PartyCard party={partyListItem} showLifecycleBadge={true} metaFields="date-category" />);

    expect(screen.getByText("ACTIVE")).toBeInTheDocument();
    expect(screen.getByText("2026-09-30")).toBeInTheDocument();
    expect(screen.getAllByText("games").length).toBeGreaterThan(0);
  });
});
