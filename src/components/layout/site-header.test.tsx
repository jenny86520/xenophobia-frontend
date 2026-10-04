import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { SiteHeader } from "./site-header";

const mockPathname = jest.fn(() => "/");
jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
}));

describe("SiteHeader", () => {
  beforeEach(() => mockPathname.mockReturnValue("/"));

  it("marks the current section with aria-current", () => {
    mockPathname.mockReturnValue("/party");
    render(<SiteHeader brandName="XenoPhobiA" cta={null} />);

    expect(screen.getByRole("link", { name: "活動" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "關於" })).not.toHaveAttribute("aria-current");
  });

  it("shows the brand name with its uppercase letters in red", () => {
    render(<SiteHeader brandName="XenoPhobiA" cta={null} />);

    const home = screen.getByRole("link", { name: "XenoPhobiA" });
    expect(Array.from(home.querySelectorAll(".text-signal")).map((el) => el.textContent)).toEqual(["X", "P", "A"]);
  });

  it("carries the site-header hook the home-page reveal CSS targets", () => {
    render(<SiteHeader brandName="XenoPhobiA" cta={null} />);
    expect(screen.getByRole("banner")).toHaveClass("site-header");
  });

  it("hides the CTA when the backend has none", () => {
    render(<SiteHeader brandName="XenoPhobiA" cta={null} />);
    expect(screen.queryByRole("link", { name: /加入/ })).toBeNull();
  });

  it("shows the CTA when configured", () => {
    render(<SiteHeader brandName="XenoPhobiA" cta={{ label: "加入 Discord", href: "https://discord.gg/x" }} />);
    expect(screen.getByRole("link", { name: /加入 Discord/ })).toBeInTheDocument();
  });

  it("opens the mobile menu with focus inside, and Esc returns focus to the trigger", async () => {
    render(<SiteHeader brandName="XenoPhobiA" cta={null} />);

    const trigger = screen.getByRole("button", { name: "Menu" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await act(async () => {
      trigger.focus();
      fireEvent.click(trigger);
    });
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    const dialog = screen.getByRole("dialog");
    await waitFor(() => expect(document.activeElement).toBe(within(dialog).getByRole("link", { name: "活動" })));

    await act(async () => {
      fireEvent.keyDown(document.activeElement as HTMLElement, { key: "Escape" });
    });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    // Radix FocusScope restores focus in a setTimeout(0) after unmount.
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it("closes the mobile menu when a link is chosen", async () => {
    render(<SiteHeader brandName="XenoPhobiA" cta={null} />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    });
    const dialog = screen.getByRole("dialog");
    await act(async () => {
      fireEvent.click(within(dialog).getByRole("link", { name: "關於" }));
    });
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
