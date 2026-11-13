import { render, screen } from "@testing-library/react";
import { StampCard } from "./stamp-card";

function slots(container: HTMLElement) {
  return Array.from(container.querySelectorAll("li"));
}

describe("StampCard", () => {
  it("draws one slot per day with the stamps so far and the bonus on the last", () => {
    const { container } = render(<StampCard streak={3} requiredDays={7} checkedInToday ledgerPage={1} />);

    const all = slots(container);
    expect(all).toHaveLength(7);
    expect(all.filter((slot) => slot.hasAttribute("data-stamped"))).toHaveLength(3);
    expect(all[2]).toHaveAttribute("data-stamp-today");
    expect(all[6]).toHaveAttribute("data-stamp-bonus");
    expect(all[6]).toHaveTextContent("+1");
    expect(all[3]).toHaveTextContent("4");
    expect(screen.getByText("3 / 7 天・再 4 天 +1")).toBeInTheDocument();
  });

  it("keeps the slots from assistive tech, which reads the progress line", () => {
    const { container } = render(<StampCard streak={3} requiredDays={7} checkedInToday={false} ledgerPage={1} />);

    expect(container.querySelector("ol")).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("list")).toBeNull();
    expect(screen.queryByRole("navigation")).toBeNull();
  });

  it("stamps the bonus slot too on the day the card is full", () => {
    const { container } = render(<StampCard streak={7} requiredDays={7} checkedInToday ledgerPage={1} />);

    const last = slots(container)[6];
    expect(last).toHaveAttribute("data-stamped");
    expect(last).toHaveAttribute("data-stamp-bonus");
    expect(last).toHaveAttribute("data-stamp-today");
    expect(screen.getByText("7 / 7 天・已集滿 +1")).toBeInTheDocument();
  });

  it("pages a long campaign and keeps the ledger page in the links", () => {
    const { container } = render(<StampCard streak={23} requiredDays={60} checkedInToday={false} ledgerPage={2} />);

    expect(slots(container)).toHaveLength(10);
    const pages = screen.getByRole("navigation", { name: "集點卡分頁" });
    expect(pages).toHaveTextContent("第 3 / 6 張");
    expect(screen.getByRole("link", { name: "上一張" })).toHaveAttribute(
      "href",
      "/member?tab=points&page=2&card=2#stamp-card",
    );
    expect(screen.getByRole("link", { name: "下一張" })).toHaveAttribute(
      "href",
      "/member?tab=points&page=2&card=4#stamp-card",
    );
  });

  it("has no previous link on the first card and no next link on the last", () => {
    const { rerender } = render(
      <StampCard streak={0} requiredDays={60} checkedInToday={false} ledgerPage={1} requestedCard={1} />,
    );
    expect(screen.queryByRole("link", { name: "上一張" })).toBeNull();
    expect(screen.getByRole("link", { name: "下一張" })).toHaveAttribute("href", "/member?tab=points&card=2#stamp-card");

    rerender(<StampCard streak={0} requiredDays={60} checkedInToday={false} ledgerPage={1} requestedCard={6} />);
    expect(screen.queryByRole("link", { name: "下一張" })).toBeNull();
  });
});

describe("StampCard looks", () => {
  it("stamps with the equipped seal's ink and image", () => {
    const { container } = render(
      <StampCard
        streak={2}
        requiredDays={7}
        checkedInToday
        ledgerPage={1}
        look={{
          template: "stamp.square",
          params: { inkColor: "#ff8fab", border: "double", image: "x.png" },
          imageUrl: "/media/images/x.png",
        }}
      />,
    );
    const seal = container.querySelector("[data-stamped] .stamp-mark") as HTMLElement;
    expect(seal.style.getPropertyValue("--skin-ink")).toBe("#ff8fab");
    expect(seal).toHaveClass("rounded-sm", "border-double", "border-4");
    expect(seal).not.toHaveClass("rounded-full", "border-signal");
    expect(seal.querySelector("img")?.getAttribute("src")).toMatch(/\/media\/images\/x\.png$/);
  });

  it("keeps the default red XPA seal without a look or for an unknown template", () => {
    for (const look of [null, { template: "stamp.future", params: { inkColor: "#ffffff" }, imageUrl: null }]) {
      const { container, unmount } = render(
        <StampCard streak={1} requiredDays={7} checkedInToday ledgerPage={1} look={look} />,
      );
      const seal = container.querySelector("[data-stamped] .stamp-mark") as HTMLElement;
      expect(seal).toHaveClass("border-signal", "rounded-full");
      expect(seal.getAttribute("style")).toBeNull();
      unmount();
    }
  });
});
