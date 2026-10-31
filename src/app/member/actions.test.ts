const cookieStore = { get: jest.fn(), set: jest.fn(), delete: jest.fn() };
const mockRedirect = jest.fn((path: string) => {
  throw new Error(`REDIRECT ${path}`);
});
const mockRevalidate = jest.fn();
// connection() in public-content-client needs a Next request scope (and the Request global jsdom lacks).
jest.mock("next/server", () => ({ connection: jest.fn().mockResolvedValue(undefined) }));
jest.mock("next/headers", () => ({
  cookies: () => Promise.resolve(cookieStore),
  headers: () => Promise.resolve(new Headers({ "x-forwarded-for": "203.0.113.5" })),
}));
jest.mock("next/navigation", () => ({ redirect: (path: string) => mockRedirect(path) }));
jest.mock("next/cache", () => ({ revalidatePath: (path: string) => mockRevalidate(path) }));

import {
  acceptMatchInviteAction,
  answerFriendRequestAction,
  dismissMatchInviteAction,
  removeFriendAction,
  sendFriendRequestAction,
  loginAction,
  registerAction,
  registrationAction,
  requestResetAction,
  setPasswordAction,
  submitYoutubeVideoAction,
  updateNicknameAction,
} from "./actions";

function respond(status: number, body: unknown = {}) {
  global.fetch = jest.fn().mockResolvedValue({
    status,
    ok: status >= 200 && status < 300,
    json: () => Promise.resolve(body),
  }) as unknown as typeof fetch;
}

const form = (values: Record<string, string>) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
};

const sentBody = () => JSON.parse(String(((global.fetch as jest.Mock).mock.calls[0][1] as RequestInit).body)) as unknown;

beforeEach(() => {
  jest.clearAllMocks();
  cookieStore.get.mockReturnValue({ value: "jwt" });
});

describe("loginAction", () => {
  it("stores the token in the httpOnly cookie and goes to the member page", async () => {
    respond(200, { accessToken: "new-jwt", expiresIn: 604800 });

    await expect(loginAction({}, form({ username: "ming", password: "secret-123" }))).rejects.toThrow("REDIRECT /member");
    expect(sentBody()).toEqual({ username: "ming", password: "secret-123" });
    expect(cookieStore.set).toHaveBeenCalledWith(
      "xpa_member",
      "new-jwt",
      expect.objectContaining({ httpOnly: true, maxAge: 604800 }),
    );
  });

  it("passes the backend's lock message through and sets no cookie", async () => {
    respond(423, { statusCode: 423, message: "帳號已鎖定，請聯絡管理員解鎖" });

    await expect(loginAction({}, form({ username: "ming", password: "x" }))).resolves.toEqual({
      ok: false,
      message: "帳號已鎖定，請聯絡管理員解鎖",
      fields: undefined,
      values: { username: "ming" },
    });
    expect(cookieStore.set).not.toHaveBeenCalled();
  });

  it("shows the backend's wait message when there were too many attempts", async () => {
    respond(429, { statusCode: 429, error: "TOO_MANY_REQUESTS", message: "請求太頻繁，請在 15 分鐘後再試" });

    await expect(loginAction({}, form({ username: "ming", password: "x" }))).resolves.toEqual({
      ok: false,
      message: "請求太頻繁，請在 15 分鐘後再試",
      fields: undefined,
      values: { username: "ming" },
    });
    // The visitor's address went along, so the backend counts the visitor rather than this server.
    const [, init] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect(new Headers(init.headers).get("X-Forwarded-For")).toBe("203.0.113.5");
    expect(cookieStore.set).not.toHaveBeenCalled();
  });
});

