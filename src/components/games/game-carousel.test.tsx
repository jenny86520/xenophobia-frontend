import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { YouTubeApi } from "@/lib/youtube-iframe-api";
import type { Game, GameVideo } from "@/types/about";
import { GameCarousel } from "./game-carousel";

const upload = (id: string, title: string): GameVideo => ({
  id,
  source: "upload",
  title,
  recordedOn: "2026-10-03",
  url: `/media/videos/${id}.mp4`,
  mimeType: "video/mp4",
});

const games: Game[] = [
  {
    id: "g1",
    name: "Assetto Corsa",
    summary: "Sim racing",
    videos: [{ id: "y1", source: "youtube", title: "Hot lap", recordedOn: "2026-10-01", youtubeId: "dQw4w9WgXcQ" }],
  },
  {
    id: "g2",
    name: "CS2",
    summary: "Tactical shooter",
    videos: [upload("c1", "Ace clutch"), upload("c2", "Retake"), upload("c3", "Eco win")],
  },
  { id: "g3", name: "APEX", summary: "", videos: [] },
];

function mockReducedMotion(reduce: boolean) {
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches: reduce && query.includes("reduce"),
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));
}

/** A YouTube API stand-in that keeps each player's state-change handler. */
function mockYouTubeApi() {
  const handlers: ((event: { data: number }) => void)[] = [];
  const Player = jest.fn((_iframe: HTMLIFrameElement, options: { events?: { onStateChange?: (e: { data: number }) => void } }) => {
    if (options.events?.onStateChange) handlers.push(options.events.onStateChange);
  });
  window.YT = { Player, PlayerState: { ENDED: 0 } } as unknown as YouTubeApi;
  return { Player, handlers };
}

const panel = (name: RegExp) => screen.getByRole("group", { name });
const toggle = (name: string) => screen.getByRole("button", { name: new RegExp(name) });
const players = () => document.querySelectorAll("iframe, video");
const bodyOf = (button: HTMLElement) => document.getElementById(button.getAttribute("aria-controls") ?? "")!;
const currentVideo = () => document.querySelector("video") as HTMLVideoElement;
const meta = (gameName: RegExp) => within(panel(gameName)).getByText(/ · 2026-10-0\d/);

