import { render, screen, within } from "@testing-library/react";
import { Sparkles } from "lucide-react";
import { HIGHLIGHT_ICONS, highlightIcon } from "./highlight-icon";
import { HighlightList } from "./highlight-list";

// The backend's HIGHLIGHT_ICONS codes, in its order.
const BACKEND_CODES = [
  "party",
  "users",
  "trophy",
  "shield",
  "globe",
  "sparkles",
  "gamepad",
  "swords",
  "video",
  "calendar",
  "megaphone",
  "heart",
];

describe("highlightIcon", () => {
  it("draws every backend code with its own icon", () => {
    expect(Object.keys(HIGHLIGHT_ICONS)).toEqual(BACKEND_CODES);
    expect(new Set(BACKEND_CODES.map(highlightIcon)).size).toBe(BACKEND_CODES.length);
  });

  it("falls back to sparkles for an unknown or missing code", () => {
    expect(highlightIcon("skull")).toBe(Sparkles);
    expect(highlightIcon(undefined)).toBe(Sparkles);
  });
});

describe("HighlightList", () => {
  const highlights = [
    { id: "h1", icon: "party", title: "豐富的派對類型", content: "每月至少一次派對" },
    { id: "h2", icon: "skull", title: "社群互動", content: "與志同道合的玩家交流" },
  ];

  it("leads each row with a framed decorative icon, the title and content as supporting text", () => {
    render(<HighlightList highlights={highlights} />);

    const [first, second] = screen.getAllByRole("listitem");
    expect(within(first).getByRole("heading", { level: 3, name: "豐富的派對類型" })).toHaveClass("text-lead");
    expect(within(first).getByText("每月至少一次派對")).toHaveClass("text-caption");
    expect(first).toHaveTextContent("01");
    const icon = first.querySelector("svg[data-highlight-icon]");
    expect(icon).toHaveAttribute("data-highlight-icon", "party");
    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(icon?.parentElement).toHaveClass("size-16", "border");
    // An unknown code still shows the row, with the fallback drawing.
    expect(within(second).getByRole("heading", { name: "社群互動" })).toBeInTheDocument();
    expect(second.querySelector("svg")?.getAttribute("class")).toContain("lucide-sparkles");
  });
});
