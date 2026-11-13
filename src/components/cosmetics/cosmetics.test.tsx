import { render, screen } from "@testing-library/react";
import { frameProps } from "./frame";
import { MemberTitleTag } from "./member-title-tag";

describe("MemberTitleTag", () => {
  it("shows the title as text in its colour, with a decorative icon", () => {
    const { container } = render(
      <MemberTitleTag
        look={{ template: "title.basic", params: { text: "派對常客", textColor: "#ffd166", icon: "crown" }, imageUrl: null }}
      />,
    );
    const tag = container.querySelector("[data-member-title]") as HTMLElement;
    expect(tag).toHaveTextContent("稱號：派對常客");
    expect(tag.style.getPropertyValue("--skin-text")).toBe("#ffd166");
    expect(tag.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("runs a gradient title between its two colours", () => {
    const { container } = render(
      <MemberTitleTag
        look={{ template: "title.gradient", params: { text: "傳奇", fromColor: "#ffd166", toColor: "#ff8fab" }, imageUrl: null }}
      />,
    );
    const tag = container.querySelector("[data-member-title]") as HTMLElement;
    expect(tag.style.getPropertyValue("--skin-to")).toBe("#ff8fab");
    expect(screen.getByText("傳奇")).toHaveClass("bg-clip-text");
  });

  it("renders nothing without a title and plain text for an unknown template", () => {
    expect(render(<MemberTitleTag look={null} />).container).toBeEmptyDOMElement();
    const { container } = render(
      <MemberTitleTag look={{ template: "title.future", params: { text: "新款", textColor: "#ffffff" }, imageUrl: null }} />,
    );
    const tag = container.querySelector("[data-member-title]") as HTMLElement;
    expect(tag).toHaveTextContent("新款");
    expect(tag.getAttribute("style")).toBeNull();
    expect(tag).toHaveClass("text-ink-secondary");
  });
});

describe("frameProps", () => {
  it("draws a static frame with its border style and optional glow", () => {
    const props = frameProps({
      template: "frame.line",
      params: { mainColor: "#00e5ff", accentColor: "#ff3df0", borderStyle: "double", glow: true },
      imageUrl: null,
    });
    expect(props["data-frame"]).toBe("frame.line");
    expect(props.className).toContain("border-double");
    expect(props.className).toContain("shadow-[0_0_12px_var(--skin-accent)]");
    expect(props.style).toEqual({ "--skin-main": "#00e5ff", "--skin-accent": "#ff3df0" });
  });

  it("gives the pulse frame its animation class and a fixed speed", () => {
    const props = frameProps({
      template: "frame.pulse",
      params: { mainColor: "#00e5ff", accentColor: "#ff3df0", speed: "0.1s" },
      imageUrl: null,
    });
    expect(props.className).toContain("frame-pulse");
    // Anything but the two known speeds falls back to slow.
    expect(props.style).toMatchObject({ "--skin-speed": "4s" });
  });

  it("is empty without a frame or for an unknown template", () => {
    expect(frameProps(null)).toEqual({});
    expect(frameProps({ template: "frame.future", params: {}, imageUrl: null })).toEqual({});
  });
});
