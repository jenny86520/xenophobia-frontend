import { render, screen } from "@testing-library/react";
import { PartyStatusBadges } from "./party-status-badges";

describe("PartyStatusBadges", () => {
  it("tints the online badge green and keeps its text and icon", () => {
    const { container } = render(<PartyStatusBadges format="online" />);

    const badge = container.querySelector('[data-format="online"]');
    expect(badge).toHaveTextContent("[ONLINE]");
    expect(badge).toHaveClass("bg-success/15", "border-success/40", "text-success");
    expect(badge?.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
  });

  it("tints the offline badge amber and keeps its text and icon", () => {
    const { container } = render(<PartyStatusBadges format="offline" />);

    const badge = container.querySelector('[data-format="offline"]');
    expect(badge).toHaveTextContent("[OFFLINE]");
    expect(badge).toHaveClass("bg-warning/15", "border-warning/40", "text-warning");
    expect(badge?.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
  });

  it("leaves lifecycle badges untinted", () => {
    render(<PartyStatusBadges format="online" lifecycle="ongoing" />);

    const active = screen.getByText("ACTIVE").closest('[data-slot="badge"]');
    expect(active?.className).not.toMatch(/success|warning/);
  });
});
