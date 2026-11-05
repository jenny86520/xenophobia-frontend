const cookies: Record<string, string> = {};
const cookieStore = {
  get: jest.fn((name: string) => (name in cookies ? { value: cookies[name] } : undefined)),
  set: jest.fn(),
  delete: jest.fn(),
};
const mockRedirect = jest.fn((path: string) => {
  throw new Error(`REDIRECT ${path}`);
});
const mockRevalidate = jest.fn();
jest.mock("next/server", () => ({ connection: jest.fn().mockResolvedValue(undefined) }));
jest.mock("next/headers", () => ({
  cookies: () => Promise.resolve(cookieStore),
  headers: () => Promise.resolve(new Headers()),
}));
jest.mock("next/navigation", () => ({ redirect: (path: string) => mockRedirect(path) }));
jest.mock("next/cache", () => ({ revalidatePath: (path: string) => mockRevalidate(path) }));

import {
  cancelMatchAction,
  captainBanAction,
  managerBanAction,
  vetoResetAction,
  vetoStartAction,
  vetoUndoAction,
  matchResultAction,
  serverAbortAction,
  serverStartAction,
  confirmTeamsAction,
  createMatchAction,
  importPartyAction,
  inviteFriendAction,
  joinGroupAction,
  removePlayerAction,
  signUpAction,
  unconfirmTeamsAction,
  unlockAction,
} from "./actions";

function respond(status: number, body: unknown = {}) {
  global.fetch = jest.fn().mockResolvedValue({
    status,
    ok: status >= 200 && status < 300,
    json: () => Promise.resolve(body),
  }) as unknown as typeof fetch;
}

const call = (i = 0) => (global.fetch as jest.Mock).mock.calls[i] as [string, RequestInit];
const sentBody = () => JSON.parse(String(call()[1].body)) as unknown;
const sentToken = () => new Headers(call()[1].headers).get("Authorization");

const form = (values: Record<string, string>) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
};

beforeEach(() => {
  jest.clearAllMocks();
  for (const key of Object.keys(cookies)) delete cookies[key];
});

