import { fireEvent, render, screen, within } from "@testing-library/react";
import type { Game } from "@/types/about";
import { GameCarousel } from "./game-carousel";

const games: Game[] = [
  {
    id: "g1",
    name: "Assetto Corsa",
    summary: "Sim racing",
    latestVideo: { source: "youtube", title: "Hot lap", recordedOn: "2026-10-01", youtubeId: "dQw4w9WgXcQ" },
  },
  {
    id: "g2",
    name: "CS2",
    summary: "Tactical shooter",
    latestVideo: {
      source: "upload",
      title: "Ace clutch",
      recordedOn: "2026-10-03",
      url: "/media/videos/11111111-1111-1111-1111-111111111111.mp4",
      mimeType: "video/mp4",
    },
  },
  { id: "g3", name: "APEX", summary: "", latestVideo: null },
];

function mockReducedMotion(reduce: boolean) {
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches: reduce && query.includes("reduce"),
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));
}

const panel = (name: RegExp) => screen.getByRole("group", { name });
const toggle = (name: string) => screen.getByRole("button", { name: new RegExp(name) });
const players = () => document.querySelectorAll("iframe, video");
const bodyOf = (button: HTMLElement) => document.getElementById(button.getAttribute("aria-controls") ?? "")!;

describe("GameCarousel (expanding)", () => {
  beforeEach(() => mockReducedMotion(false));

  it("labels the carousel and every panel, and expands the first panel by default", () => {
    render(<GameCarousel games={games} />);

    expect(screen.getByRole("region", { name: "遊戲項目輪播" })).toHaveAttribute(
      "aria-roledescription",
      "carousel",
    );
    expect(panel(/第 1 個，共 3 個：Assetto Corsa/)).toHaveAttribute("aria-roledescription", "slide");
    expect(toggle("Assetto Corsa")).toHaveAttribute("aria-expanded", "true");
    expect(toggle("CS2")).toHaveAttribute("aria-expanded", "false");
    expect(toggle("APEX")).toHaveAttribute("aria-expanded", "false");
  });

  it("makes collapsed bodies inert and keeps the expanded one reachable", () => {
    render(<GameCarousel games={games} />);

    expect(bodyOf(toggle("Assetto Corsa"))).not.toHaveAttribute("inert");
    expect(bodyOf(toggle("CS2"))).toHaveAttribute("inert");
    expect(bodyOf(toggle("APEX"))).toHaveAttribute("inert");
  });

  it("mounts only the expanded panel's player: a muted, autoplaying youtube-nocookie embed", () => {
    render(<GameCarousel games={games} />);

    expect(players()).toHaveLength(1);
    expect(within(panel(/Assetto Corsa/)).getByTitle("Assetto Corsa 最新 highlight：Hot lap")).toHaveAttribute(
      "src",
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?playsinline=1&rel=0&autoplay=1&mute=1",
    );
  });

  it("expands a collapsed panel on click, moves the player and announces the game", () => {
    render(<GameCarousel games={games} />);

    fireEvent.click(toggle("CS2"));

    expect(toggle("CS2")).toHaveAttribute("aria-expanded", "true");
    expect(toggle("Assetto Corsa")).toHaveAttribute("aria-expanded", "false");
    expect(bodyOf(toggle("Assetto Corsa"))).toHaveAttribute("inert");
    expect(players()).toHaveLength(1);
    const video = within(panel(/CS2/)).getByLabelText("CS2 最新 highlight：Ace clutch");
    expect(video).toHaveProperty("muted", true);
    expect(video).toHaveProperty("autoplay", true);
    expect(video.querySelector("source")).toHaveAttribute(
      "src",
      "http://localhost:3001/media/videos/11111111-1111-1111-1111-111111111111.mp4",
    );
    expect(screen.getByText("CS2（第 2 個，共 3 個）")).toHaveAttribute("aria-live", "polite");
  });

  it("keeps the expanded panel open when it is clicked again", () => {
    render(<GameCarousel games={games} />);
    fireEvent.click(toggle("Assetto Corsa"));
    expect(toggle("Assetto Corsa")).toHaveAttribute("aria-expanded", "true");
  });

  it("moves focus between panel buttons with arrow keys, Home and End", () => {
    render(<GameCarousel games={games} />);
    const first = toggle("Assetto Corsa");
    first.focus();

    fireEvent.keyDown(first, { key: "ArrowRight" });
    expect(document.activeElement).toBe(toggle("CS2"));
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(document.activeElement).toBe(toggle("APEX"));
    fireEvent.keyDown(document.activeElement!, { key: "ArrowRight" });
    expect(document.activeElement).toBe(toggle("APEX"));
    fireEvent.keyDown(document.activeElement!, { key: "Home" });
    expect(document.activeElement).toBe(first);
    fireEvent.keyDown(first, { key: "End" });
    expect(document.activeElement).toBe(toggle("APEX"));
    fireEvent.keyDown(document.activeElement!, { key: "ArrowUp" });
    expect(document.activeElement).toBe(toggle("CS2"));

    // Focus alone does not expand; Enter/Space are the native button activation.
    expect(toggle("CS2")).toHaveAttribute("aria-expanded", "false");
    expect(toggle("CS2").tagName).toBe("BUTTON");
  });

  it("does not autoplay when the visitor prefers reduced motion", () => {
    mockReducedMotion(true);
    render(<GameCarousel games={games} />);

    const src = screen.getByTitle("Assetto Corsa 最新 highlight：Hot lap").getAttribute("src") ?? "";
    expect(src).not.toContain("autoplay");
    expect(src).not.toContain("mute");

    fireEvent.click(toggle("CS2"));
    expect(screen.getByLabelText(/Ace clutch/)).toHaveProperty("autoplay", false);
  });

  it("shows placeholders for a game without a video or summary", () => {
    render(<GameCarousel games={games} />);
    fireEvent.click(toggle("APEX"));
    const apex = panel(/APEX/);

    expect(apex.querySelector('[data-placeholder="game.g3.video"]')).not.toBeNull();
    expect(apex.querySelector('[data-placeholder="game.g3.summary"]')).not.toBeNull();
    expect(players()).toHaveLength(0);
  });
});
