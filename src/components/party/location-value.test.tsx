import { render, screen } from "@testing-library/react";
import { LocationValue } from "./location-value";

describe("LocationValue", () => {
  it("links the location to its map in a new window when a link is given", () => {
    render(<LocationValue location="台北車站" locationUrl="https://maps.app.goo.gl/abc" />);
    const link = screen.getByRole("link", { name: /台北車站/ });
    expect(link).toHaveAttribute("href", "https://maps.app.goo.gl/abc");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).toHaveTextContent("（另開新視窗）");
  });

  it.each([undefined, ""])("is plain text without a link (%p)", (locationUrl) => {
    render(<LocationValue location="台北車站" locationUrl={locationUrl} />);
    expect(screen.getByText("台北車站")).toBeInTheDocument();
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("never links anything but http(s)", () => {
    render(<LocationValue location="台北車站" locationUrl="javascript:alert(1)" />);
    expect(screen.queryByRole("link")).toBeNull();
  });
});
