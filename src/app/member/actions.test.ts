const cookieStore = { get: jest.fn(), set: jest.fn(), delete: jest.fn() };
const mockRedirect = jest.fn((path: string) => {
  throw new Error(`REDIRECT ${path}`);
});
const mockRevalidate = jest.fn();
// connection() in public-content-client needs a Next request scope (and the Request global jsdom lacks).
jest.mock("next/server", () => ({ connection: jest.fn().mockResolvedValue(undefined) }));
jest.mock("next/headers", () => ({ cookies: () => Promise.resolve(cookieStore) }));
jest.mock("next/navigation", () => ({ redirect: (path: string) => mockRedirect(path) }));
jest.mock("next/cache", () => ({ revalidatePath: (path: string) => mockRevalidate(path) }));

import {
  loginAction,
  registerAction,
  registrationAction,
  requestResetAction,
  setPasswordAction,
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
