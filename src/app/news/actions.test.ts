const mockMemberFetch = jest.fn();
const mockRedirect = jest.fn();

jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("next/navigation", () => ({ redirect: (path: string) => mockRedirect(path) }));
jest.mock("@/lib/member-session", () => ({
  memberFetch: (path: string, init: RequestInit) => mockMemberFetch(path, init),
}));

import { acknowledgeNewsAction } from "./actions";

function popupForm(next?: string): FormData {
  const form = new FormData();
  form.append("ids", "n1");
  form.append("ids", "n2");
  if (next !== undefined) form.append("next", next);
  return form;
}

describe("acknowledgeNewsAction", () => {
  beforeEach(() => {
    mockMemberFetch.mockReset().mockResolvedValue({ ok: true, status: 204 });
    mockRedirect.mockReset();
  });

  it("marks every message in the popup read, then follows a site path", async () => {
    await acknowledgeNewsAction(popupForm("/shop#shelf-tasks"));
    expect(mockMemberFetch).toHaveBeenCalledWith("/api/member/news/read", {
      method: "POST",
      body: JSON.stringify({ ids: ["n1", "n2"] }),
    });
    expect(mockRedirect).toHaveBeenCalledWith("/shop#shelf-tasks");
  });

  it("still opens a message's page", async () => {
    await acknowledgeNewsAction(popupForm("/news/n1"));
    expect(mockRedirect).toHaveBeenCalledWith("/news/n1");
  });

  it("marks read but never leaves the site for a tampered target", async () => {
    for (const next of ["https://evil.example", "//evil.example", "/\\evil.example"]) {
      await acknowledgeNewsAction(popupForm(next));
    }
    expect(mockMemberFetch).toHaveBeenCalledTimes(3);
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("stays put for 知道了", async () => {
    await acknowledgeNewsAction(popupForm());
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});
