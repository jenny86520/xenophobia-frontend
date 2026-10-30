import { render } from "@testing-library/react";
import { BrandMarquee } from "./marquee";

describe("BrandMarquee", () => {
  it("is decoration only: hidden from assistive tech, three rows, the middle one outlined", () => {
    const { container } = render(<BrandMarquee name="XenoPhobiA" />);

    const band = container.querySelector("[data-brand-marquee]") as HTMLElement;
    expect(band).toHaveAttribute("aria-hidden", "true");
    const rows = band.querySelectorAll(".marquee-row");
    expect(rows).toHaveLength(3);
    expect([...rows].map((row) => row.classList.contains("marquee-outline"))).toEqual([false, true, false]);
    expect([...rows].map((row) => row.classList.contains("marquee-row-reverse"))).toEqual([false, true, false]);
  });

  it("draws the name through BrandName, so the XPA letters keep the signal colour", () => {
    const { container } = render(<BrandMarquee name="XenoPhobiA" />);

    const firstRow = container.querySelector(".marquee-row") as HTMLElement;
    const red = [...firstRow.querySelectorAll(".text-signal")].map((span) => span.textContent);
    // Three copies per row, each with X, P and A in signal red.
    expect(red).toEqual(["X", "P", "A", "X", "P", "A", "X", "P", "A"]);
  });
});
