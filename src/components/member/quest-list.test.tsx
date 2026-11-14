import { render, screen, within } from "@testing-library/react";
import type { Quest } from "@/types/quest";
import { QuestList } from "./quest-list";

jest.mock("@/app/member/actions", () => ({ claimQuestAction: jest.fn() }));

const quest = (code: string, title: string, state: Quest["state"], points = 1): Quest => ({
  code,
  title,
  description: `${title}的說明`,
  points,
  state,
});

const row = (container: HTMLElement, code: string) =>
  within(container.querySelector<HTMLElement>(`[data-quest="${code}"]`)!);

describe("QuestList", () => {
  it("offers to claim, to go and do it, or says it is claimed", () => {
    const { container } = render(
      <QuestList
        quests={[
          quest("steam", "綁定 Steam", "claimable", 2),
          quest("friend", "交到第一位好友", "todo"),
          quest("checkin", "第一次簽到", "claimed"),
        ]}
      />,
    );

    expect(screen.getByRole("heading", { name: "新手任務" })).toBeInTheDocument();
    expect(row(container, "steam").getByText("+2 點")).toBeInTheDocument();
    expect(row(container, "steam").getByRole("button", { name: "領取" })).toBeInTheDocument();
    // Friends live in the sidebar, so this 去完成 opens it on the same page instead of linking away.
    const friendGoal = row(container, "friend").getByRole("button", { name: "去完成" });
    expect(friendGoal).toHaveAttribute("popovertarget", "friends-panel");
    expect(row(container, "friend").queryByRole("link")).toBeNull();
    expect(row(container, "checkin").getByText("已領取")).toBeInTheDocument();
    expect(row(container, "checkin").queryByRole("button")).toBeNull();
  });

  it("offers no link for a quest the site does not know yet", () => {
    const { container } = render(<QuestList quests={[quest("later", "未來的任務", "todo")]} />);
    expect(row(container, "later").queryByRole("link")).toBeNull();
  });

  it("renders nothing once every quest is claimed, or when the list could not load", () => {
    const { container: done } = render(<QuestList quests={[quest("checkin", "第一次簽到", "claimed")]} />);
    expect(done).toBeEmptyDOMElement();
    const { container: missing } = render(<QuestList quests={null} />);
    expect(missing).toBeEmptyDOMElement();
  });
});
