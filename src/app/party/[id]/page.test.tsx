import { render, screen, within } from "@testing-library/react";
import PartyDetailPage from "./page";
import PartyNotFound from "./not-found";
import PartyDetailError from "./error";
import { fetchMatches, fetchPartyDetail } from "@/lib/public-content-client";
import { fetchMemberRegistration } from "@/lib/member-session";
import type { MemberRegistrationView } from "@/types/member";

const NOT_FOUND = new Error("NEXT_NOT_FOUND");
jest.mock("next/navigation", () => ({
  notFound: () => {
    throw NOT_FOUND;
  },
}));

jest.mock("@/lib/public-content-client", () => ({
  fetchPartyDetail: jest.fn(),
  fetchMatches: jest.fn(() => Promise.resolve({ items: [], total: 0, page: 1, pageSize: 50 })),
}));

jest.mock("@/lib/member-session", () => ({ fetchMemberRegistration: jest.fn() }));
// The 參加 button posts to a Server Action; the page only needs it to exist.
jest.mock("@/app/member/actions", () => ({ registrationAction: jest.fn() }));

const mockedFetchPartyDetail = fetchPartyDetail as jest.Mock;
const mockedFetchMemberRegistration = fetchMemberRegistration as jest.Mock;

const party = {
  id: "1",
  title: "Night of Strategy",
  description: "A tabletop evening.",
  summary: "Strategy night.",
  category: "games",
  format: "offline",
  status: "active",
  startDate: "2026-09-30",
  startTime: "18:30",
  endDate: "",
  endTime: "",
  isPublic: true,
  location: "Red Room Studio, Taipei",
  createdBy: "Admin Team",
  createdAt: "2026-10-01",
};

const renderPage = async (id = "1") =>
  render(await PartyDetailPage({ params: Promise.resolve({ id }), searchParams: Promise.resolve({}) }));

