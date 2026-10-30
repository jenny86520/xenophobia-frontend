import { render, screen } from "@testing-library/react";
import { LitText, graphemes } from "./lit-text";

describe("LitText", () => {
  it("gives assistive tech the whole sentence once", () => {
    render(
      <h2>
        <LitText text="我們一起玩 Game！" />
      </h2>,
    );

    expect(screen.getByRole("heading")).toHaveAccessibleName("我們一起玩 Game！");
    // The copy for assistive tech is never selected, so copying the heading gives the text once.
    expect(screen.getByRole("heading").querySelector(".sr-only")).toHaveClass("select-none");
  });

  it("splits mixed Chinese and English into characters, numbered from 0 to 1 in order", () => {
    const { container } = render(<LitText text="玩 CS2" />);

    const chars = [...container.querySelectorAll<HTMLElement>(".lit-char")];
    expect(chars.map((c) => c.textContent)).toEqual(["玩", " ", "C", "S", "2"]);
    expect(chars.map((c) => c.style.getPropertyValue("--p"))).toEqual(["0.000", "0.250", "0.500", "0.750", "1.000"]);
    expect(chars[0].parentElement).toHaveAttribute("aria-hidden", "true");
  });

  it("keeps an emoji or accented letter whole", () => {
    expect(graphemes("é🎮a")).toEqual(["é", "🎮", "a"]);
  });
});
