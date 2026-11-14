import { fireEvent, render, screen, within } from "@testing-library/react";
import type { IceShowcaseItem } from "@/types/ice-cream";
import { IceShowcaseStrip } from "./ice-showcase-strip";

const items: IceShowcaseItem[] = [
  {
    id: "i20",
    serial: 20,
    cup: { name: "聖誕杯", template: "cup.classic", params: { lineColor: "#f5f5f5", cupColor: "#c62a2f" } },
    issuerName: "管理員",
  },
  { id: "i12", serial: 12, cup: null, issuerName: "阿明" },
];

function stubHover(matches: boolean) {
  window.matchMedia = jest.fn().mockReturnValue({
    matches,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }) as unknown as typeof window.matchMedia;
}

describe("IceShowcaseStrip", () => {
  beforeEach(() => stubHover(false));

  it("renders nothing without shown ice creams", () => {
    const { container } = render(<IceShowcaseStrip items={[]} idPrefix="x" />);
    expect(container).toBeEmptyDOMElement();
    const { container: missing } = render(<IceShowcaseStrip idPrefix="y" />);
    expect(missing).toBeEmptyDOMElement();
  });

  it("names each cup and opens a card with the cup, number, cup name and issuer", () => {
    render(<IceShowcaseStrip items={items} idPrefix="team-p1" />);

    const buttons = screen.getAllByRole("button");
    expect(buttons.map((button) => button.getAttribute("aria-label"))).toEqual(["冰炫風 #20", "冰炫風 #12"]);
    expect(buttons[0]).toHaveAttribute("popovertarget", "team-p1-i20");

    const card = document.getElementById("team-p1-i20")!;
    expect(card).toHaveAttribute("popover", "auto");
    expect(card).toHaveAttribute("role", "dialog");
    expect(card).toHaveAccessibleName("冰炫風 #20");
    expect(card).toHaveTextContent("杯子：聖誕杯");
    expect(card).toHaveTextContent("管理員 發行");
    expect(card.querySelector("svg[data-cup='cup.classic']")).not.toBeNull();
    expect(within(document.getElementById("team-p1-i12")!).getByText("杯子：預設杯")).toBeInTheDocument();
  });

  it("opens on hover only for a fine pointer", () => {
    stubHover(true);
    const show = jest.fn();
    HTMLElement.prototype.showPopover = show;
    HTMLElement.prototype.hidePopover = jest.fn();
    render(<IceShowcaseStrip items={items} idPrefix="hover" />);

    fireEvent.pointerEnter(screen.getAllByRole("button")[0]);
    expect(show).toHaveBeenCalledTimes(1);
  });

  it("leaves touch and keyboards to the button", () => {
    const show = jest.fn();
    HTMLElement.prototype.showPopover = show;
    render(<IceShowcaseStrip items={items} idPrefix="touch" />);

    fireEvent.pointerEnter(screen.getAllByRole("button")[0]);
    expect(show).not.toHaveBeenCalled();
  });
});
