import { render } from "@testing-library/react";
import { IceCreamIcon } from "./ice-cream-icon";

describe("IceCreamIcon", () => {
  it("is a line drawing hidden from assistive technology", () => {
    const { container } = render(<IceCreamIcon aria-hidden={false} />);

    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("fill", "none");
    expect(svg).toHaveAttribute("stroke", "currentColor");
    expect(svg).toHaveClass("size-4", "shrink-0");
  });

  it("lets the caller size it", () => {
    const { container } = render(<IceCreamIcon className="size-10 text-ink-secondary" />);

    const svg = container.querySelector("svg")!;
    expect(svg).toHaveClass("size-10", "text-ink-secondary", "shrink-0");
    expect(svg).not.toHaveClass("size-4");
  });
});
