import { render, screen } from "@testing-library/react";
import { BackToTop } from "./back-to-top";

describe("BackToTop", () => {
  it("is a named link to the top of the page", () => {
    render(<BackToTop />);

    const link = screen.getByRole("link", { name: "回到頁首" });
    expect(link).toHaveAttribute("href", "#top");
    expect(link).toHaveClass("back-to-top", "size-11");
  });
});
