import { render, screen } from "@testing-library/react";
import { FriendName } from "@/components/member/friend-name";
import { ParticipantList } from "@/components/party/party-registration";

jest.mock("@/app/member/actions", () => ({ registrationAction: jest.fn() }));

const title = { template: "title.basic", params: { text: "派對常客", textColor: "#ffd166" }, imageUrl: null };

describe("titles beside nicknames", () => {
  it("follows a friend's nickname, before the viewer's note", () => {
    render(<FriendName nickname="小華" note="室友" memberTitle={title} />);
    expect(screen.getByText("小華").parentElement).toHaveTextContent("小華稱號：派對常客備註：室友");
  });

  it("shows members' titles in the participant list, never for guests", () => {
    render(
      <ParticipantList
        labelledBy="x"
        participants={[
          { nickname: "阿明", discordId: "ming", registeredAt: "2026-11-01T00:00:00Z", guest: false, memberTitle: title },
          { nickname: "路人", discordId: "", registeredAt: "2026-11-02T00:00:00Z", guest: true, memberTitle: null },
        ]}
      />,
    );
    expect(screen.getByText("阿明").closest("li")).toHaveTextContent("稱號：派對常客");
    expect(screen.getByText("路人").closest("li")).not.toHaveTextContent("稱號");
  });
});
