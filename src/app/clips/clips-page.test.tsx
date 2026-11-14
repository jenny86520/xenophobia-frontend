import { fireEvent, render, screen, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { fetchClips } from "@/lib/member-session";
import type { Clip, ClipList } from "@/types/clip";
import ClipsPage from "./page";

jest.mock("@/lib/member-session", () => ({ fetchClips: jest.fn() }));
jest.mock("@/app/member/actions", () => ({
  voteClipAction: jest.fn(),
  reportClipAction: jest.fn(),
}));

const clip = (overrides: Partial<Clip> = {}): Clip =>
  ({
    id: "v1",
    source: "youtube",
    title: "殘局 1v3",
    recordedOn: "2026-10-01",
    youtubeId: "dQw4w9WgXcQ",
    memberNickname: "小明",
    game: { id: "g-cs2", name: "CS2" },
    createdAt: "2026-11-10T00:00:00.000Z",
    likes: 3,
    dislikes: 1,
    myVote: null,
    reported: false,
    canReport: true,
    ...overrides,
  }) as Clip;

const list = (overrides: Partial<ClipList> = {}): ClipList => ({
  items: [clip()],
  total: 1,
  page: 1,
  pageSize: 12,
  games: [
    { id: "g-cs2", name: "CS2" },
    { id: "g-apex", name: "APEX" },
  ],
  voting: "allowed",
  reporting: "allowed",
  reportsLeftToday: 5,
  ...overrides,
});

async function renderPage(data: ClipList | null, query: Record<string, string> = {}) {
  (fetchClips as jest.Mock).mockResolvedValue(data);
  render(await ClipsPage({ searchParams: Promise.resolve(query) } as PageProps<"/clips">));
}

describe("ClipsPage", () => {
  it("asks visitors to sign in and shows no video at all", async () => {
    await renderPage(null);

    expect(screen.getByRole("heading", { name: "精彩片段" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /會員登入/ })).toHaveAttribute("href", "/member/login");
    expect(document.querySelector("iframe, video")).toBeNull();
    expect(screen.queryByRole("list", { name: "精彩片段" })).toBeNull();
  });

  it("passes the URL's game, sort and page to the backend", async () => {
    await renderPage(list(), { game: "g-apex", sort: "popular", page: "2" });

    expect(fetchClips).toHaveBeenCalledWith({ gameId: "g-apex", sort: "popular", page: 2 });
  });

  it("links the game filter and the two sorts, marking the current ones", async () => {
    await renderPage(list(), { sort: "popular" });

    const games = within(screen.getByRole("navigation", { name: "遊戲篩選" }));
    expect(games.getByRole("link", { name: "全部" })).toHaveAttribute("href", "/clips?sort=popular");
    expect(games.getByRole("link", { name: "APEX" })).toHaveAttribute("href", "/clips?game=g-apex&sort=popular");
    const sorts = within(screen.getByRole("navigation", { name: "排序" }));
    expect(sorts.getByRole("link", { name: "熱門" })).toHaveAttribute("aria-current", "page");
    expect(sorts.getByRole("link", { name: "最新上傳" })).toHaveAttribute("href", "/clips");
  });

  it("shows each clip with its player, game, title with nickname, votes and report", async () => {
    await renderPage(list());

    const item = within(screen.getByRole("list", { name: "精彩片段" })).getByRole("listitem");
    expect(within(item).getByRole("heading", { name: "殘局 1v3｜小明" })).toBeInTheDocument();
    expect(within(item).getByText(/CS2/)).toBeInTheDocument();
    expect(within(item).getByRole("button", { name: "播放：殘局 1v3｜小明" })).toBeInTheDocument();
    expect(within(item).getByRole("button", { name: /讚\s*3/ })).toHaveAttribute("aria-pressed", "false");
    expect(within(item).getByRole("button", { name: /爛\s*1/ })).toBeInTheDocument();
    expect(within(item).getByRole("button", { name: "檢舉" })).toBeInTheDocument();
  });

  it("shows YouTube clips as thumbnails and loads only the pressed one's player, with sound", async () => {
    await renderPage(
      list({
        items: [
          clip(),
          clip({ id: "v2", title: "Retake", youtubeId: "bbbbbbbbbbb", memberNickname: null }),
          clip({
            id: "v3",
            source: "upload",
            title: "Eco win",
            url: "/media/videos/v3.mp4",
            mimeType: "video/mp4",
          } as Partial<Clip>),
        ],
        total: 3,
      }),
    );

    expect(document.querySelectorAll("iframe")).toHaveLength(0);
    expect(document.querySelectorAll("[data-youtube-facade]")).toHaveLength(2);
    expect(document.querySelector('img[src="https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg"]')).not.toBeNull();
    const upload = screen.getByLabelText("Eco win｜小明") as HTMLVideoElement;
    expect(upload.autoplay).toBe(false);

    fireEvent.click(screen.getByRole("button", { name: "播放：殘局 1v3｜小明" }));

    const players = document.querySelectorAll("iframe");
    expect(players).toHaveLength(1);
    expect(players[0]).toHaveAttribute("title", "殘局 1v3｜小明");
    expect(players[0].getAttribute("src")).toMatch(
      /^https:\/\/www\.youtube-nocookie\.com\/embed\/dQw4w9WgXcQ\?.*autoplay=1/,
    );
    expect(players[0].getAttribute("src")).not.toContain("mute=1");
    expect(screen.getByRole("button", { name: "播放：Retake" })).toBeInTheDocument();
  });

  it("keeps a lazily loaded player in <noscript> for members without JavaScript", async () => {
    (fetchClips as jest.Mock).mockResolvedValue(list());
    const html = renderToString(await ClipsPage({ searchParams: Promise.resolve({}) } as PageProps<"/clips">));

    const noscript = html.match(/<noscript>([\s\S]*?)<\/noscript>/)?.[1] ?? "";
    expect(noscript).toContain("youtube-nocookie.com/embed/dQw4w9WgXcQ");
    expect(noscript).toContain('loading="lazy"');
    expect(noscript).not.toContain("autoplay=1");
  });

  it("disables voting and says why while it is paused", async () => {
    await renderPage(list({ voting: "paused" }));

    expect(screen.getByRole("note")).toHaveTextContent("影片按讚目前暫停");
    expect(screen.getByRole("button", { name: /讚/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: "檢舉" })).toBeEnabled();
  });

  it("says when there is nothing yet", async () => {
    await renderPage(list({ items: [], total: 0 }));

    expect(screen.getByText("還沒有影片。")).toBeInTheDocument();
  });

  it("pages through with links that keep the filters", async () => {
    await renderPage(list({ total: 30 }), { game: "g-cs2", page: "2" });

    const pager = within(screen.getByRole("navigation", { name: "精彩片段分頁" }));
    expect(pager.getByText("2 / 3")).toBeInTheDocument();
    expect(pager.getByRole("link", { name: "上一頁" })).toHaveAttribute("href", "/clips?game=g-cs2");
    expect(pager.getByRole("link", { name: "下一頁" })).toHaveAttribute("href", "/clips?game=g-cs2&page=3");
  });
});
