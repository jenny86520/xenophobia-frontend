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

describe("IceCreamIcon with a cup", () => {
  const classic = {
    template: "cup.classic",
    params: { lineColor: "#f5f5f5", cupColor: "#c62a2f", creamColor: "#ffffff", bandColor: "#2f8f4e" },
  };

  it("fills the classic cup from CSS variables and takes the line colour", () => {
    const { container } = render(<IceCreamIcon look={classic} />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("data-cup", "cup.classic");
    expect(svg.style.getPropertyValue("--cup-body")).toBe("#c62a2f");
    expect(svg.style.getPropertyValue("--cup-band")).toBe("#2f8f4e");
    expect(svg.style.color).toBe("rgb(245, 245, 245)");
    expect(container.querySelectorAll('path[fill="var(--cup-body, none)"]')).toHaveLength(1);
  });

  it("draws stripes instead of the band on the striped cup", () => {
    const { container } = render(
      <IceCreamIcon look={{ template: "cup.striped", params: { lineColor: "#ffffff", stripeColor: "#e63946" } }} />,
    );
    expect(container.querySelectorAll('path[stroke="var(--cup-stripe, currentColor)"]')).toHaveLength(3);
    expect(container.querySelector("svg")!.style.getPropertyValue("--cup-stripe")).toBe("#e63946");
  });

  it("draws the chosen face, and blush only when it is on, on the face cup", () => {
    const face = (params: Record<string, string | boolean>) =>
      render(
        <IceCreamIcon
          look={{ template: "cup.face", params: { lineColor: "#ffffff", blushColor: "#ff8fab", ...params } }}
        />,
      ).container;
    const wink = face({ face: "wink", blush: true });
    expect(wink.querySelector('[data-cup-layer="face"] path')).toHaveAttribute("d", "M9.1 13.3q.7-.8 1.4 0");
    expect(wink.querySelectorAll('[data-cup-layer="blush"] ellipse')).toHaveLength(2);
    expect(wink.querySelector("svg")!.style.getPropertyValue("--cup-blush")).toBe("#ff8fab");
    const plain = face({ face: "unknown", blush: false });
    expect(plain.querySelector('[data-cup-layer="blush"]')).toBeNull();
    // An unknown expression falls back to the smile.
    expect(plain.querySelector('[data-cup-layer="face"] path')).toHaveAttribute("d", "M9.8 13h.01");
  });

  it("draws exactly the toppings that are switched on, sticks in their own colour", () => {
    const layers = (params: Record<string, string | boolean>) => {
      const { container } = render(
        <IceCreamIcon
          look={{
            template: "cup.topping",
            params: { lineColor: "#ffffff", toppingColor: "#e63946", stickColor: "#f4a6c0", ...params },
          }}
        />,
      );
      return {
        names: Array.from(container.querySelectorAll("[data-cup-layer]")).map((el) =>
          el.getAttribute("data-cup-layer"),
        ),
        svg: container.querySelector("svg")!,
      };
    };
    const some = layers({ sprinkles: true, candyCane: false, stars: false, sticks: true });
    expect(some.names).toEqual(["sticks", "sprinkles"]);
    expect(some.svg.style.getPropertyValue("--cup-stick")).toBe("#f4a6c0");
    expect(layers({ sprinkles: true, candyCane: true, stars: true, sticks: true }).names).toEqual([
      "candyCane",
      "sticks",
      "sprinkles",
      "stars",
    ]);
    expect(layers({ sprinkles: false, candyCane: false, stars: false, sticks: false }).names).toEqual([]);
  });

  it("drops colours that are not #rrggbb and ignores unknown templates", () => {
    const { container } = render(
      <IceCreamIcon look={{ template: "cup.classic", params: { cupColor: "red;background:url(x)" } }} />,
    );
    expect(container.querySelector("svg")!.getAttribute("style") ?? "").not.toContain("url");

    const plain = render(<IceCreamIcon />).container.innerHTML;
    const unknown = render(<IceCreamIcon look={{ template: "cup.future", params: {} }} />).container.innerHTML;
    expect(unknown).toBe(plain);
  });
});
