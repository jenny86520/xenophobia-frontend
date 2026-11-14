import { render, screen } from "@testing-library/react";
import { FRIENDS_PANEL_ID } from "./friends-panel-id";
import { OpenFriendsButton } from "./open-friends-button";

describe("OpenFriendsButton", () => {
  it("is a plain button that shows the friends sidebar", () => {
    render(<OpenFriendsButton className="look">去完成</OpenFriendsButton>);

    const button = screen.getByRole("button", { name: "去完成" });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("popovertarget", FRIENDS_PANEL_ID);
    expect(button).toHaveAttribute("popovertargetaction", "show");
    expect(button).toHaveClass("look");
  });
});
