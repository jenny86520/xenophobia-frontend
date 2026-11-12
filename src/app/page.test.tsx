import { render, screen, within } from "@testing-library/react";
import {
  fetchAboutContent,
  fetchAllParties,
  fetchHomeNews,
  fetchLegends,
  fetchUpcomingParty,
} from "@/lib/public-content-client";
import type { AboutContent } from "@/types/about";
import type { Legends } from "@/types/legends";
import type { UpcomingPartyResponse } from "@/types/party";
import HomePage from "./page";

/** Matches a link by its text: jsdom spaces the name around the `<wbr>` contact values carry, browsers do not. */
const textIs = (text: string) => (_: string, element: Element) => element.textContent === text;

jest.mock("@/lib/public-content-client", () => ({
  fetchAboutContent: jest.fn(),
  fetchUpcomingParty: jest.fn(),
  fetchAllParties: jest.fn(),
  fetchLegends: jest.fn(),
  fetchHomeNews: jest.fn(),
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
  roadmap: [],
  socialLinks: [],
  stats: { members: 0 },
  games: [{ id: "g1", name: "CS2", summary: "", videos: [] }],
};

const upcoming: UpcomingPartyResponse = {
  nextParty: {
    id: "p1",
    title: "Online Hangout",
    description: "Chill night.",
    summary: "Online games together.",
    category: "games",
    format: "online",
    startDate: "2099-10-05",
    startTime: "20:00",
    endDate: "",
    endTime: "",
    location: "Discord",
    isPublic: true,
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
      endDate: "",
      endTime: "",
      isPublic: true,
      coverUrl: null,
    },
  ],
};

const legends: Legends = {
  overall: {
    title: "傳奇總榜",
    entries: [
      { rank: 1, nickname: "阿明", points: 29 },
      { rank: 2, nickname: "小華", points: 18 },
      { rank: 2, nickname: "小美", points: 18 },
      { rank: 4, nickname: "阿強", points: 9 },
    ],
  },
  boards: [],
};

async function renderHome(
  overrides: Partial<UpcomingPartyResponse> = {},
  aboutOverrides: Partial<AboutContent> = {},
  legendsData: Legends = legends,
) {
  (fetchLegends as jest.Mock).mockResolvedValue(legendsData);
  (fetchAboutContent as jest.Mock).mockResolvedValue({ ...about, ...aboutOverrides });
  (fetchUpcomingParty as jest.Mock).mockResolvedValue({ ...upcoming, ...overrides });
  (fetchAllParties as jest.Mock).mockResolvedValue([{}, {}, {}]);
  (fetchHomeNews as jest.Mock).mockResolvedValue([
    {
      id: "n1",
      title: "冬季派對報名開始",
      content: "",
      category: "news",
      version: null,
      publishAt: "2026-11-08T04:00:00.000Z",
      visibility: "public",
    },
  ]);
  return render(await HomePage());
}

describe("HomePage", () => {
  it("shows the top three places as a podium, ties sharing a step, and links to /legends", async () => {
    const { container } = await renderHome();

    const section = container.querySelector("#legends") as HTMLElement;
    expect(within(section).getByRole("heading", { level: 2, name: "傳奇榜" })).toBeInTheDocument();
    const steps = within(within(section).getByRole("list", { name: "傳奇總榜前三名" })).getAllByRole("listitem");
    // Place order for assistive tech; tied 2nd places share the silver step.
    expect(steps.map((step) => step.textContent)).toEqual(["第 1 名阿明29 PTS01", "第 2 名小華、小美18 PTS02"]);
    const all = within(section).getByRole("link", { name: "All legends" });
    expect(all).toHaveAttribute("href", "/legends");
    expect(all).toHaveAttribute("lang", "en");
    expect(section.querySelector("[data-placeholder]")).toBeNull();
  });

  it("says nobody is on the boards yet, keeping the link", async () => {
    const { container } = await renderHome({}, {}, { overall: { title: "傳奇總榜", entries: [] }, boards: [] });

    const section = container.querySelector("#legends") as HTMLElement;
    expect(section).toHaveTextContent("還沒有會員上榜");
    expect(within(section).getByRole("link", { name: "All legends" })).toHaveAttribute("href", "/legends");
  });

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

  it("shows the key figures in order: founded year, members, parties, games", async () => {
    const { container } = await renderHome({}, { stats: { members: 12 } });

    const statement = container.querySelector("#statement") as HTMLElement;
    const figures = within(statement)
      .getAllByRole("term")
      .map((term) => [term.textContent, term.nextElementSibling?.textContent]);
    expect(figures.map(([label]) => label)).toEqual(["Est.", "Members", "Parties", "Games"]);
    expect(figures[1]).toEqual(["Members", "12"]);
    expect(figures[2]).toEqual(["Parties", "03"]);
    expect(within(statement).queryByText("Milestones")).not.toBeInTheDocument();
  });

  it("shows 00 members as a real figure, not a placeholder", async () => {
    const { container } = await renderHome({}, { stats: { members: 0 } });

    const statement = container.querySelector("#statement") as HTMLElement;
    const members = within(statement).getByText("Members").closest("div") as HTMLElement;
    expect(members).toHaveTextContent("00");
    expect(members.querySelector("[data-placeholder]")).toBeNull();
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

  it("lays static film grain over the hero only, hidden from assistive technology", async () => {
    const { container } = await renderHome();

    const grain = container.querySelectorAll("[data-hero-grain]");
    expect(grain).toHaveLength(1);
    expect(grain[0].closest("#hero")).not.toBeNull();
    expect(grain[0]).toHaveAttribute("aria-hidden", "true");
  });

  it("puts the scrolling wordmark between the hero and the statement", async () => {
    const { container } = await renderHome();

    const marquee = container.querySelector("[data-brand-marquee]") as HTMLElement;
    expect(marquee.previousElementSibling).toHaveAttribute("id", "hero");
    expect(marquee.nextElementSibling).toHaveAttribute("id", "statement");
  });

  it("lists the newest 最新消息 instead of the milestones", async () => {
    const { container } = await renderHome();

    const news = container.querySelector("#news") as HTMLElement;
    expect(within(news).getByRole("heading", { level: 2, name: "最新消息" })).toBeInTheDocument();
    expect(within(news).getByRole("link", { name: /冬季派對報名開始/ })).toHaveAttribute("href", "/news/n1");
    expect(container.querySelector("#archive")).toBeNull();
    expect(container).not.toHaveTextContent("名稱創立");
  });

  it("renders the sections in the specified order", async () => {
    const { container } = await renderHome();

    const order = Array.from(container.querySelectorAll("main > section")).map(
      (section) => section.getAttribute("id") ?? section.getAttribute("data-section"),
    );
    expect(order).toEqual(["hero", "statement", "games", "legends", "events", "news", "closing"]);
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

  it("shows the date and 待定 instead of a countdown when the next party has no time yet", async () => {
    await renderHome({ nextParty: { ...upcoming.nextParty!, startTime: "" } });

    expect(screen.queryByText("Countdown")).toBeNull();
    // The hero keeps the short date in the countdown's place, with 待定 on its own line.
    const hero = screen.getByRole("region", { name: /XenoPhobiA|XPA/ });
    expect(within(hero).getByText("待定")).toBeInTheDocument();
    expect(within(hero).getAllByText("10/05").length).toBeGreaterThan(0);
    expect(within(hero).queryByText("2099-10-05（時間待定）")).toBeNull();
    // The events section's When row says 待定 too.
    expect(screen.getByText("2099-10-05（待定）")).toBeInTheDocument();
  });

  it("has no inline back-to-top text link (the floating button lives in the layout)", async () => {
    await renderHome();
    expect(screen.queryByRole("link", { name: /top|回到頁首/i })).toBeNull();
  });

  it("shows the next party summary, not its formatted description", async () => {
    await renderHome({ nextParty: { ...upcoming.nextParty!, description: "# 流程\n- 19:00 報到" } });

    const events = screen.getByRole("region", { name: "活動" });
    expect(within(events).getByText("Online games together.")).toBeInTheDocument();
    expect(within(events).queryByText(/流程|19:00 報到/)).toBeNull();
  });

  it("links the Where row to its map above the block's own link", async () => {
    const { container } = await renderHome({
      nextParty: { ...upcoming.nextParty!, location: "台北車站", locationUrl: "https://maps.app.goo.gl/abc" },
    });

    const block = container.querySelector('article[aria-labelledby="next-party-title"]') as HTMLElement;
    const map = within(block).getByRole("link", { name: /台北車站/ });
    expect(map).toHaveAttribute("href", "https://maps.app.goo.gl/abc");
    expect(map).toHaveAttribute("target", "_blank");
    expect(map).toHaveClass("relative", "z-10");
    expect(within(block).getByRole("link", { name: "Online Hangout" })).toHaveAttribute("href", "/party/p1");
  });

  it("leaves the Where row out of the next party when it has no location", async () => {
    await renderHome({ nextParty: { ...upcoming.nextParty!, location: "" } });

    const events = screen.getByRole("region", { name: "活動" });
    expect(within(events).getByText("When")).toBeInTheDocument();
    expect(within(events).getByText("Type")).toBeInTheDocument();
    expect(within(events).queryByText("Where")).toBeNull();
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
    expect(
      within(closing)
        .getAllByRole("term")
        .map((dt) => dt.textContent),
    ).toEqual(["Email", "Discord"]);
    expect(within(closing).getByRole("link", { name: textIs("team@x.team") })).toHaveAttribute("href", "mailto:team@x.team");
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
