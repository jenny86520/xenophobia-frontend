import { render, screen } from "@testing-library/react";
import PartyDetailPage from "./page";
import PartyNotFound from "./not-found";
import PartyDetailError from "./error";
import { fetchPartyDetail } from "@/lib/public-content-client";

const NOT_FOUND = new Error("NEXT_NOT_FOUND");
jest.mock("next/navigation", () => ({
  notFound: () => {
    throw NOT_FOUND;
  },
}));

jest.mock("@/lib/public-content-client", () => ({
  fetchPartyDetail: jest.fn(),
}));

const mockedFetchPartyDetail = fetchPartyDetail as jest.Mock;

const party = {
  id: "1",
  title: "Night of Strategy",
  description: "A tabletop evening.",
  summary: "Strategy night.",
  category: "games",
  format: "offline",
  status: "active",
  startDate: "2026-09-30",
  startTime: "18:30",
  location: "Red Room Studio, Taipei",
  createdBy: "Admin Team",
  createdAt: "2026-10-01",
};

const renderPage = async (id = "1") =>
  render(await PartyDetailPage({ params: Promise.resolve({ id }), searchParams: Promise.resolve({}) }));

describe("PartyDetailPage", () => {
  beforeEach(() => mockedFetchPartyDetail.mockReset());

  it("calls notFound() when the party does not exist", async () => {
    mockedFetchPartyDetail.mockResolvedValue(null);
    await expect(renderPage("missing")).rejects.toBe(NOT_FOUND);
  });

  it("lets a backend failure reach the error boundary", async () => {
    mockedFetchPartyDetail.mockRejectedValue(new Error("HTTP 500"));
    await expect(renderPage()).rejects.toThrow("HTTP 500");
  });

  it("renders the title, metadata and a fixed-format timeline", async () => {
    mockedFetchPartyDetail.mockResolvedValue({
      ...party,
      timeline: [
        { id: "t1", title: "Setup and greetings", description: "Check-in", startDateTime: "2026-09-30T18:30:00Z" },
        { id: "t2", title: "Game rounds", description: "Sessions", startDateTime: "2026-09-30T19:00:00Z" },
      ],
    });

    await renderPage();

    expect(screen.getByRole("heading", { level: 1, name: "Night of Strategy" })).toBeInTheDocument();
    expect(screen.getByText("Red Room Studio, Taipei")).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem").map((li) => li.querySelector("time")?.textContent)).toEqual([
      "09/30 18:30",
      "09/30 19:00",
    ]);
  });

  it("omits the timeline section when there are no entries", async () => {
    mockedFetchPartyDetail.mockResolvedValue({ ...party, timeline: [] });

    await renderPage();

    expect(screen.queryByRole("heading", { name: "時間軸" })).toBeNull();
  });
});

describe("party detail fallbacks", () => {
  it("not-found shows the message with a link back to the list", () => {
    render(<PartyNotFound />);
    expect(screen.getByText("Party not found.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /返回活動列表/ })).toHaveAttribute("href", "/party");
  });

  it("error shows the message with a link back to the list", () => {
    render(<PartyDetailError error={new Error("x")} reset={() => {}} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Failed to load this party.");
    expect(screen.getByRole("link", { name: /返回活動列表/ })).toHaveAttribute("href", "/party");
  });
});