describe("registerAction", () => {
  it("forwards only the sign-up fields and returns the backend's field errors", async () => {
    respond(400, { message: ["username is already taken"], fields: { username: "username is already taken" } });

    const state = await registerAction(
      {},
      form({ name: "王小明", nickname: "小明", username: "ming", discordId: "m#1", email: "m@x.com", phone: "0912345678", password: "no" }),
    );

    expect(sentBody()).toEqual({ name: "王小明", nickname: "小明", username: "ming", discordId: "m#1", email: "m@x.com", phone: "0912345678" });
    expect(state).toMatchObject({ ok: false, fields: { username: "username is already taken" } });
  });

  it("sends acceptTerms only when the box is ticked, and keeps it for the form", async () => {
    const fields = { name: "王小明", nickname: "小明", username: "ming", discordId: "m#1", email: "m@x.com", phone: "" };
    respond(201, { status: "pending" });
    await registerAction({}, form({ ...fields, acceptTerms: "on" }));
    expect(sentBody()).toEqual({ ...fields, acceptTerms: true });

    respond(400, { message: ["請閱讀並同意使用條款與隱私權政策"], fields: { acceptTerms: "請閱讀並同意使用條款與隱私權政策" } });
    const state = await registerAction({}, form(fields));
    expect(sentBody()).toEqual(fields);
    expect(state).toMatchObject({ ok: false, fields: { acceptTerms: "請閱讀並同意使用條款與隱私權政策" } });
  });

  it("explains that an admin must activate the account", async () => {
    respond(201, { status: "pending" });
    const state = await registerAction({}, form({}));
    expect(state.message).toContain("請聯絡管理員開通");
  });
});

describe("password and reset", () => {
  it("shows the backend's message for an expired link", async () => {
    respond(400, { message: ["連結已失效，請聯絡管理員重發"], fields: { token: "連結已失效，請聯絡管理員重發" } });
    const state = await setPasswordAction({}, form({ token: "t", password: "new-password" }));
    expect(state.message).toBe("連結已失效，請聯絡管理員重發");
  });

  it("shows the backend's neutral reset answer", async () => {
    respond(202, { message: "已送出申請，管理員處理後會寄信給你" });
    const state = await requestResetAction({}, form({ username: "anyone" }));
    expect(state).toEqual({ ok: true, message: "已送出申請，管理員處理後會寄信給你" });
  });
});

describe("member actions with a session", () => {
  it("updates the nickname and refreshes the member page", async () => {
    respond(200, {});
    const state = await updateNicknameAction({}, form({ nickname: "阿明" }));
    expect(state.ok).toBe(true);
    expect(mockRevalidate).toHaveBeenCalledWith("/member");
  });

  it("joins a party and refreshes its page", async () => {
    respond(200, {});
    const state = await registrationAction("p1", "join");
    const [url, init] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/api\/member\/parties\/p1\/registration$/);
    expect(init.method).toBe("POST");
    expect(state).toEqual({ ok: true, message: "已報名。" });
    expect(mockRevalidate).toHaveBeenCalledWith("/party/p1");
  });

  it("passes a refusal through unchanged", async () => {
    respond(403, { message: "此活動限定特定角色報名" });
    await expect(registrationAction("p1", "join")).resolves.toMatchObject({ ok: false, message: "此活動限定特定角色報名" });
  });

  it("drops the cookie and goes to login when the session is gone", async () => {
    respond(401, {});
    await expect(registrationAction("p1", "leave")).rejects.toThrow("REDIRECT /member/login");
    expect(cookieStore.delete).toHaveBeenCalledWith("xpa_member");
  });
});

describe("submitYoutubeVideoAction", () => {
  const video = {
    gameId: "g1",
    otherGameName: "",
    title: "Ace clutch",
    recordedOn: "",
    youtubeUrl: "https://youtu.be/dQw4w9WgXcQ",
    rightsConfirmed: "on",
  };

  it("forwards the link without an empty date and refreshes the submissions page", async () => {
    respond(201, { id: "s1", status: "pending" });

    const state = await submitYoutubeVideoAction({}, form(video));

    const [url, init] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/api\/member\/video-submissions$/);
    expect(init.method).toBe("POST");
    expect(sentBody()).toEqual({
      gameId: "g1",
      title: "Ace clutch",
      youtubeUrl: "https://youtu.be/dQw4w9WgXcQ",
      rightsConfirmed: true,
    });
    expect(state).toEqual({ ok: true, message: "已送出投稿，請等待管理員審核。" });
    expect(mockRevalidate).toHaveBeenCalledWith("/member");
  });

  it("sends the typed name instead of a game for 其他", async () => {
    respond(201, {});
    await submitYoutubeVideoAction({}, form({ ...video, gameId: "other", otherGameName: "Rainbow Six" }));
    expect(sentBody()).toEqual({
      otherGameName: "Rainbow Six",
      title: "Ace clutch",
      youtubeUrl: "https://youtu.be/dQw4w9WgXcQ",
      rightsConfirmed: true,
    });
  });

  it("sends a chosen date", async () => {
    respond(201, {});
    await submitYoutubeVideoAction({}, form({ ...video, recordedOn: "2026-10-01" }));
    expect(sentBody()).toMatchObject({ recordedOn: "2026-10-01" });
  });

  it("returns the backend's field errors with what was typed", async () => {
    respond(400, { message: ["youtubeUrl must be a supported YouTube URL"], fields: { youtubeUrl: "不支援的網址" } });

    await expect(submitYoutubeVideoAction({}, form({ ...video, youtubeUrl: "https://vimeo.com/1" }))).resolves.toEqual({
      ok: false,
      message: "youtubeUrl must be a supported YouTube URL",
      fields: { youtubeUrl: "不支援的網址" },
      values: { ...video, youtubeUrl: "https://vimeo.com/1" },
    });
  });

  it("passes a permission refusal through, and signs in again on 401", async () => {
    respond(403, { message: "目前的角色不能投稿影片" });
    await expect(submitYoutubeVideoAction({}, form(video))).resolves.toMatchObject({
      ok: false,
      message: "目前的角色不能投稿影片",
    });

    respond(401, {});
    await expect(submitYoutubeVideoAction({}, form(video))).rejects.toThrow("REDIRECT /member/login");
  });
});

