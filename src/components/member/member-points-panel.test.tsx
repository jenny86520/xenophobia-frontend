import { render, screen, within } from "@testing-library/react";
import type { MemberPoints } from "@/types/member";
import { MemberPointsPanel } from "./member-points-panel";

jest.mock("@/app/member/actions", () => ({ checkInAction: jest.fn(), claimQuestAction: jest.fn() }));

const entry = { id: "e1", amount: 1, kind: "checkin", createdAt: "2026-11-09T01:00:00.000Z" };

function points(overrides: Partial<MemberPoints> = {}): MemberPoints {
  return {
    balance: 12,
    checkedInToday: false,
    campaign: null,
    entries: { items: [entry], total: 1, page: 1, pageSize: 20 },
    ...overrides,
  };
}

const campaign = { id: "c1", title: "十一月連續簽到", endDate: "2026-11-30", requiredDays: 7, streak: 3 };

describe("MemberPointsPanel", () => {
  it("shows the balance, the check-in and the shop without a campaign", () => {
    const { container } = render(<MemberPointsPanel points={points()} />);

    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "簽到 +1" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "點數商店" })).toHaveAttribute("href", "/shop");
    expect(container.querySelector("#stamp-card")).toBeNull();
    expect(screen.queryByRole("button", { name: "「簽到規則」說明" })).toBeNull();
    expect(container.querySelector("progress")).toBeNull();
  });

  it("lists the newbie quests between the check-in and the shop link", () => {
    render(
      <MemberPointsPanel
        points={points()}
        quests={[{ code: "checkin", title: "第一次簽到", description: "簽到一次", points: 1, state: "claimable" }]}
      />,
    );
    const heading = screen.getByRole("heading", { name: "新手任務" });
    expect(heading.compareDocumentPosition(screen.getByRole("link", { name: "點數商店" }))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(screen.getByRole("button", { name: "領取" })).toBeInTheDocument();
  });

  it("shows the running campaign with its rules and stamp card", () => {
    const { container } = render(<MemberPointsPanel points={points({ campaign })} />);

    expect(screen.getByRole("heading", { name: "十一月連續簽到" })).toBeInTheDocument();
    expect(screen.getByText("簽到活動・2026/11/30 結束")).toBeInTheDocument();
    expect(container.querySelectorAll("#stamp-card li")).toHaveLength(7);
    expect(screen.getByText("3 / 7 天・再 4 天 +1")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "「簽到規則」說明" })).toBeInTheDocument();
    const rules = within(screen.getByRole("dialog", { hidden: true }));
    expect(rules.getByText("每天（台灣時間）可以簽到一次，每次獲得 1 點。")).toBeInTheDocument();
    expect(rules.getByText(/連續簽到滿 7 天，另外獲得 1 點，然後重新計算；漏簽一天也會重新計算/)).toBeInTheDocument();
  });

  it("keeps the stamp card's page in the ledger links", () => {
    const entries = { items: [entry], total: 45, page: 2, pageSize: 20 };
    render(<MemberPointsPanel points={points({ campaign: { ...campaign, requiredDays: 60 }, entries })} card={4} />);

    expect(screen.getByRole("link", { name: "較新的紀錄" })).toHaveAttribute("href", "/member?tab=points&card=4");
    expect(screen.getByRole("link", { name: "較早的紀錄" })).toHaveAttribute("href", "/member?tab=points&page=3&card=4");
    expect(screen.getByRole("navigation", { name: "集點卡分頁" })).toHaveTextContent("第 4 / 6 張");
  });
});
