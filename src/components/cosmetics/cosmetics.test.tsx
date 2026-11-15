import { render, screen } from "@testing-library/react";
import type { CosmeticLook } from "@/types/cosmetic";
import { CosmeticPreview } from "./cosmetic-preview";
import { frameProps, frameRow } from "./frame";
import { MemberTitleTag } from "./member-title-tag";

const look = (template: string, params: CosmeticLook["params"], imageUrl: string | null = null): CosmeticLook => ({
  template,
  params,
  imageUrl,
});

const FRAME_IMAGE = "/media/images/00000000-0000-4000-8000-00000000f001.png";

describe("MemberTitleTag", () => {
  it("shows the title as text in its colour, with a decorative icon", () => {
    const { container } = render(
      <MemberTitleTag
        look={{
          template: "title.basic",
          params: { text: "派對常客", textColor: "#ffd166", icon: "crown" },
          imageUrl: null,
        }}
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
        look={{
          template: "title.gradient",
          params: { text: "傳奇", fromColor: "#ffd166", toColor: "#ff8fab" },
          imageUrl: null,
        }}
      />,
    );
    const tag = container.querySelector("[data-member-title]") as HTMLElement;
    expect(tag.style.getPropertyValue("--skin-to")).toBe("#ff8fab");
    expect(screen.getByText("傳奇")).toHaveClass("bg-clip-text");
  });

  it("draws a tag title as a solid tag in its fill colour", () => {
    const { container } = render(
      <MemberTitleTag
        look={look("title.tag", { text: "聖誕惡童", textColor: "#1a1a1a", fillColor: "#f5d76e", icon: "tree-pine" })}
      />,
    );
    const tag = container.querySelector("[data-member-title]") as HTMLElement;
    expect(tag).toHaveTextContent("稱號：聖誕惡童");
    expect(tag.style.getPropertyValue("--skin-fill")).toBe("#f5d76e");
    expect(tag.style.getPropertyValue("--skin-text")).toBe("#1a1a1a");
    expect(tag).toHaveClass("bg-(--skin-fill)");
    expect(tag.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("gives a shine title its sweep class and both colours", () => {
    const { container } = render(
      <MemberTitleTag look={look("title.shine", { text: "流光", textColor: "#ffd166", shineColor: "#ffffff" })} />,
    );
    const tag = container.querySelector("[data-member-title]") as HTMLElement;
    expect(tag.style.getPropertyValue("--skin-shine")).toBe("#ffffff");
    expect(screen.getByText("流光")).toHaveClass("title-shine");
  });

  it("keeps anything that is not #rrggbb out of the style", () => {
    const { container } = render(
      <MemberTitleTag
        look={look("title.tag", { text: "壞", textColor: "#ffffff", fillColor: "red;background:url(x)" })}
      />,
    );
    const tag = container.querySelector("[data-member-title]") as HTMLElement;
    expect(tag.getAttribute("style") ?? "").not.toContain("url");
    expect(tag.style.getPropertyValue("--skin-fill")).toBe("");
  });

  it("renders nothing without a title and plain text for an unknown template", () => {
    expect(render(<MemberTitleTag look={null} />).container).toBeEmptyDOMElement();
    const { container } = render(
      <MemberTitleTag
        look={{ template: "title.future", params: { text: "新款", textColor: "#ffffff" }, imageUrl: null }}
      />,
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

  it("puts the chosen ornament on a corner frame, defaulting to brackets", () => {
    const props = frameProps(
      look("frame.corners", { mainColor: "#e63946", accentColor: "#2a9d8f", ornament: "snowflake" }),
    );
    expect(props).toMatchObject({ "data-frame": "frame.corners", "data-ornament": "snowflake" });
    expect(props.className).toContain("frame-corners");
    expect(props.style).toEqual({ "--skin-main": "#e63946", "--skin-accent": "#2a9d8f" });
    expect(frameProps(look("frame.corners", { mainColor: "#e63946", ornament: "skull" }))["data-ornament"]).toBe(
      "bracket",
    );
    expect(frameRow(look("frame.corners", { mainColor: "#e63946", ornament: "star" }), "py-2")).toMatchObject({
      "data-ornament": "star",
    });
  });

  it("draws an image frame's stored picture on the border, nothing else from the URL", () => {
    const props = frameProps(look("frame.image", { image: "x.png", mainColor: "#e63946" }, FRAME_IMAGE));
    expect(props.className).toContain("frame-image");
    expect((props.style as Record<string, string>)["--skin-frame-image"]).toMatch(
      /^url\("https?:\/\/[^"]+\/media\/images\/00000000-0000-4000-8000-00000000f001\.png"\)$/,
    );
    expect((props.style as Record<string, string>)["--skin-main"]).toBe("#e63946");
    for (const bad of ['/media/images/x.png") , url("evil', "https://evil.example/a.png", null]) {
      const style = frameProps(look("frame.image", { mainColor: "#e63946" }, bad)).style as Record<string, string>;
      expect(style["--skin-frame-image"]).toBeUndefined();
      expect(style["--skin-main"]).toBe("#e63946");
    }
  });

  it("is empty without a frame or for an unknown template", () => {
    expect(frameProps(null)).toEqual({});
    expect(frameProps({ template: "frame.future", params: {}, imageUrl: null })).toEqual({});
  });
});

describe("CosmeticPreview", () => {
  const NEW_LOOKS: Array<[string, CosmeticLook, string]> = [
    [
      "title",
      look("title.tag", { text: "聖誕惡童", textColor: "#1a1a1a", fillColor: "#f5d76e" }),
      "[data-member-title='title.tag']",
    ],
    ["title", look("title.shine", { text: "流光", textColor: "#ffd166", shineColor: "#ffffff" }), ".title-shine"],
    [
      "frame",
      look("frame.corners", { mainColor: "#e63946", accentColor: "#2a9d8f", ornament: "star" }),
      ".frame-corners[data-ornament='star']",
    ],
    ["frame", look("frame.image", { image: "x.png", mainColor: "#e63946" }, FRAME_IMAGE), ".frame-image"],
    [
      "stamp",
      look("stamp.night", { cardColor: "#1b2a4a", pattern: "dots", patternColor: "#f5c542", inkColor: "#f5c542" }),
      ".stamp-card-night[data-pattern='dots']",
    ],
    ["stamp", look("stamp.ticket", { cardColor: "#f3e9d2", inkColor: "#b3261e" }), ".stamp-card-ticket"],
    [
      "cup",
      look("cup.face", { lineColor: "#ffffff", face: "smile", blush: true, blushColor: "#ff8fab" }),
      "svg[data-cup='cup.face']",
    ],
    [
      "cup",
      look("cup.topping", { lineColor: "#ffffff", sticks: true, stickColor: "#f4a6c0" }),
      "svg[data-cup='cup.topping']",
    ],
  ];

  const FRAME = look("frame.line", { mainColor: "#e63946", borderStyle: "solid" });
  const previewName = (container: HTMLElement) => container.querySelector("[data-preview-name]") as HTMLElement;

  it("frames the member's own nickname, trimmed", () => {
    const { container } = render(<CosmeticPreview kind="frame" look={FRAME} sampleName="  小明 " />);
    expect(previewName(container)).toHaveTextContent(/^小明$/);
  });

  it.each([undefined, null, "", "   "])("frames 你的名字 without a nickname (%p)", (sampleName) => {
    const { container } = render(<CosmeticPreview kind="frame" look={FRAME} sampleName={sampleName} />);
    expect(previewName(container)).toHaveTextContent(/^你的名字$/);
  });

  it("cuts a long nickname with an ellipsis inside the frame, never clipping the frame itself", () => {
    const long = "超級無敵長的暱稱".repeat(4);
    const { container } = render(<CosmeticPreview kind="frame" look={FRAME} sampleName={long} />);
    const name = previewName(container);
    expect(name).toHaveTextContent(long);
    expect(name).toHaveClass("truncate");
    const frame = container.querySelector("[data-frame]") as HTMLElement;
    expect(frame).toHaveClass("max-w-full", "min-w-0");
    expect(frame).not.toHaveClass("truncate");
    expect(frame.className).not.toMatch(/overflow/);
  });

  it.each(NEW_LOOKS)("draws the new %s template %#, not the default look", (kind, cosmetic, selector) => {
    const { container } = render(<CosmeticPreview kind={kind} look={cosmetic} />);
    expect(container.querySelector(selector)).not.toBeNull();
  });
});
