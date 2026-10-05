import { render, screen, within } from "@testing-library/react";
import PartyDetailPage from "./page";
import PartyNotFound from "./not-found";
import PartyDetailError from "./error";
import { fetchPartyDetail } from "@/lib/public-content-client";
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
    location: "",
    coverUrl: null,
    ...overrides,
  });

  it("renders the title, metadata and the sub-parties in order with fixed-format times", async () => {
    mockedFetchPartyDetail.mockResolvedValue({
      ...party,
      subParties: [
        subParty({}),
        subParty({ id: "s2", title: "Game rounds", description: "Sessions", startDateTime: "2026-09-30T19:00:00+08:00" }),
      ],
    });

    await renderPage();

    expect(screen.getByRole("heading", { level: 1, name: "Night of Strategy" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to Party" })).toHaveAttribute("href", "/party");
    expect(screen.getByText("Red Room Studio, Taipei")).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "子活動" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "Setup and greetings",
      "Game rounds",
    ]);
    expect(screen.getAllByRole("listitem").map((li) => li.querySelector("time")?.textContent)).toEqual([
      "09/30 18:30",
      "09/30 19:00",
    ]);
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

    expect(screen.getByRole("img", { name: "Night of Strategy 封面" }).getAttribute("src")).toMatch(
      /\/media\/images\/party\.jpg$/,
    );
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

    expect(screen.queryByRole("heading", { name: "子活動" })).toBeNull();
    expect(screen.queryByRole("list")).toBeNull();
  });
});

describe("party registration block", () => {
  const openSummary = { status: "open", deadline: "2026-09-30T17:00", count: 5 } as const;
  const view = (overrides: Partial<MemberRegistrationView> = {}): MemberRegistrationView => ({
    ...openSummary,
    registered: false,
    blockedBy: null,
    participants: [
      { nickname: "小明", discordId: "ming#1", registeredAt: "2026-09-01T00:00:00Z", guest: false },
      { nickname: "小華", discordId: "hua#1", registeredAt: "2026-09-02T00:00:00Z", guest: false },
      { nickname: "朋友A", discordId: "", registeredAt: "2026-09-03T00:00:00Z", guest: true },
    ],
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
    expect(within(block()).getByRole("link", { name: "會員登入" })).toHaveAttribute("href", "/member/login");
    expect(within(block()).queryByText("小明")).toBeNull();
    expect(within(block()).queryByRole("button")).toBeNull();
  });

  it("lets a member who may register join, and lists the participants", async () => {
    mockedFetchMemberRegistration.mockResolvedValue(view());
    await renderPage();

    expect(within(block()).getByRole("button", { name: "參加" })).toBeEnabled();
    const names = within(block()).getAllByRole("listitem").map((li) => li.textContent);
    expect(names).toEqual(["小明ming#1", "小華hua#1", "朋友A非會員—"]);
  });

  it("offers to leave once registered", async () => {
    mockedFetchMemberRegistration.mockResolvedValue(view({ registered: true }));
    await renderPage();

    expect(within(block()).getByText("你已報名這個活動。")).toBeInTheDocument();
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
