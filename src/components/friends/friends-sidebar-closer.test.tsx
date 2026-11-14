import { render } from "@testing-library/react";
import { FriendsSidebarCloser } from "./friends-sidebar-closer";

let pathname = "/legends";
jest.mock("next/navigation", () => ({ usePathname: () => pathname }));

function panel() {
  const element = document.createElement("div");
  element.id = "friends-panel";
  const hidePopover = jest.fn();
  element.hidePopover = hidePopover;
  document.body.append(element);
  return { element, hidePopover };
}

afterEach(() => {
  document.getElementById("friends-panel")?.remove();
  pathname = "/legends";
});

describe("FriendsSidebarCloser", () => {
  it("folds the sidebar away when the page changes", () => {
    const { hidePopover } = panel();
    const { rerender } = render(<FriendsSidebarCloser panelId="friends-panel" />);
    expect(hidePopover).not.toHaveBeenCalled();

    pathname = "/matches/x1";
    rerender(<FriendsSidebarCloser panelId="friends-panel" />);
    expect(hidePopover).toHaveBeenCalledTimes(1);
  });

  it("keeps it open when the same page renders again (a Server Action's refresh)", () => {
    const { hidePopover } = panel();
    const { rerender } = render(<FriendsSidebarCloser panelId="friends-panel" />);
    rerender(<FriendsSidebarCloser panelId="friends-panel" />);

    expect(hidePopover).not.toHaveBeenCalled();
  });
});
