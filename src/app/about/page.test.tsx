import { fireEvent, render, screen } from "@testing-library/react";
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
    { id: "g1", name: "Assetto Corsa", summary: "Sim racing", description: "Weekly league." },
    { id: "g2", name: "CS2", summary: "", description: "" },
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

  it("shows the description placeholder only inside the game that lacks one", async () => {
    await renderAbout();

    fireEvent.click(screen.getByRole("button", { name: /CS2/ }));
    expect(screen.getByText("待提供：遊戲說明")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Assetto Corsa/ }));
    expect(screen.getByText("Weekly league.")).toBeInTheDocument();
    expect(screen.getAllByText("待提供：遊戲說明")).toHaveLength(1);
  });

  it("shows the brand statement placeholder when it is empty", async () => {
    const { container } = await renderAbout();
    expect(container.querySelector('[data-placeholder="brand.statement"]')).not.toBeNull();
  });
});
