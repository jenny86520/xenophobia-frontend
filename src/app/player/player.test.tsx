import { render, screen } from "@testing-library/react";
import type { GuestPlayer } from "@/types/player";

const fetchGuestPlayer = jest.fn();
const playerFetch = jest.fn();
const clearPlayerToken = jest.fn();
jest.mock("@/lib/player-session", () => ({
  fetchGuestPlayer: () => fetchGuestPlayer(),
  playerFetch: (...args: unknown[]) => playerFetch(...args),
  clearPlayerToken: () => clearPlayerToken(),
}));
const redirect = jest.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT ${url}`);
});
jest.mock("next/navigation", () => ({ redirect: (url: string) => redirect(url) }));
const revalidatePath = jest.fn();
jest.mock("next/cache", () => ({ revalidatePath: (path: string) => revalidatePath(path) }));

import { playerLogoutAction, updatePlayerNicknameAction } from "./actions";
import PlayerPage from "./page";

const guest: GuestPlayer = {
  id: "p1",
  steamId: "76561198000000001",
  profileUrl: "https://steamcommunity.com/profiles/76561198000000001",
  nickname: "阿強",
  steamName: "Ace",
  avatarUrl: null,
  status: "active",
  createdAt: "2026-10-25T00:00:00.000Z",
  lastLoginAt: null,
  rating: 1000,
};

const form = (nickname: string) => {
  const data = new FormData();
  data.set("nickname", nickname);
  return data;
};

/** jsdom has no Response; the actions only read status, ok and json(). */
const answer = (status: number, body: unknown = {}) => ({
  status,
  ok: status >= 200 && status < 300,
  json: () => Promise.resolve(body),
});

beforeEach(() => jest.clearAllMocks());

describe("/player", () => {
  it("offers a visitor the Steam sign-in as a plain link, and the member login", async () => {
    fetchGuestPlayer.mockResolvedValue(null);
    render(await PlayerPage());

    expect(screen.getByRole("link", { name: "以 Steam 登入" })).toHaveAttribute("href", "/steam/login?intent=guest");
    expect(screen.getByRole("link", { name: "會員登入" })).toHaveAttribute("href", "/member/login");
  });

  it("asks a new guest for a nickname first, prefilled with the Steam name", async () => {
    fetchGuestPlayer.mockResolvedValue({ ...guest, nickname: "" });
    render(await PlayerPage());

    expect(screen.getByRole("heading", { name: "設定暱稱" })).toBeInTheDocument();
    expect(screen.getByLabelText("暱稱")).toHaveValue("Ace");
    expect(screen.getByRole("button", { name: "完成" })).toBeInTheDocument();
    expect(screen.queryByText("SteamID")).not.toBeInTheDocument();
  });

  it("shows a guest their nickname, Steam account, nickname form and sign-out", async () => {
    fetchGuestPlayer.mockResolvedValue(guest);
    render(await PlayerPage());

    expect(screen.getByRole("heading", { level: 1, name: "阿強" })).toBeInTheDocument();
    expect(screen.getByText("76561198000000001")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Steam 個人頁/ })).toHaveAttribute("href", guest.profileUrl);
    expect(screen.getByLabelText("暱稱")).toHaveValue("阿強");
    expect(screen.getByRole("button", { name: "登出" })).toBeInTheDocument();
    expect(screen.getByText(/綁定同一個 Steam 帳號，訪客期間的紀錄會一併歸到會員帳號/)).toBeInTheDocument();
  });
});

describe("player actions", () => {
  it("saves the nickname and refreshes the page", async () => {
    playerFetch.mockResolvedValue(answer(200, { ...guest, nickname: "新名字" }));

    await expect(updatePlayerNicknameAction({}, form("新名字"))).resolves.toEqual({
      ok: true,
      message: "暱稱已更新。",
    });
    const [path, init] = playerFetch.mock.calls[0] as [string, RequestInit];
    expect(path).toBe("/api/player/me");
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(String(init.body))).toEqual({ nickname: "新名字" });
    expect(revalidatePath).toHaveBeenCalledWith("/player");
  });

  it("shows the backend's field error", async () => {
    playerFetch.mockResolvedValue(answer(400, { message: ["請填寫暱稱"], fields: { nickname: "請填寫暱稱" } }));

    await expect(updatePlayerNicknameAction({}, form(" "))).resolves.toEqual({
      ok: false,
      message: "請填寫暱稱",
      fields: { nickname: "請填寫暱稱" },
    });
  });

  it("drops an ended guest login and goes back to the player page", async () => {
    playerFetch.mockResolvedValue(answer(401));

    await expect(updatePlayerNicknameAction({}, form("x"))).rejects.toThrow("NEXT_REDIRECT /player");
    expect(clearPlayerToken).toHaveBeenCalled();
  });

  it("signs out", async () => {
    await expect(playerLogoutAction()).rejects.toThrow("NEXT_REDIRECT /player");
    expect(clearPlayerToken).toHaveBeenCalled();
  });
});
