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

    expect(screen.getByRole("link", { name: "Party" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "About" })).not.toHaveAttribute("aria-current");
  });

  it("marks Shop on the point shop", () => {
    mockPathname.mockReturnValue("/shop");
    render(<SiteHeader brandName="XenoPhobiA" cta={null} />);

    expect(screen.getByRole("link", { name: "Shop" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Legends" })).not.toHaveAttribute("aria-current");
  });

  it("labels the primary navigation in English, marked as English for screen readers", () => {
    render(<SiteHeader brandName="XenoPhobiA" cta={null} />);

    const nav = screen.getByRole("navigation", { name: "主要導覽" });
    const links = within(nav).getAllByRole("link");
    expect(links.map((a) => [a.textContent, a.getAttribute("href")])).toEqual([
      ["Party", "/party"],
      ["Legends", "/legends"],
      ["Shop", "/shop"],
      ["About", "/about"],
      ["News", "/news"],
      ["Guide", "/guide"],
      ["Member", "/member"],
    ]);
    links.forEach((a) => expect(a).toHaveAttribute("lang", "en"));
  });

  it("puts About, News and Guide behind an Info button that opens a popover", () => {
    render(<SiteHeader brandName="XenoPhobiA" cta={null} />);

    const nav = screen.getByRole("navigation", { name: "主要導覽" });
    const info = within(nav).getByRole("button", { name: "Info" });
    const menu = document.getElementById(info.getAttribute("popovertarget") ?? "");
    expect(menu).toHaveAttribute("popover", "auto");
    expect(within(menu!).getAllByRole("link").map((a) => a.textContent)).toEqual(["About", "News", "Guide"]);
    expect(info.querySelector("[lang=en]")).toHaveTextContent("Info");
    expect(info).not.toHaveAttribute("data-current");
  });

  it("marks the Info button current on a page inside it, and the page's own link", () => {
    mockPathname.mockReturnValue("/news/abc");
    render(<SiteHeader brandName="XenoPhobiA" cta={null} />);

    const nav = screen.getByRole("navigation", { name: "主要導覽" });
    expect(within(nav).getByRole("button", { name: "Info" })).toHaveAttribute("data-current");
    expect(within(nav).getByRole("link", { name: "News" })).toHaveAttribute("aria-current", "page");
  });

  it("shows unread news beside the Info button and News", () => {
    render(<SiteHeader brandName="XenoPhobiA" cta={null} newsUnread={2} />);

    const nav = screen.getByRole("navigation", { name: "主要導覽" });
    expect(within(nav).getByRole("button", { name: /Info/ })).toHaveTextContent("（2 則未讀）");
    expect(within(nav).getByRole("link", { name: /News/ })).toHaveTextContent("（2 則未讀）");
  });

  it("puts a decorative icon before each nav label, underlining only the text", () => {
    mockPathname.mockReturnValue("/party");
    render(<SiteHeader brandName="XenoPhobiA" cta={null} />);

    const nav = screen.getByRole("navigation", { name: "主要導覽" });
    for (const link of within(nav).getAllByRole("link")) {
      const icon = link.querySelector("svg");
      expect(icon).toHaveAttribute("aria-hidden", "true");
      expect(link.firstElementChild).toBe(icon);
      expect(link.querySelector(".link-underline")).toHaveTextContent(link.textContent ?? "");
      expect(link).not.toHaveClass("link-underline");
    }
    expect(within(nav).getByRole("link", { name: "Party" })).toHaveAttribute("aria-current", "page");
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
    await waitFor(() => expect(document.activeElement).toBe(within(dialog).getByRole("link", { name: "Party" })));

    await act(async () => {
      fireEvent.keyDown(document.activeElement as HTMLElement, { key: "Escape" });
    });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    // Radix FocusScope restores focus in a setTimeout(0) after unmount.
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it("shows how many friend requests and invites wait beside Member, in words for screen readers", async () => {
    render(<SiteHeader brandName="XenoPhobiA" cta={null} memberPending={3} />);

    const nav = screen.getByRole("navigation", { name: "主要導覽" });
    const member = within(nav).getByRole("link", { name: /^Member/ });
    expect(member).toHaveTextContent("Member3（3 件待處理）");
    expect(within(member).getByText("3")).toHaveAttribute("aria-hidden", "true");
    // The count sits outside the underlined label.
    expect(member.querySelector(".link-underline")).toHaveTextContent(/^Member$/);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    });
    expect(within(screen.getByRole("dialog")).getByRole("link", { name: /^Member/ })).toHaveTextContent(
      "（3 件待處理）",
    );
  });

  it("shows no count when nothing is waiting", () => {
    render(<SiteHeader brandName="XenoPhobiA" cta={null} memberPending={0} />);

    const nav = screen.getByRole("navigation", { name: "主要導覽" });
    expect(within(nav).getByRole("link", { name: "Member" })).toHaveTextContent(/^Member$/);
  });

  it("closes the mobile menu when a link is chosen", async () => {
    render(<SiteHeader brandName="XenoPhobiA" cta={null} />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    });
    const dialog = screen.getByRole("dialog");
    await act(async () => {
      fireEvent.click(within(dialog).getByRole("link", { name: "About" }));
    });
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
