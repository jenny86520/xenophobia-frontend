import { render, screen, within } from "@testing-library/react";
import { NavLinks } from "./nav-links";
import { flatNavLinks } from "./nav-items";

jest.mock("next/navigation", () => ({ usePathname: () => "/about" }));

describe("NavLinks as headings (the full-screen menu)", () => {
  it("lists a group under its heading, with nothing to open", () => {
    render(<NavLinks groups="heading" newsUnread={1} />);

    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getAllByRole("link").map((a) => a.textContent?.replace(/（.*）|\d/g, ""))).toEqual([
      "Party",
      "Legends",
      "Shop",
      "Clips",
      "About",
      "News",
      "Guide",
      "Member",
    ]);
    const heading = screen.getByText("Info");
    expect(heading).toHaveAttribute("lang", "en");
    expect(heading.closest("a")).toBeNull();
    const group = heading.closest("li") as HTMLElement;
    expect(within(group).getByRole("link", { name: "About" })).toHaveAttribute("aria-current", "page");
    expect(within(group).getByRole("link", { name: /News/ })).toHaveTextContent("（1 則未讀）");
  });
});

describe("flatNavLinks", () => {
  it("opens the groups up in order", () => {
    expect(flatNavLinks().map((item) => item.href)).toEqual([
      "/party",
      "/legends",
      "/shop",
      "/clips",
      "/about",
      "/news",
      "/guide",
      "/member",
    ]);
  });
});
