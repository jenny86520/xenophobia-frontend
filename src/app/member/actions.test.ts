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
  acceptLegalAction,
  acceptMatchInviteAction,
  answerFriendRequestAction,
  checkInAction,
  claimIceCampaignAction,
  claimQuestAction,
  createIceCreamAction,
  deleteIceCreamAction,
  giftIceCreamAction,
  iceCreamStepAction,
  markIceCreamsSeenAction,
  redeemIceCreamAction,
  dismissMatchInviteAction,
  removeFriendAction,
  sendFriendRequestAction,
  loginAction,
  registerAction,
  registrationAction,
  requestResetAction,
  setPasswordAction,
  startSteamLinkAction,
  submitYoutubeVideoAction,
  updateFriendNoteAction,
  updateProfileAction,
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

describe("startSteamLinkAction", () => {
  it("keeps the link ticket in a cookie for /steam only, then goes to Steam", async () => {
    respond(200, { linkTicket: "ticket", expiresIn: 600 });

    await expect(startSteamLinkAction({}, form({ password: "secret-123" }))).rejects.toThrow(
      "REDIRECT /steam/login?intent=link",
    );
    expect(sentBody()).toEqual({ password: "secret-123" });
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toMatch(/\/api\/member\/steam\/link-ticket$/);
    expect(cookieStore.set).toHaveBeenCalledWith(
      "xpa_steam_link",
      "ticket",
      expect.objectContaining({ httpOnly: true, path: "/steam", maxAge: 600, sameSite: "lax" }),
    );
  });

  it("shows a wrong password on its field and stays on the page", async () => {
    respond(400, { message: ["密碼錯誤"], fields: { password: "密碼錯誤" } });

    const state = await startSteamLinkAction({}, form({ password: "nope" }));

    expect(state).toEqual({ ok: false, message: "密碼錯誤", fields: { password: "密碼錯誤" } });
    expect(cookieStore.set).not.toHaveBeenCalled();
  });

  it("names the lock after the third wrong password", async () => {
    respond(423, { message: "帳號已鎖定，請聯絡管理員解鎖" });

    const state = await startSteamLinkAction({}, form({ password: "nope" }));

    expect(state.message).toBe("帳號已鎖定，請聯絡管理員解鎖");
  });

  it("sends an expired session to the login page", async () => {
    respond(401);

    await expect(startSteamLinkAction({}, form({ password: "x" }))).rejects.toThrow("REDIRECT /member/login");
    expect(cookieStore.delete).toHaveBeenCalledWith("xpa_member");
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
    const state = await setPasswordAction(
      {},
      form({ token: "t", password: "new-password", passwordConfirm: "new-password" }),
    );
    expect(state.message).toBe("連結已失效，請聯絡管理員重發");
  });

  it("refuses two different entries without asking the backend, so the link is not used up", async () => {
    respond(200, {});
    await expect(
      setPasswordAction({}, form({ token: "t", password: "new-password", passwordConfirm: "new-passw0rd" })),
    ).resolves.toEqual({
      ok: false,
      message: "兩次輸入的密碼不一致",
      fields: { passwordConfirm: "兩次輸入的密碼不一致" },
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("sends only the token and the password once both entries match", async () => {
    respond(200, {});
    await expect(
      setPasswordAction({}, form({ token: "t", password: "new-password", passwordConfirm: "new-password" })),
    ).resolves.toMatchObject({ ok: true });
    expect(sentBody()).toEqual({ token: "t", password: "new-password" });
  });

  it("shows the backend's neutral reset answer", async () => {
    respond(202, { message: "已送出申請，管理員處理後會寄信給你" });
    const state = await requestResetAction({}, form({ username: "anyone" }));
    expect(state).toEqual({ ok: true, message: "已送出申請，管理員處理後會寄信給你" });
  });
});

describe("member actions with a session", () => {
  it("sends the 稱呼 and nickname together and refreshes the member page", async () => {
    respond(200, {});
    const state = await updateProfileAction({}, form({ name: "小明", nickname: "阿明" }));
    const [url, init] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/api\/member\/me$/);
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body as string)).toEqual({ name: "小明", nickname: "阿明" });
    expect(state).toEqual({ ok: true, message: "個人資料已更新。" });
    expect(mockRevalidate).toHaveBeenCalledWith("/member");
  });

  it("returns field errors with what was typed", async () => {
    respond(400, { message: ["name must be shorter than or equal to 50 characters"], fields: { name: "太長了" } });
    const state = await updateProfileAction({}, form({ name: "x".repeat(51), nickname: "阿明" }));
    expect(state).toMatchObject({ ok: false, fields: { name: "太長了" }, values: { name: "x".repeat(51), nickname: "阿明" } });
    expect(mockRevalidate).not.toHaveBeenCalled();
  });

  it("joins a party and refreshes its page", async () => {
    respond(200, {});
    const state = await registrationAction("p1", "join");
    const [url, init] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/api\/member\/parties\/p1\/registration$/);
    expect(init.method).toBe("POST");
    expect(state).toEqual({ ok: true });
    expect(mockRevalidate).toHaveBeenCalledWith("/party/p1");
  });

  it("joins and leaves a sub-party through its own path", async () => {
    respond(200, {});
    const joined = await registrationAction("p1", "join", "s1");
    const [url, init] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/api\/member\/parties\/p1\/sub-parties\/s1\/registration$/);
    expect(init.method).toBe("POST");
    expect(joined).toEqual({ ok: true });
    expect(mockRevalidate).toHaveBeenCalledWith("/party/p1");

    respond(409, { message: "請先報名主派對" });
    await expect(registrationAction("p1", "join", "s1")).resolves.toMatchObject({ ok: false, message: "請先報名主派對" });
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

  it("takes a member who must agree to renewed terms to the member page", async () => {
    respond(428, { statusCode: 428, message: "條款已更新，請先到會員專區閱讀並同意新版條款" });
    await expect(updateProfileAction({}, form({ nickname: "阿明" }))).rejects.toThrow("REDIRECT /member");
    await expect(registrationAction("p1", "join")).rejects.toThrow("REDIRECT /member");
    expect(cookieStore.delete).not.toHaveBeenCalled();
  });
});

describe("acceptLegalAction", () => {
  it("sends the versions shown, then refreshes the site and opens the member page", async () => {
    respond(201, { required: false, documents: [] });
    await expect(
      acceptLegalAction({}, form({ termsVersion: "3", privacyVersion: "1", acceptRenewedTerms: "on" })),
    ).rejects.toThrow("REDIRECT /member");
    const [url] = (global.fetch as jest.Mock).mock.calls[0] as [string];
    expect(url).toMatch(/\/api\/member\/legal-consent$/);
    expect(sentBody()).toEqual({ termsVersion: 3, privacyVersion: 1 });
    expect(mockRevalidate).toHaveBeenCalledWith("/");
  });

  it("shows the backend's message and the newer version when the terms changed meanwhile", async () => {
    respond(409, { statusCode: 409, message: "條款剛更新，請重新閱讀後再同意" });
    await expect(acceptLegalAction({}, form({ termsVersion: "3", privacyVersion: "1" }))).resolves.toMatchObject({
      ok: false,
      message: "條款剛更新，請重新閱讀後再同意",
    });
    expect(mockRevalidate).toHaveBeenCalledWith("/");
  });

  it("signs in again when the session is gone", async () => {
    respond(401, {});
    await expect(acceptLegalAction({}, form({ termsVersion: "3", privacyVersion: "1" }))).rejects.toThrow(
      "REDIRECT /member/login",
    );
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

describe("updateFriendNoteAction", () => {
  it("saves the note with PUT and refreshes the friend's page and the member page", async () => {
    respond(200, { note: "大學室友" });
    await expect(updateFriendNoteAction("m2", {}, form({ note: " 大學室友 " }))).resolves.toEqual({
      ok: true,
      message: "已儲存備註。",
    });
    const [url, init] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/api\/member\/friends\/m2\/note$/);
    expect(init.method).toBe("PUT");
    expect(sentBody()).toEqual({ note: " 大學室友 " });
    expect(mockRevalidate).toHaveBeenCalledWith("/member/friends/m2");
  });

  it("says the note was cleared when it was emptied", async () => {
    respond(200, { note: null });
    await expect(updateFriendNoteAction("m2", {}, form({ note: "" }))).resolves.toMatchObject({
      ok: true,
      message: "已清除備註。",
    });
  });

  it("keeps what was typed and shows the backend's field error", async () => {
    respond(400, { message: ["備註最多 50 字"], fields: { note: "備註最多 50 字" } });
    await expect(updateFriendNoteAction("m2", {}, form({ note: "x".repeat(51) }))).resolves.toMatchObject({
      ok: false,
      fields: { note: "備註最多 50 字" },
      values: { note: "x".repeat(51) },
    });
  });
});

describe("checkInAction", () => {
  it("checks in, names the point and refreshes the member page", async () => {
    respond(201, { awarded: { checkin: 1, streakBonus: 0 }, balance: 6, campaign: null });
    const state = await checkInAction();
    const [url, init] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/api\/member\/check-ins$/);
    expect(init.method).toBe("POST");
    expect(state).toEqual({ ok: true, message: "簽到成功，獲得 1 點。" });
    expect(mockRevalidate).toHaveBeenCalledWith("/member");
  });

  it("names the streak bonus", async () => {
    respond(201, {
      awarded: { checkin: 1, streakBonus: 1 },
      balance: 12,
      campaign: { id: "c1", title: "十一月全勤", endDate: "2026-11-30", requiredDays: 10, streak: 10 },
    });
    await expect(checkInAction()).resolves.toEqual({
      ok: true,
      message: "簽到成功，獲得 1 點。連續簽到滿 10 天，另外獲得 1 點連續簽到獎勵。",
    });
  });

  it("shows the backend's refusal, and sends a lost session to login", async () => {
    respond(409, { message: "今天已經簽到過了" });
    await expect(checkInAction()).resolves.toMatchObject({ ok: false, message: "今天已經簽到過了" });
    expect(mockRevalidate).not.toHaveBeenCalled();

    respond(401, {});
    await expect(checkInAction()).rejects.toThrow("REDIRECT /member/login");
  });
});

describe("claimQuestAction", () => {
  it("claims a quest, names the points and refreshes the member page and the shop", async () => {
    respond(200, { code: "steam", points: 2, balance: 5 });
    await expect(claimQuestAction("steam")).resolves.toEqual({ ok: true, message: "已領取 2 點" });
    const [url, init] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/api\/member\/quests\/steam\/claim$/);
    expect(init.method).toBe("POST");
    expect(mockRevalidate).toHaveBeenCalledWith("/member");
    expect(mockRevalidate).toHaveBeenCalledWith("/shop");
  });

  it("shows the backend's refusal as it is", async () => {
    respond(409, { message: "還沒完成這個任務" });
    await expect(claimQuestAction("friend")).resolves.toMatchObject({ ok: false, message: "還沒完成這個任務" });
    expect(mockRevalidate).not.toHaveBeenCalled();
  });
});

describe("ice cream actions", () => {
  const token = { serial: 12, giftTo: { nickname: "小華" } };
  const call = () => (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];

  it("issues a token and refreshes the layout (the header count)", async () => {
    respond(201, token);
    await expect(createIceCreamAction()).resolves.toEqual({
      ok: true,
      message: "已建立冰炫風 #12，可以送給好友了。",
    });
    expect(call()[0]).toMatch(/\/api\/member\/ice-creams$/);
    expect(mockRevalidate).toHaveBeenCalledWith("/");
    // Acting on the tab also counts as having seen it (for browsers without JavaScript).
    expect((global.fetch as jest.Mock).mock.calls[1][0]).toMatch(/\/api\/member\/ice-creams\/seen$/);
  });

  it("marks the tab as seen without refreshing, and ignores a failure", async () => {
    respond(204, {});
    await expect(markIceCreamsSeenAction()).resolves.toBeUndefined();
    expect(call()[0]).toMatch(/\/api\/member\/ice-creams\/seen$/);
    expect(call()[1].method).toBe("POST");
    expect(mockRevalidate).not.toHaveBeenCalled();

    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("down"));
    await expect(markIceCreamsSeenAction()).resolves.toBeUndefined();
  });

  it("gives a token to the chosen friend", async () => {
    respond(201, token);
    const state = await giftIceCreamAction("i1", {}, form({ memberId: "hua" }));
    expect(call()[0]).toMatch(/\/api\/member\/ice-creams\/i1\/gift$/);
    expect(sentBody()).toEqual({ memberId: "hua" });
    expect(state.message).toBe("已送給「小華」，等對方接收（24 小時內）。");
  });

  it("runs each step on its own path and method", async () => {
    respond(201, token);
    await iceCreamStepAction("i1", "cancelRedeem");
    expect(call()[0]).toMatch(/\/i1\/redeem-request$/);
    expect(call()[1].method).toBe("DELETE");

    respond(201, token);
    await expect(redeemIceCreamAction("i1", "points")).resolves.toMatchObject({ ok: true });
    expect(sentBody()).toEqual({ method: "points" });
  });

  it("waits for the holder after a physical redemption, who confirms or disputes it", async () => {
    respond(201, { serial: 12, holder: { nickname: "小華" } });
    await expect(redeemIceCreamAction("i1", "physical")).resolves.toEqual({
      ok: true,
      message: "已請客，等「小華」驗收。",
    });

    respond(201, token);
    await expect(iceCreamStepAction("i1", "confirmPhysical")).resolves.toEqual({
      ok: true,
      message: "吃到了！冰炫風 #12功成身退。",
    });
    expect(call()[0]).toMatch(/\/i1\/confirm$/);
    expect(call()[1].method).toBe("POST");

    respond(201, token);
    await expect(iceCreamStepAction("i1", "disputePhysical")).resolves.toEqual({
      ok: true,
      message: "已退回兌換中，等對方重新請客。",
    });
    expect(call()[0]).toMatch(/\/i1\/dispute$/);
  });

  it("shows the backend's refusal, needs the box ticked to delete, and handles a lost session", async () => {
    respond(409, { message: "這支冰炫風已經退回" });
    await expect(iceCreamStepAction("i1", "accept")).resolves.toEqual({
      ok: false,
      message: "這支冰炫風已經退回",
      fields: undefined,
    });

    respond(200, token);
    await expect(deleteIceCreamAction("i1", {}, form({}))).resolves.toMatchObject({ fields: { confirm: "請先勾選確認" } });
    expect(global.fetch).not.toHaveBeenCalled();

    respond(401, {});
    await expect(createIceCreamAction()).rejects.toThrow("REDIRECT /member/login");
    respond(428, {});
    await expect(createIceCreamAction()).rejects.toThrow("REDIRECT /member");
  });

  it("claims a limited token and refreshes the shop", async () => {
    respond(201, token);
    await expect(claimIceCampaignAction("c1")).resolves.toMatchObject({ ok: true });
    expect(call()[0]).toMatch(/\/api\/member\/ice-campaigns\/c1\/claim$/);
    expect(mockRevalidate).toHaveBeenCalledWith("/shop");
  });
});

