import { render, screen } from "@testing-library/react";
import { Games } from "./games";

jest.mock("@/components/games/game-carousel", () => ({ GameCarousel: () => <div data-testid="carousel" /> }));

describe("Games", () => {
  it("links every clip from the games section", () => {
    render(<Games games={[{ id: "g1", name: "CS2", summary: "", videos: [] }]} index={2} />);

    expect(screen.getByRole("link", { name: /All clips/ })).toHaveAttribute("href", "/clips");
    expect(screen.getByTestId("carousel")).toBeInTheDocument();
  });
});
