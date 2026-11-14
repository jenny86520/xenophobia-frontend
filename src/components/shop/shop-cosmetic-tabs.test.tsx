import { render, screen, within } from "@testing-library/react";
import { ShopCosmeticTabs } from "./shop-cosmetic-tabs";
import { ShopJumpNav } from "./shop-jump-nav";

const groups = [
  { key: "xmas", label: "聖誕系列", items: [1, 2] },
  { key: "other", label: "其他", items: [3] },
];

describe("ShopCosmeticTabs", () => {
  it("marks the current tab by aria-current and counts every item", () => {
    render(
      <ShopCosmeticTabs
        groups={groups}
        current="xmas"
        hideOwned={false}
        signedIn={false}
      />,
    );
    const nav = screen.getByRole("navigation", { name: "外觀分類" });
    const links = within(nav).getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual([
      "全部 3",
      "聖誕系列 2",
      "其他 1",
    ]);
    expect(links[1]).toHaveAttribute("aria-current", "page");
    expect(links[0]).not.toHaveAttribute("aria-current");
    expect(links[2]).toHaveAttribute(
      "href",
      "/shop?category=other#shelf-cosmetics",
    );
    expect(
      screen.queryByRole("link", { name: /已擁有/ }),
    ).not.toBeInTheDocument();
  });

  it("gives a member the toggle, keeping the tab", () => {
    render(
      <ShopCosmeticTabs groups={groups} current="xmas" hideOwned signedIn />,
    );
    expect(screen.getByRole("link", { name: "顯示已擁有" })).toHaveAttribute(
      "href",
      "/shop?category=xmas#shelf-cosmetics",
    );
    expect(screen.getByRole("link", { name: "全部 3" })).toHaveAttribute(
      "href",
      "/shop?owned=hide#shelf-cosmetics",
    );
  });
});

describe("ShopJumpNav", () => {
  it("links to the three shelves with decorative separators", () => {
    render(<ShopJumpNav />);
    const nav = screen.getByRole("navigation", { name: "商店分類" });
    expect(
      within(nav)
        .getAllByRole("link")
        .map((link) => link.getAttribute("href")),
    ).toEqual(["#shelf-ice-creams", "#shelf-tasks", "#shelf-cosmetics"]);
    expect(within(nav).getAllByRole("listitem")).toHaveLength(3);
  });
});
