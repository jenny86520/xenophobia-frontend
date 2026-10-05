import { render, screen, within } from "@testing-library/react";
import type { AboutContent } from "@/types/about";
import { fetchAboutContent } from "@/lib/public-content-client";
import AboutPage from "./page";

jest.mock("@/lib/public-content-client", () => ({
  fetchAboutContent: jest.fn(),
}));

const base: AboutContent = {
  teamProfile: {
    name: "XenoPhobiA",
    introduction: "",
    mission: "Mission text.",
    tagline: "",
    brandStatement: "",
    foundedYear: null,
    primaryCtaLabel: "",
    primaryCtaUrl: "",
    secondaryCtaLabel: "",
    secondaryCtaUrl: "",
  },
  milestones: [],
  contactInfo: [{ id: "c1", label: "Email", type: "email", value: "team@x.team" }],
  highlights: [{ id: "h1", title: "社群互動", content: "與志同道合的玩家交流" }],
  roadmap: [],
  socialLinks: [],
  games: [
    {
      id: "g1",
      name: "Assetto Corsa",
      summary: "Sim racing",
      latestVideo: { source: "youtube", title: "Hot lap", recordedOn: "2026-10-01", youtubeId: "dQw4w9WgXcQ" },
    },
    { id: "g2", name: "CS2", summary: "", latestVideo: null },
  ],
};

async function renderAbout(content: AboutContent = base) {
  (fetchAboutContent as jest.Mock).mockResolvedValue(content);
  return render(await AboutPage());
}

describe("AboutPage", () => {
  it("shows each highlight as a title with its content", async () => {
    await renderAbout();

    const section = screen.getByRole("region", { name: "網站特色" });
    expect(within(section).getByRole("heading", { level: 3, name: "社群互動" })).toBeInTheDocument();
    expect(within(section).getByText("與志同道合的玩家交流")).toBeInTheDocument();
  });

  it("lists the roadmap after the highlights, with English status badges and hidden icons", async () => {
    const { container } = await renderAbout({
      ...base,
      roadmap: [
        { id: "r1", title: "會員系統", description: "會員登入與參加活動", status: "in_progress" },
        { id: "r2", title: "點數商店", description: "", status: "planned" },
        { id: "r3", title: "每日簽到", description: "", status: "launched" },
      ],
    });

    const section = screen.getByRole("region", { name: "未來規劃" });
    expect(within(section).getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "會員系統",
      "點數商店",
      "每日簽到",
    ]);
    expect(within(section).getByText("會員登入與參加活動")).toBeInTheDocument();
    expect(Array.from(section.querySelectorAll("[data-status]")).map((b) => b.textContent)).toEqual([
      "IN PROGRESS",
      "PLANNED",
      "LIVE",
    ]);
    section.querySelectorAll("[data-status] svg").forEach((icon) => expect(icon).toHaveAttribute("aria-hidden", "true"));

    const sections = Array.from(container.querySelectorAll("main > section")).map((s) => s.getAttribute("aria-labelledby"));
    expect(sections.indexOf("roadmap-title")).toBe(sections.indexOf("highlights-title") + 1);
  });

  it("hides the roadmap section, with no placeholder, when there are no items", async () => {
    const { container } = await renderAbout();

    expect(screen.queryByRole("region", { name: "未來規劃" })).toBeNull();
    expect(container.querySelector('[data-placeholder*="roadmap"]')).toBeNull();
  });

  it("shows the milestone placeholder when there are no milestones, and the rest normally", async () => {
    await renderAbout();

    expect(screen.getByText("待提供：里程碑")).toBeInTheDocument();
    expect(screen.getByText("Mission text.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "team@x.team" })).toHaveAttribute("href", "mailto:team@x.team");
    expect(screen.getByText("社群互動")).toBeInTheDocument();
  });

  it("shows the games as a carousel, with placeholders only on the game that lacks content", async () => {
    const { container } = await renderAbout();

    expect(screen.getByRole("region", { name: "遊戲項目輪播" })).toHaveAttribute("aria-roledescription", "carousel");
    const cs2 = screen.getByRole("group", { name: /CS2/ });
    expect(cs2.querySelector('[data-placeholder="game.g2.summary"]')).not.toBeNull();
    expect(cs2.querySelector('[data-placeholder="game.g2.video"]')).not.toBeNull();

    const ac = screen.getByRole("group", { name: /Assetto Corsa/ });
    expect(ac).toHaveTextContent("Sim racing");
    expect(ac.querySelector("[data-placeholder]")).toBeNull();
    expect(container.querySelectorAll('[data-placeholder$=".video"]')).toHaveLength(1);
  });

  it("shows the brand statement placeholder when it is empty", async () => {
    const { container } = await renderAbout();
    expect(container.querySelector('[data-placeholder="brand.statement"]')).not.toBeNull();
  });
});