describe("GameCarousel (expanding)", () => {
  beforeEach(() => {
    mockReducedMotion(false);
    delete window.YT;
  });

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

  it("mounts only the expanded panel's player: a muted, autoplaying youtube-nocookie embed with the IFrame API", () => {
    render(<GameCarousel games={games} />);

    expect(players()).toHaveLength(1);
    expect(within(panel(/Assetto Corsa/)).getByTitle("Assetto Corsa highlight：Hot lap")).toHaveAttribute(
      "src",
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?playsinline=1&rel=0&autoplay=1&mute=1&enablejsapi=1&origin=http%3A%2F%2Flocalhost",
    );
  });

  it("expands a collapsed panel on click, plays its first video and announces the game", () => {
    render(<GameCarousel games={games} />);

    fireEvent.click(toggle("CS2"));

    expect(toggle("CS2")).toHaveAttribute("aria-expanded", "true");
    expect(toggle("Assetto Corsa")).toHaveAttribute("aria-expanded", "false");
    expect(bodyOf(toggle("Assetto Corsa"))).toHaveAttribute("inert");
    expect(players()).toHaveLength(1);
    const video = within(panel(/CS2/)).getByLabelText("CS2 highlight：Ace clutch");
    expect(video).toHaveProperty("muted", true);
    expect(video).toHaveProperty("autoplay", true);
    expect(video.querySelector("source")).toHaveAttribute("src", "http://localhost:3001/media/videos/c1.mp4");
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

  it("does not autoplay when the visitor prefers reduced motion, even after a video ends", () => {
    mockReducedMotion(true);
    render(<GameCarousel games={games} />);

    const src = screen.getByTitle("Assetto Corsa highlight：Hot lap").getAttribute("src") ?? "";
    expect(src).not.toContain("autoplay");
    expect(src).not.toContain("mute");

    fireEvent.click(toggle("CS2"));
    expect(screen.getByLabelText("CS2 highlight：Ace clutch")).toHaveProperty("autoplay", false);
    fireEvent.ended(currentVideo());
    expect(screen.getByLabelText("CS2 highlight：Retake")).toHaveProperty("autoplay", false);
  });

  it("shows placeholders for a game without videos or summary", () => {
    render(<GameCarousel games={games} />);
    fireEvent.click(toggle("APEX"));
    const apex = panel(/APEX/);

    expect(apex.querySelector('[data-placeholder="game.g3.video"]')).not.toBeNull();
    expect(apex.querySelector('[data-placeholder="game.g3.summary"]')).not.toBeNull();
    expect(players()).toHaveLength(0);
  });

  describe("video playlist", () => {
    it("moves to the next video when one ends, and back to the first after the last, without announcing", () => {
      render(<GameCarousel games={games} />);
      fireEvent.click(toggle("CS2"));
      const announced = screen.getByText("CS2（第 2 個，共 3 個）");

      fireEvent.ended(currentVideo());
      expect(currentVideo()).toHaveAccessibleName("CS2 highlight：Retake");
      expect(meta(/CS2/)).toHaveTextContent("2 / 3 · Retake · 2026-10-03");
      expect(currentVideo()).toHaveProperty("autoplay", true);

      fireEvent.ended(currentVideo());
      fireEvent.ended(currentVideo());
      expect(currentVideo()).toHaveAccessibleName("CS2 highlight：Ace clutch");
      expect(players()).toHaveLength(1);
      // Automatic moves leave the live region alone.
      expect(announced).toHaveTextContent("CS2（第 2 個，共 3 個）");
    });

    it("switches with previous, next and the numbered buttons, marking and announcing the current one", () => {
      render(<GameCarousel games={games} />);
      fireEvent.click(toggle("CS2"));
      const cs2 = panel(/CS2/);

      fireEvent.click(within(cs2).getByRole("button", { name: "上一部" }));
      expect(currentVideo()).toHaveAccessibleName("CS2 highlight：Eco win");
      expect(within(cs2).getByRole("button", { name: "第 3 部：Eco win" })).toHaveAttribute("aria-current", "true");
      expect(screen.getByText("第 3 部，共 3 部：Eco win")).toHaveAttribute("aria-live", "polite");

      fireEvent.click(within(cs2).getByRole("button", { name: "下一部" }));
      expect(currentVideo()).toHaveAccessibleName("CS2 highlight：Ace clutch");

      fireEvent.click(within(cs2).getByRole("button", { name: "第 2 部：Retake" }));
      expect(currentVideo()).toHaveAccessibleName("CS2 highlight：Retake");
      expect(within(cs2).getByRole("button", { name: "第 1 部：Ace clutch" })).not.toHaveAttribute("aria-current");
    });

    it("starts another game at its first video", () => {
      render(<GameCarousel games={games} />);
      fireEvent.click(toggle("CS2"));
      fireEvent.ended(currentVideo());

      fireEvent.click(toggle("Assetto Corsa"));
      fireEvent.click(toggle("CS2"));

      expect(currentVideo()).toHaveAccessibleName("CS2 highlight：Ace clutch");
    });

    it("shows no switching controls for a single video and does not replay it", () => {
      render(<GameCarousel games={games} />);
      const ac = panel(/Assetto Corsa/);

      expect(within(ac).queryByRole("button", { name: /上一部|下一部/ })).not.toBeInTheDocument();
      expect(within(ac).getByText("Hot lap · 2026-10-01")).toBeInTheDocument();
    });

    it("advances when the YouTube player reports ENDED", async () => {
      const { Player, handlers } = mockYouTubeApi();
      const twoClips: Game[] = [
        {
          id: "g9",
          name: "R6",
          summary: "",
          videos: [
            { id: "a", source: "youtube", title: "Clip A", recordedOn: "2026-10-01", youtubeId: "aaaaaaaaaaa" },
            { id: "b", source: "youtube", title: "Clip B", recordedOn: "2026-10-02", youtubeId: "bbbbbbbbbbb" },
          ],
        },
      ];
      render(<GameCarousel games={twoClips} />);
      await waitFor(() => expect(Player).toHaveBeenCalledTimes(1));
      expect(Player.mock.calls[0][0]).toBe(screen.getByTitle("R6 highlight：Clip A"));

      act(() => handlers[0]({ data: 1 })); // playing: nothing happens
      expect(screen.getByTitle("R6 highlight：Clip A")).toBeInTheDocument();

      act(() => handlers[0]({ data: 0 })); // ENDED
      const next = screen.getByTitle("R6 highlight：Clip B");
      expect(next.getAttribute("src")).toMatch(/^https:\/\/www\.youtube-nocookie\.com\/embed\/bbbbbbbbbbb\?.*enablejsapi=1/);
    });
  });
});
