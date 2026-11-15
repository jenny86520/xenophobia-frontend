import { fireEvent, render, screen } from "@testing-library/react";
import { FriendActionButton } from "./friend-forms";

jest.mock("@/app/member/actions", () => ({
  sendFriendRequestAction: jest.fn(),
  updateFriendNoteAction: jest.fn(),
}));

describe("FriendActionButton", () => {
  it("keeps the action's message once the card turns done", async () => {
    const action = jest.fn().mockResolvedValue({ ok: true, message: "已領取 20 點" });
    const { rerender } = render(<FriendActionButton action={action} label="領取" primary />);

    fireEvent.click(screen.getByRole("button", { name: "領取" }));
    expect(await screen.findByText("已領取 20 點")).toBeInTheDocument();

    // The revalidate re-renders the card as claimed: the button goes, the message stays.
    rerender(<FriendActionButton action={action} label="領取" primary done={<span>已領取</span>} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("已領取")).toBeInTheDocument();
    expect(screen.getByText("已領取 20 點")).toBeInTheDocument();
  });
});
