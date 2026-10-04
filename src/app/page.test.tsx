import { render, screen, within } from "@testing-library/react";
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
    coverUrl: null,
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
      coverUrl: null,
    },
  ],
};

async function renderHome(
  overrides: Partial<UpcomingPartyResponse> = {},
  aboutOverrides: Partial<AboutContent> = {},
) {
  (fetchAboutContent as jest.Mock).mockResolvedValue({ ...about, ...aboutOverrides });
  (fetchUpcomingParty as jest.Mock).mockResolvedValue({ ...upcoming, ...overrides });
  (fetchAllParties as jest.Mock).mockResolvedValue([{}, {}, {}]);
  return render(await HomePage());
}

describe("HomePage", () => {
  it("makes the whole next-party block one link to its detail page", async () => {
    const { container } = await renderHome();

    const block = container.querySelector('article[aria-labelledby="next-party-title"]') as HTMLElement;
    expect(block).toHaveClass("next-party");
    const links = within(block).getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAccessibleName("Online Hangout");
    expect(links[0]).toHaveAttribute("href", "/party/p1");
    expect(links[0].className).toContain("after:inset-0");
    expect(block.querySelector(".next-party-arrow")).toHaveAttribute("aria-hidden", "true");
  });

  it("links the events section to the full list in English, without reading the arrow", async () => {
    const { container } = await renderHome();

    const events = container.querySelector("#events") as HTMLElement;
    const more = within(events).getByRole("link", { name: "More Party" });
    expect(more).toHaveAttribute("href", "/party");
    expect(more).toHaveAttribute("lang", "en");
  });

  it("links the Who we are section to the about page", async () => {
    const { container } = await renderHome();

    const statement = container.querySelector("#statement") as HTMLElement;
    expect(within(statement).getByRole("link", { name: /About us/ })).toHaveAttribute("href", "/about");
  });

  it("fills at least the first viewport with the hero and shows no key visual", async () => {
    const { container } = await renderHome();

    expect(container.querySelector("#hero")).toHaveClass("min-h-svh");
    expect(container.querySelector('[data-placeholder="brand.key-visual"]')).toBeNull();
  });

  it("draws the diagonal band only inside the hero, hidden from assistive technology", async () => {
    const { container } = await renderHome();

    const bands = container.querySelectorAll("[data-hero-band]");
    expect(bands).toHaveLength(1);
    expect(bands[0].closest("#hero")).not.toBeNull();
    expect(bands[0]).toHaveAttribute("aria-hidden", "true");
  });

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

  it("closes with the contact list, the site logo and no closing-statement or vector-logo placeholders", async () => {
    const { container } = await renderHome(
      {},
      {
        contactInfo: [
          { id: "c1", label: "Email", type: "email", value: "team@x.team" },
          { id: "c2", label: "Discord", type: "social", value: "https://discord.gg/x" },
        ],
      },
    );
    const closing = container.querySelector("#closing") as HTMLElement;

    expect(within(closing).getByRole("heading", { level: 2, name: "聯絡我們" })).toBeInTheDocument();
    expect(within(closing).getAllByRole("term").map((dt) => dt.textContent)).toEqual(["Email", "Discord"]);
    expect(within(closing).getByRole("link", { name: "team@x.team" })).toHaveAttribute("href", "mailto:team@x.team");
    expect(within(closing).getByRole("img", { name: "XenoPhobiA LOGO" })).toBeInTheDocument();
    expect(container.querySelector('[data-placeholder="brand.closing-statement"]')).toBeNull();
    expect(container.querySelector('[data-placeholder="brand.vector-logo"]')).toBeNull();
  });

  it("shows a contact placeholder in the closing section when there is no contact info", async () => {
    const { container } = await renderHome();
    const closing = container.querySelector("#closing") as HTMLElement;

    expect(closing.querySelector('[data-placeholder="contact.any"]')).not.toBeNull();
    expect(within(closing).getByRole("img", { name: "XenoPhobiA LOGO" })).toBeInTheDocument();
  });

  it("puts each party's cover behind the next-party block and its recent row, and none without one", async () => {
    const { container } = await renderHome({
      nextParty: { ...upcoming.nextParty!, coverUrl: "/media/images/next.webp" },
      recentParties: [
        { ...upcoming.recentParties[0], coverUrl: "/media/images/recent.jpg" },
        { ...upcoming.recentParties[0], id: "p9", title: "No Cover Night", coverUrl: null },
      ],
    });

    const nextBlock = container.querySelector('article[aria-labelledby="next-party-title"]') as HTMLElement;
    expect(nextBlock.querySelector("[data-cover-backdrop] img")?.getAttribute("src")).toMatch(
      /\/media\/images\/next\.webp$/,
    );

    const rows = Array.from(container.querySelectorAll("#events li"));
    expect(rows[0].querySelector("[data-cover-backdrop] img")?.getAttribute("src")).toMatch(/recent\.jpg$/);
    expect(rows[1].querySelector("[data-cover-backdrop]")).toBeNull();
  });
});
