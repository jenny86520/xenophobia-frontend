import { fireEvent, render, screen } from "@testing-library/react";
import { PartyFilters } from "./party-filters";

const mockReplace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

// Radix Select calls DOM APIs that jsdom does not implement.
beforeAll(() => {
  Element.prototype.scrollIntoView = jest.fn();
  Element.prototype.hasPointerCapture = jest.fn(() => false);
  Element.prototype.releasePointerCapture = jest.fn();
});

describe("PartyFilters", () => {
  beforeEach(() => mockReplace.mockReset());

  it("replaces the URL with the new filter, leaving defaults out", () => {
    render(<PartyFilters value={{ status: "active", format: "all", category: "all" }} />);

    const trigger = screen.getByRole("combobox", { name: "Mode" });
    fireEvent.keyDown(trigger, { key: "Enter" });
    fireEvent.keyDown(screen.getByRole("option", { name: "Online" }), { key: "Enter" });

    expect(mockReplace).toHaveBeenCalledWith("/party?format=online", { scroll: false });
  });
});
