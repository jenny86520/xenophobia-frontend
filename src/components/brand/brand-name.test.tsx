import { render, screen } from "@testing-library/react";
import { BrandName } from "./brand-name";

const redRuns = (container: HTMLElement) =>
  Array.from(container.querySelectorAll("span.text-signal")).map((span) => span.textContent);

describe("BrandName", () => {
  it("marks only the originally uppercase letters", () => {
    const { container } = render(<p><BrandName name="XenoPhobiA" /></p>);

    expect(redRuns(container)).toEqual(["X", "P", "A"]);
    expect(container.querySelector("[aria-hidden=true]")?.textContent).toBe("XenoPhobiA");
  });

  it("is read by assistive tech as one word", () => {
    render(<a href="#brand"><BrandName name="XenoPhobiA" /></a>);
    expect(screen.getByRole("link")).toHaveAccessibleName("XenoPhobiA");
  });

  it("merges consecutive uppercase letters into one run", () => {
    const { container } = render(<p><BrandName name="XPA Team" /></p>);
    expect(redRuns(container)).toEqual(["XPA", "T"]);
  });

  it("leaves names without uppercase letters untouched", () => {
    for (const name of ["xenophobia", "異鄉人 2026"]) {
      const { container } = render(<p><BrandName name={name} /></p>);
      expect(redRuns(container)).toEqual([]);
      expect(container.querySelector("[aria-hidden=true]")?.textContent).toBe(name);
    }
  });
});
