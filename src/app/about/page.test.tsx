import { render, screen } from "@testing-library/react";
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
    closingStatement: "",
  },
  milestones: [],
  contactInfo: [{ id: "c1", label: "Email", type: "email", value: "team@x.team" }],
  highlights: ["Community-first design"],
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
  it("shows the milestone placeholder when there are no milestones, and the rest normally", async () => {
    await renderAbout();

    expect(screen.getByText("待提供：里程碑")).toBeInTheDocument();
    expect(screen.getByText("Mission text.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "team@x.team" })).toHaveAttribute("href", "mailto:team@x.team");
    expect(screen.getByText("Community-first design")).toBeInTheDocument();
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