describe("friend actions", () => {
  const calledWith = () => (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];

  it("sends a request by member number and says who it went to", async () => {
    respond(201, { status: "pending", member: { nickname: "小華" } });

    const state = await sendFriendRequestAction({}, form({ memberNumber: "XPA-0012" }));

    expect(calledWith()[0]).toMatch(/\/api\/member\/friends\/requests$/);
    expect(sentBody()).toEqual({ memberNumber: "XPA-0012" });
    expect(state).toEqual({ ok: true, message: "已送出好友邀請給「小華」。" });
    expect(mockRevalidate).toHaveBeenCalledWith("/");
  });

  it("says when asking back made the two friends", async () => {
    respond(201, { status: "accepted", member: { nickname: "小華" } });

    expect((await sendFriendRequestAction({}, form({ memberNumber: "12" }))).message).toBe(
      "「小華」也邀請過你，你們已經是好友了。",
    );
  });

  it("keeps what was typed and shows the backend's field error", async () => {
    respond(404, { message: "找不到這個會員編號", fields: { memberNumber: "找不到這個會員編號" } });

    const state = await sendFriendRequestAction({}, form({ memberNumber: "XPA-9999" }));

    expect(state).toMatchObject({
      ok: false,
      fields: { memberNumber: "找不到這個會員編號" },
      values: { memberNumber: "XPA-9999" },
    });
  });

  it("accepts with POST …/accept and declines or withdraws with DELETE", async () => {
    respond(200, {});
    await answerFriendRequestAction("r1", "accept");
    expect(calledWith()[0]).toMatch(/\/requests\/r1\/accept$/);
    expect(calledWith()[1].method).toBe("POST");

    respond(204);
    expect((await answerFriendRequestAction("r1", "withdraw")).message).toBe("已收回邀請。");
    expect(calledWith()[0]).toMatch(/\/requests\/r1$/);
    expect(calledWith()[1].method).toBe("DELETE");
  });

  it("refuses to unfriend until the box is ticked", async () => {
    respond(204);

    const state = await removeFriendAction("m2", {}, form({}));

    expect(state.fields).toEqual({ confirm: "請先勾選確認" });
    expect(global.fetch).not.toHaveBeenCalled();
    expect((await removeFriendAction("m2", {}, form({ confirm: "on" }))).ok).toBe(true);
  });

  it("opens the match after joining a group from an invite", async () => {
    respond(200, { matchId: "x1" });

    await expect(acceptMatchInviteAction("i1")).rejects.toThrow("REDIRECT /matches/x1");
  });

  it("shows why an invite cannot be accepted, and signs in again on 401", async () => {
    respond(403, { message: "請先到會員頁綁定 Steam，才能加入小隊" });
    expect((await acceptMatchInviteAction("i1")).message).toBe("請先到會員頁綁定 Steam，才能加入小隊");

    respond(401);
    await expect(dismissMatchInviteAction("i1")).rejects.toThrow("REDIRECT /member/login");
    expect(cookieStore.delete).toHaveBeenCalledWith("xpa_member");
  });
});