describe("signing up", () => {
  it("signs up as the member when one is signed in, else as the Steam guest", async () => {
    cookies.xpa_member = "member-jwt";
    cookies.xpa_player = "guest-jwt";
    respond(201);
    await expect(signUpAction("m1", "group")).resolves.toMatchObject({ ok: true });
    expect(call()[0]).toBe("http://localhost:3001/api/matches/m1/entries");
    expect(sentBody()).toEqual({ mode: "group" });
    expect(sentToken()).toBe("Bearer member-jwt");
    expect(mockRevalidate).toHaveBeenCalledWith("/matches/m1");

    delete cookies.xpa_member;
    respond(201);
    await signUpAction("m1", "solo");
    expect(sentToken()).toBe("Bearer guest-jwt");
  });

  it("takes a member who must agree to renewed terms to the member page", async () => {
    cookies.xpa_member = "member-jwt";
    respond(428, { statusCode: 428, message: "條款已更新，請先到會員專區閱讀並同意新版條款" });
    await expect(signUpAction("m1", "solo")).rejects.toThrow("REDIRECT /member");
    expect(cookieStore.delete).not.toHaveBeenCalled();
    delete cookies.xpa_member;
  });

  it("asks to sign in when nobody is", async () => {
    respond(201);
    await expect(signUpAction("m1", "solo")).resolves.toMatchObject({ ok: false });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("shows the backend's reason and field errors", async () => {
    cookies.xpa_player = "guest-jwt";
    respond(400, { message: "找不到這個邀請碼", fields: { code: "找不到這個邀請碼，請確認後再輸入" } });
    await expect(joinGroupAction("m1", {}, form({ code: "abc" }))).resolves.toEqual({
      ok: false,
      message: "找不到這個邀請碼",
      fields: { code: "找不到這個邀請碼，請確認後再輸入" },
      values: { code: "abc" },
    });
    expect(sentBody()).toEqual({ code: "abc" });
  });

  it("clears the refused cookie: the guest's goes to /player, the member's to the login", async () => {
    cookies.xpa_player = "guest-jwt";
    respond(401);
    await expect(signUpAction("m1", "solo")).rejects.toThrow("REDIRECT /player");
    expect(cookieStore.delete).toHaveBeenCalledWith("xpa_player");

    cookies.xpa_member = "member-jwt";
    respond(401);
    await expect(signUpAction("m1", "solo")).rejects.toThrow("REDIRECT /member/login");
    expect(cookieStore.delete).toHaveBeenCalledWith("xpa_member");
  });
});

describe("managing", () => {
  beforeEach(() => {
    cookies.xpa_member = "member-jwt";
  });

  it("creates a match and opens it", async () => {
    respond(201, { id: "new-id" });
    await expect(createMatchAction({}, form({ title: "週五晚場", partyId: "" }))).rejects.toThrow(
      "REDIRECT /matches/new-id",
    );
    expect(sentBody()).toEqual({ title: "週五晚場" });
  });

  it("reports what an import added and skipped", async () => {
    respond(200, { imported: { added: 1, skippedNoSteam: 2, skippedFull: 3 } });
    await expect(importPartyAction("m1")).resolves.toEqual({
      ok: true,
      message: "已帶入 1 人；未綁定 Steam 略過 2 人，名額已滿略過 3 人。",
    });
    expect(call()[0]).toBe("http://localhost:3001/api/matches/m1/manage/import-party");
  });

  it("needs the box ticked before unlocking, taking teams back, cancelling or removing", async () => {
    respond(200);
    for (const result of [
      await unlockAction("m1", {}, form({})),
      await unconfirmTeamsAction("m1", {}, form({})),
      await cancelMatchAction("m1", {}, form({})),
      await removePlayerAction("m1", {}, form({ playerId: "p1" })),
    ]) {
      expect(result.fields).toHaveProperty("confirm");
    }
    expect(global.fetch).not.toHaveBeenCalled();

    await removePlayerAction("m1", {}, form({ playerId: "p1", confirm: "on" }));
    expect(call()[0]).toBe("http://localhost:3001/api/matches/m1/manage/players/p1");
    expect(call()[1].method).toBe("DELETE");

    const back = await unconfirmTeamsAction("m1", {}, form({ confirm: "on" }));
    expect(call(1)[0]).toBe("http://localhost:3001/api/matches/m1/manage/teams/unconfirm");
    expect(call(1)[1].method).toBe("POST");
    expect(back.message).toBe("已退回分隊，請重新選擇候選並確認。");
  });

  it("sends the chosen teams, captains and the split permission", async () => {
    respond(200);
    await confirmTeamsAction(
      "m1",
      {},
      form({
        "team-p1": "A",
        "team-p2": "B",
        "team-p3": "A",
        captainA: "p1",
        captainB: "p2",
        allowSplit: "on",
      }),
    );
    expect(sentBody()).toEqual({
      teamA: ["p1", "p3"],
      teamB: ["p2"],
      captainA: "p1",
      captainB: "p2",
      allowSplit: true,
    });
  });

  it("hands back what was chosen when the backend refuses the teams", async () => {
    respond(400, {
      message: "分隊不符合規則，請查看標示的欄位",
      fields: { allowSplit: "這樣分隊會拆開同一小隊，請確認允許拆開小隊" },
    });
    const result = await confirmTeamsAction(
      "m1",
      {},
      form({ "team-p1": "B", "team-p2": "A", captainA: "p2", captainB: "p1" }),
    );
    expect(result).toMatchObject({
      ok: false,
      fields: { allowSplit: "這樣分隊會拆開同一小隊，請確認允許拆開小隊" },
      values: { "team-p1": "B", "team-p2": "A", captainA: "p2", captainB: "p1" },
    });
  });
});

describe("the map veto", () => {
  it("sends a captain's ban with the step their page showed", async () => {
    cookies.xpa_player = "guest-jwt";
    respond(200);
    await expect(captainBanAction("m1", 3, "de_mirage")).resolves.toMatchObject({ ok: true });
    expect(call()[0]).toBe("http://localhost:3001/api/matches/m1/veto/bans");
    expect(sentBody()).toEqual({ step: 3, mapKey: "de_mirage" });
    expect(sentToken()).toBe("Bearer guest-jwt");
  });

  it("starts the veto with the rule and step time, and bans for a team by map or at random", async () => {
    cookies.xpa_member = "member-jwt";
    respond(200);
    await vetoStartAction("m1", {}, form({ rule: "weaker_first", stepSeconds: "45" }));
    expect(call()[0]).toBe("http://localhost:3001/api/matches/m1/manage/veto/start");
    expect(sentBody()).toEqual({ rule: "weaker_first", stepSeconds: 45 });

    respond(200);
    await managerBanAction("m1", 2, {}, form({ intent: "random", mapKey: "" }));
    expect(sentBody()).toEqual({ step: 2, random: true });

    respond(200);
    await managerBanAction("m1", 2, {}, form({ intent: "map", mapKey: "de_nuke" }));
    expect(sentBody()).toEqual({ step: 2, mapKey: "de_nuke" });

    respond(200);
    await expect(managerBanAction("m1", 2, {}, form({ intent: "map", mapKey: "" }))).resolves.toMatchObject({
      fields: { mapKey: "請選擇地圖" },
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("needs the box ticked before undoing or resetting", async () => {
    cookies.xpa_member = "member-jwt";
    respond(200);
    expect((await vetoUndoAction("m1", {}, form({}))).fields).toHaveProperty("confirm");
    expect((await vetoResetAction("m1", {}, form({}))).fields).toHaveProperty("confirm");
    expect(global.fetch).not.toHaveBeenCalled();
    await vetoResetAction("m1", {}, form({ confirm: "on" }));
    expect(call()[0]).toBe("http://localhost:3001/api/matches/m1/manage/veto/reset");
  });
});

describe("inviting a friend", () => {
  it("posts the friend and the kind as the member", async () => {
    cookies.xpa_member = "member-jwt";
    respond(201, {});
    await expect(inviteFriendAction("m1", "f1", "group")).resolves.toEqual({ ok: true, message: "已邀請進小隊。" });
    expect(call()[0]).toBe("http://localhost:3001/api/matches/m1/invites");
    expect(sentBody()).toEqual({ memberId: "f1", kind: "group" });
    expect(sentToken()).toBe("Bearer member-jwt");
    expect(mockRevalidate).toHaveBeenCalledWith("/matches/m1");
  });

  it("shows the backend's reason, and sends a refused member to sign in again", async () => {
    cookies.xpa_member = "member-jwt";
    respond(409, { message: "請先以小隊報名這一場" });
    await expect(inviteFriendAction("m1", "f1", "group")).resolves.toMatchObject({
      ok: false,
      message: "請先以小隊報名這一場",
    });

    respond(401);
    await expect(inviteFriendAction("m1", "f1", "signup")).rejects.toThrow("REDIRECT /member/login");
    expect(cookieStore.delete).toHaveBeenCalledWith("xpa_member");
  });
});

describe("the game server", () => {
  beforeEach(() => {
    cookies.xpa_member = "member-jwt";
  });

  it("starts on the chosen server, and asks for one when none is chosen", async () => {
    respond(200);
    await expect(serverStartAction("m1", {}, form({}))).resolves.toMatchObject({ fields: { serverId: "請選擇伺服器" } });
    expect(global.fetch).not.toHaveBeenCalled();
    await expect(serverStartAction("m1", {}, form({ serverId: "srv1" }))).resolves.toMatchObject({ ok: true });
    expect(call()[0]).toBe("http://localhost:3001/api/matches/m1/manage/server/start");
    expect(sentBody()).toEqual({ serverId: "srv1" });
  });

  it("needs the box ticked to abort or to type in a score, then sends the scores", async () => {
    respond(200);
    expect((await serverAbortAction("m1", {}, form({}))).fields).toHaveProperty("confirm");
    const refused = await matchResultAction("m1", {}, form({ scoreA: "16", scoreB: "14" }));
    expect(refused.fields).toHaveProperty("confirm");
    expect(refused.values).toMatchObject({ scoreA: "16", scoreB: "14" });
    expect(global.fetch).not.toHaveBeenCalled();

    await matchResultAction("m1", {}, form({ scoreA: "16", scoreB: "14", confirm: "on" }));
    expect(call()[0]).toBe("http://localhost:3001/api/matches/m1/manage/result");
    expect(sentBody()).toEqual({ scoreA: 16, scoreB: 14 });
  });

  it("keeps the scores and shows the field error from the backend", async () => {
    respond(400, { message: ["比分需為 0 到 99 的整數"], fields: { scoreB: "比分需為 0 到 99 的整數" } });
    const result = await matchResultAction("m1", {}, form({ scoreA: "1", scoreB: "120", confirm: "on" }));
    expect(result).toMatchObject({ ok: false, fields: { scoreB: "比分需為 0 到 99 的整數" } });
    expect(result.values?.scoreB).toBe("120");
  });
});