describe("PartyDetailPage", () => {
  beforeEach(() => {
    mockedFetchPartyDetail.mockReset();
    mockedFetchMemberRegistration.mockReset().mockResolvedValue(null);
  });

  it("calls notFound() when the party does not exist", async () => {
    mockedFetchPartyDetail.mockResolvedValue(null);
    await expect(renderPage("missing")).rejects.toBe(NOT_FOUND);
  });

  it("lets a backend failure reach the error boundary", async () => {
    mockedFetchPartyDetail.mockRejectedValue(new Error("HTTP 500"));
    await expect(renderPage()).rejects.toThrow("HTTP 500");
  });

  const subParty = (overrides: Record<string, unknown>) => ({
    id: "s1",
    title: "Setup and greetings",
    description: "Check-in",
    startDateTime: "2026-09-30T18:30:00+08:00",
    endDateTime: "",
    location: "",
    coverUrl: null,
    ...overrides,
  });

  it("renders the title, metadata and the sub-parties in order with fixed-format times", async () => {
    mockedFetchPartyDetail.mockResolvedValue({
      ...party,
      subParties: [
        subParty({}),
        subParty({
          id: "s2",
          title: "Game rounds",
          description: "Sessions",
          startDateTime: "2026-09-30T19:00:00+08:00",
        }),
      ],
    });

    await renderPage();

    expect(screen.getByRole("heading", { level: 1, name: "Night of Strategy" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to Party" })).toHaveAttribute("href", "/party");
    expect(screen.getByText("Red Room Studio, Taipei")).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "子派對" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "Setup and greetings",
      "Game rounds",
    ]);
    // The day is a small label above, the time of day is large; the full range is read out once.
    expect(screen.getAllByRole("listitem").map((li) => li.querySelector("time")?.textContent)).toEqual([
      "18:30",
      "19:00",
    ]);
    expect(screen.getAllByRole("listitem").map((li) => li.querySelector(".sr-only")?.textContent)).toEqual([
      "09/30 18:30",
      "09/30 19:00",
    ]);
  });

  it("puts a decorative icon before every metadata label and each sub-party time and address", async () => {
    mockedFetchPartyDetail.mockResolvedValue({
      ...party,
      subParties: [subParty({ location: "台北市信義區" })],
    });

    const { container } = await renderPage();

    const terms = Array.from(container.querySelectorAll("dt"));
    expect(terms.map((dt) => dt.textContent)).toEqual([
      "Location",
      "Date",
      "Time",
      "Type",
      "Created_by",
      "Updated_by",
    ]);
    for (const dt of terms) expect(dt.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    const [sub] = screen.getAllByRole("listitem");
    expect(sub.querySelectorAll('svg[aria-hidden="true"]')).toHaveLength(2);
    expect(sub).toHaveTextContent("Where台北市信義區");
  });

  it("shows the party cover with its alt text, and a sub-party's address and cover only when set", async () => {
    mockedFetchPartyDetail.mockResolvedValue({
      ...party,
      coverUrl: "/media/images/party.jpg",
      subParties: [
        subParty({ location: "台北市信義區", coverUrl: "/media/images/sub.png" }),
        subParty({ id: "s2", title: "Game rounds" }),
      ],
    });

    await renderPage();

    const cover = screen.getByRole("img", { name: "Night of Strategy 封面" });
    expect(cover.getAttribute("src")).toMatch(/\/media\/images\/party\.jpg$/);
    // Unveils on scroll inside a clipping frame (spec 品牌特效).
    expect(cover).toHaveClass("media-reveal");
    expect(cover.parentElement).toHaveClass("overflow-clip");
    const [withExtras, plain] = screen.getAllByRole("listitem");
    expect(withExtras).toHaveTextContent("台北市信義區");
    expect(withExtras.querySelector("img")).toHaveAttribute("alt", "Setup and greetings 封面");
    expect(plain).not.toHaveTextContent("Where");
    expect(plain.querySelector("img")).toBeNull();
  });

  it("has no cover image when the party has none", async () => {
    mockedFetchPartyDetail.mockResolvedValue({ ...party, coverUrl: null, subParties: [] });

    await renderPage();

    expect(screen.queryByRole("img")).toBeNull();
  });

  it("omits the sub-party section when there are none", async () => {
    mockedFetchPartyDetail.mockResolvedValue({ ...party, coverUrl: null, subParties: [] });

    await renderPage();

    expect(screen.queryByRole("heading", { name: "子派對" })).toBeNull();
    expect(screen.queryByRole("list")).toBeNull();
  });
});

describe("party registration block", () => {
  const openSummary = { status: "open", deadline: "2026-09-30T17:00", count: 5, paused: false } as const;
  const view = (overrides: Partial<MemberRegistrationView> = {}): MemberRegistrationView => ({
    ...openSummary,
    registered: false,
    blockedBy: null,
    participants: [
      { nickname: "小明", discordId: "ming#1", registeredAt: "2026-09-01T00:00:00Z", guest: false },
      { nickname: "小華", discordId: "hua#1", registeredAt: "2026-09-02T00:00:00Z", guest: false },
      { nickname: "朋友A", discordId: "", registeredAt: "2026-09-03T00:00:00Z", guest: true },
    ],
    subParties: [],
    ...overrides,
  });
  const block = () => screen.getByRole("region", { name: "報名" });

  beforeEach(() => {
    mockedFetchPartyDetail.mockReset().mockResolvedValue({ ...party, subParties: [], registration: openSummary });
    mockedFetchMemberRegistration.mockReset().mockResolvedValue(null);
  });

  it("shows a visitor the count and how to register, but no names", async () => {
    await renderPage();

    expect(block()).toHaveTextContent("開放報名中");
    expect(block()).toHaveTextContent("5 人參加");
    expect(block()).toHaveTextContent("截止：09/30 17:00（台灣時間）");
    expect(within(block()).getByRole("link", { name: "登入會員" })).toHaveAttribute("href", "/member/login");
    expect(within(block()).queryByText("小明")).toBeNull();
    expect(within(block()).queryByRole("button")).toBeNull();
  });

  it("lets a member who may register join, and lists the participants", async () => {
    mockedFetchMemberRegistration.mockResolvedValue(view());
    await renderPage();

    // Right side: the button shares the status row (under the eyebrow), before the count.
    const topRow = within(block()).getByText("開放報名中").closest("p")?.parentElement as HTMLElement;
    expect(within(topRow).getByRole("button", { name: "參加" })).toBeInTheDocument();
    expect(topRow).toHaveTextContent("開放報名中");
    expect(topRow).not.toHaveTextContent("人參加");

    expect(within(block()).getByRole("button", { name: "參加" })).toBeEnabled();
    const names = within(block())
      .getAllByRole("listitem")
      .map((li) => li.textContent);
    expect(names).toEqual(["小明ming#1", "小華hua#1", "朋友A非會員—"]);
  });

  it("makes 「N 人參加」 open the participant list for members, and plain text for visitors", async () => {
    await renderPage();
    expect(within(block()).getByText("5 人參加").closest("summary")).toBeNull();
    expect(within(block()).queryByText(/參加者（/)).toBeNull();

    mockedFetchMemberRegistration.mockResolvedValue(view());
    await renderPage();
    const latest = screen.getAllByRole("region", { name: "報名" }).at(-1) as HTMLElement;
    const summary = within(latest).getByText("5 人參加").closest("summary") as HTMLElement;
    expect(summary).not.toBeNull();
    const list = within(latest).getByRole("list", { name: "5 人參加" });
    expect(summary.closest("details")).toContainElement(list);
    expect(within(latest).queryByText(/參加者（/)).toBeNull();
  });

  it("offers to leave once registered", async () => {
    mockedFetchMemberRegistration.mockResolvedValue(view({ registered: true }));
    await renderPage();

    expect(within(block()).getByText("已報名")).toBeInTheDocument();
    expect(within(block()).getByRole("button", { name: "取消參加" })).toBeEnabled();
  });

  it("disables the button and says why when closed or the role does not fit", async () => {
    mockedFetchMemberRegistration.mockResolvedValue(view({ status: "closed", blockedBy: "closed" }));
    await renderPage();
    expect(within(block()).getByRole("button", { name: "參加" })).toBeDisabled();
    expect(within(block()).getAllByText("報名已截止").length).toBeGreaterThan(0);

    mockedFetchMemberRegistration.mockResolvedValue(view({ blockedBy: "role-not-allowed" }));
    await renderPage();
    expect(screen.getAllByRole("region", { name: "報名" }).at(-1)).toHaveTextContent("此活動限定特定角色報名");
  });
  it("tells a visitor registration is paused instead of offering to sign in", async () => {
    mockedFetchPartyDetail.mockResolvedValue({
      ...party,
      subParties: [],
      registration: { ...openSummary, paused: true },
    });
    await renderPage();

    expect(block()).toHaveTextContent("活動報名目前暫停");
    expect(block()).not.toHaveTextContent("開放報名中");
    expect(within(block()).queryByRole("link", { name: "登入會員" })).toBeNull();
  });

  it("disables 參加 while paused but lets a registered member leave", async () => {
    mockedFetchMemberRegistration.mockResolvedValue(view({ paused: true, blockedBy: "paused" }));
    await renderPage();
    expect(within(block()).getByRole("button", { name: "參加" })).toBeDisabled();
    expect(within(block()).getAllByText("活動報名目前暫停").length).toBeGreaterThan(0);

    mockedFetchMemberRegistration.mockResolvedValue(view({ paused: true, registered: true }));
    await renderPage();
    const latest = screen.getAllByRole("region", { name: "報名" }).at(-1) as HTMLElement;
    expect(latest).toHaveTextContent("活動報名目前暫停");
    expect(within(latest).getByRole("button", { name: "取消參加" })).toBeEnabled();
  });
});

describe("sub-party registration", () => {
  const openSummary = { status: "open", deadline: null, count: 3, paused: false } as const;
  const subParty = {
    id: "s1",
    title: "After party",
    description: "Late games",
    startDateTime: "2026-09-30T22:00:00+08:00",
    endDateTime: "2026-10-01T01:00:00+08:00",
    location: "",
    coverUrl: null,
    registration: { ...openSummary, count: 1 },
  };
  const memberView = (overrides: Partial<MemberRegistrationView> = {}): MemberRegistrationView => ({
    ...openSummary,
    registered: false,
    blockedBy: null,
    participants: [],
    subParties: [
      {
        subPartyId: "s1",
        count: 1,
        registered: false,
        blockedBy: "main-required",
        participants: [{ nickname: "小華", discordId: "hua#1", registeredAt: "2026-09-02T00:00:00Z", guest: false }],
      },
    ],
    ...overrides,
  });
  const subRow = () => screen.getByRole("heading", { level: 3, name: "After party" }).closest("li") as HTMLElement;

  beforeEach(() => {
    mockedFetchPartyDetail.mockReset().mockResolvedValue({ ...party, subParties: [subParty], registration: openSummary });
    mockedFetchMemberRegistration.mockReset().mockResolvedValue(null);
  });

  it("puts the party's registration beside its title and each sub-party's at the end of its row", async () => {
    await renderPage();

    // Third column of the top grid: same grid as the title, no separate registration section.
    const titleGrid = screen.getByRole("heading", { level: 1, name: "Night of Strategy" }).closest("header")
      ?.parentElement as HTMLElement;
    expect(within(titleGrid).getByRole("region", { name: "報名" })).toBeInTheDocument();
    expect(screen.getAllByRole("region", { name: "報名" })).toHaveLength(1);

    const row = subRow();
    const columns = Array.from(row.children);
    expect(columns).toHaveLength(3);
    expect(columns[2]).toHaveTextContent("1 人參加");
    expect(columns[1]).not.toHaveTextContent("人參加");
  });

  it("shows a visitor each sub-party's own count and time range, and how to register", async () => {
    await renderPage();

    expect(subRow()).toHaveTextContent("09/30 22:00 – 10/01 01:00");
    expect(subRow()).toHaveTextContent("1 人參加");
    expect(screen.getByRole("region", { name: "報名" })).toHaveTextContent("3 人參加");
    expect(within(subRow()).getByRole("link", { name: "登入會員" })).toBeInTheDocument();
    expect(within(subRow()).queryByText("小華")).toBeNull();
  });

  it("disables a sub-party's 參加 until the member registers for the party", async () => {
    mockedFetchMemberRegistration.mockResolvedValue(memberView());
    await renderPage();

    const join = within(subRow()).getByRole("button", { name: "參加" });
    expect(join).toBeDisabled();
    expect(join).toHaveAccessibleDescription("請先報名主派對");
    expect(within(screen.getByRole("region", { name: "報名" })).getByRole("button", { name: "參加" })).toBeEnabled();
    expect(within(subRow()).getByText("小華")).toBeInTheDocument();
  });

  it("lets a registered member leave a sub-party and warns that leaving the party leaves it too", async () => {
    mockedFetchMemberRegistration.mockResolvedValue(
      memberView({
        registered: true,
        subParties: [{ subPartyId: "s1", count: 2, registered: true, blockedBy: null, participants: [] }],
      }),
    );
    await renderPage();

    expect(within(subRow()).getByText("已報名")).toBeInTheDocument();
    expect(within(subRow()).getByRole("button", { name: "取消參加" })).toBeEnabled();
    expect(subRow()).toHaveTextContent("2 人參加");
    const block = screen.getByRole("region", { name: "報名" });
    // Behind an ⓘ beside 取消參加, not as a sentence in the column.
    const info = within(block).getByRole("button", { name: "「取消參加會一併取消子派對」說明" });
    expect(info).toHaveAttribute("popovertarget", "leave-sub-parties");
    expect(document.getElementById("leave-sub-parties")).toHaveTextContent("取消參加時，會一併取消你報名的 1 個子派對。");
    expect(within(block).queryByRole("heading", { name: "報名" })).toBeNull();
  });
});

describe("undecided times and members-only parties", () => {
  beforeEach(() => {
    mockedFetchPartyDetail.mockReset();
    mockedFetchMemberRegistration.mockReset().mockResolvedValue(null);
  });

  it("says 待定 for an undecided party and 時間待定 for a date without a time", async () => {
    mockedFetchPartyDetail.mockResolvedValue({ ...party, startDate: "", startTime: "", subParties: [] });
    await renderPage();
    const dates = screen.getAllByText("待定");
    // The oversized date and the Date and Time rows of the metadata table.
    expect(dates.length).toBeGreaterThanOrEqual(3);

    mockedFetchPartyDetail.mockResolvedValue({
      ...party,
      startTime: "",
      subParties: [
        {
          id: "s1",
          title: "Some day",
          description: "",
          startDateTime: "2026-09-30",
          endDateTime: "",
          location: "",
          coverUrl: null,
        },
      ],
    });
    await renderPage();
    expect(screen.getAllByText("時間待定").length).toBeGreaterThan(0);
    expect(screen.getByText("09/30（時間待定）")).toBeInTheDocument();
  });

  it("shows members a members-only party with its badge", async () => {
    mockedFetchPartyDetail.mockResolvedValue({ ...party, isPublic: false, subParties: [] });
    await renderPage();
    expect(screen.getByText("會員限定")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Night of Strategy" })).toBeInTheDocument();
  });

  it("shows a visitor only the members-only notice and a sign-in link", async () => {
    mockedFetchPartyDetail.mockResolvedValue({ membersOnly: true });
    const { container } = await renderPage("secret");

    expect(screen.getByRole("heading", { level: 1, name: "此活動僅限會員查看" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "會員登入" })).toHaveAttribute("href", "/member/login");
    expect(container).not.toHaveTextContent("Night of Strategy");
    expect(fetchMatches).not.toHaveBeenCalledWith("secret");
  });
});

describe("party detail fallbacks", () => {
  it("not-found shows the message with a link back to the list", () => {
    render(<PartyNotFound />);
    expect(screen.getByText("Party not found.")).toBeInTheDocument();
    const back = screen.getByRole("link", { name: "Back to Party" });
    expect(back).toHaveAttribute("href", "/party");
    expect(back).toHaveAttribute("lang", "en");
  });

  it("error shows the message with a link back to the list", () => {
    render(<PartyDetailError error={new Error("x")} reset={() => {}} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Failed to load this party.");
    const back = screen.getByRole("link", { name: "Back to Party" });
    expect(back).toHaveAttribute("href", "/party");
    expect(back).toHaveAttribute("lang", "en");
  });
});

describe("party matches block", () => {
  it("lists the party's scrim matches only when there are some", async () => {
    mockedFetchPartyDetail.mockResolvedValue(party);
    (fetchMemberRegistration as jest.Mock).mockResolvedValue(null);
    await renderPage();
    expect(screen.queryByRole("heading", { name: "內戰場次" })).not.toBeInTheDocument();

    (fetchMatches as jest.Mock).mockResolvedValueOnce({
      items: [
        {
          id: "m1",
          title: "第一場",
          status: "lobby",
          game: { id: "cs2", name: "CS2" },
          party: { id: "1", title: party.title },
          playerCount: 7,
          capacity: 10,
          createdAt: "2026-10-25T00:00:00.000Z",
          createdBy: "管理員",
        },
      ],
      total: 1,
      page: 1,
      pageSize: 50,
    });
    await renderPage();
    expect(fetchMatches).toHaveBeenLastCalledWith("1");
    expect(screen.getByRole("heading", { name: "內戰場次" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /第一場/ })).toHaveAttribute("href", "/matches/m1");
    expect(screen.getByText("管理員・2026/10/25 08:00")).toBeInTheDocument();
    expect(screen.getByText("7 / 10").querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("報名中")).toBeInTheDocument();
  });

  it("puts the sub-parties before the scrim matches", async () => {
    mockedFetchPartyDetail.mockResolvedValue({
      ...party,
      subParties: [
        { id: "s1", title: "Opening", description: "", startDateTime: "", endDateTime: "", location: "", coverUrl: null },
      ],
    });
    (fetchMemberRegistration as jest.Mock).mockResolvedValue(null);
    (fetchMatches as jest.Mock).mockResolvedValueOnce({
      items: [
        {
          id: "m1",
          title: "第一場",
          status: "lobby",
          game: { id: "cs2", name: "CS2" },
          party: { id: "1", title: party.title },
          playerCount: 7,
          capacity: 10,
          createdAt: "2026-10-25T00:00:00.000Z",
          createdBy: "管理員",
        },
      ],
      total: 1,
      page: 1,
      pageSize: 50,
    });
    await renderPage();

    const headings = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(headings.indexOf("子派對")).toBeLessThan(headings.indexOf("內戰場次"));
  });
});
