import { render, screen } from "@testing-library/react";
import { fetchAboutContent, fetchAllParties, fetchUpcomingParty } from "@/lib/public-content-client";
import type { AboutContent } from "@/types/about";
import type { UpcomingPartyResponse } from "@/types/party";
import HomePage from "./page";

jest.mock("@/lib/public-content-client", () => ({
  fetchAboutContent: jest.fn(),
  fetchUpcomingParty: jest.fn(),
  fetchAllParties: jest.fn(),
}));

const about: AboutContent = {
  teamProfile: {
    name: "XenoPhobiA",
    introduction: "Game players center",
    mission: "First paragraph.\n\nSecond paragraph.",
    tagline: "",
    brandStatement: "We play together.",
    foundedYear: 2018,
    primaryCtaLabel: "",
    primaryCtaUrl: "",
    secondaryCtaLabel: "",
    secondaryCtaUrl: "",
    closingStatement: "",
  },
  milestones: [{ id: "m1", title: "名稱創立", description: "Founded.", date: "2018" }],
  contactInfo: [],
  highlights: [],
  games: [{ id: "g1", name: "CS2", summary: "", latestVideo: null }],
};

const upcoming: UpcomingPartyResponse = {
  nextParty: {
    id: "p1",
    title: "Online Hangout",
    description: "Chill night.",
    category: "games",
    format: "online",
    startDate: "2099-10-05",
    startTime: "20:00",
    location: "Discord",
  },
  recentParties: [
    {
      id: "p0",
      title: "Night of Strategy",
      summary: "Strategy-focused game night.",
      category: "games",
      format: "offline",
      startDate: "2026-09-30",
      startTime: "18:30",
    },
  ],
};

async function renderHome(overrides: Partial<UpcomingPartyResponse> = {}) {
  (fetchAboutContent as jest.Mock).mockResolvedValue(about);
  (fetchUpcomingParty as jest.Mock).mockResolvedValue({ ...upcoming, ...overrides });
  (fetchAllParties as jest.Mock).mockResolvedValue([{}, {}, {}]);
  return render(await HomePage());
}

describe("HomePage", () => {
  it("renders the sections in the specified order", async () => {
    const { container } = await renderHome();

    const order = Array.from(container.querySelectorAll("main > section")).map(
      (section) => section.getAttribute("id") ?? section.getAttribute("data-section"),
    );
    expect(order).toEqual(["hero", "statement", "games", "events", "archive", "gallery", "closing"]);
  });

  it("shows the tagline placeholder when the tagline is empty", async () => {
    const { container } = await renderHome();
    expect(container.querySelector('[data-placeholder="brand.tagline"]')).not.toBeNull();
  });

  it("shows only data-derived figures", async () => {
    await renderHome();
    expect(screen.getByText("2018", { selector: "dd" })).toBeInTheDocument();
    expect(screen.getByText("03", { selector: "dd" })).toBeInTheDocument();
  });

  it("shows a countdown and the next party when one is scheduled", async () => {
    await renderHome();
    expect(screen.getByText("Countdown")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Night of Strategy/ })).toHaveAttribute("href", "/party/p0");
  });

  it("has no inline back-to-top text link (the floating button lives in the layout)", async () => {
    await renderHome();
    expect(screen.queryByRole("link", { name: /top|回到頁首/i })).toBeNull();
  });

  it("shows the no-event message and no countdown when nextParty is null", async () => {
    await renderHome({ nextParty: null });

    expect(screen.getByText("目前沒有即將舉辦的活動")).toBeInTheDocument();
    expect(screen.queryByText("Countdown")).toBeNull();
    expect(screen.queryByText(/loading/i)).toBeNull();
  });
});
