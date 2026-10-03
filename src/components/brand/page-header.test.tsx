import { render, screen } from "@testing-library/react";
import { PageHeader } from "./page-header";
import { formatCount } from "./meta-label";

describe("PageHeader", () => {
  it("renders the eyebrow, then the page heading, then the description", () => {
    const { container } = render(
      <PageHeader eyebrow="PARTY / INDEX" title="Party listing" description="All community events." />,
    );

    const heading = screen.getByRole("heading", { level: 1, name: "Party listing" });
    // The eyebrow's text is split by the accent-colored separator span, so match on full textContent.
    const eyebrow = screen.getByText(
      (_, element) => element?.tagName === "SPAN" && element.textContent === "PARTY / INDEX",
    );
    const description = screen.getByText("All community events.");
    const order = Array.from(container.querySelectorAll("*"));
    expect(order.indexOf(eyebrow)).toBeLessThan(order.indexOf(heading));
    expect(order.indexOf(heading)).toBeLessThan(order.indexOf(description));
  });
});

describe("formatCount", () => {
  it("zero-pads single digits", () => {
    expect(formatCount(2)).toBe("02");
    expect(formatCount(12)).toBe("12");
  });
});
