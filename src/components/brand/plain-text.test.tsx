import { render, screen } from "@testing-library/react";
import { PlainText } from "./plain-text";

const TEXT = "歡迎參加\n第二行\n\n# 流程\n- 19:00 報到\n- 19:30 開始\n\n<b>粗體</b>";

describe("PlainText", () => {
  it("lays out headings, lists and paragraphs with line breaks kept", () => {
    const { container } = render(<PlainText text={TEXT} />);
    expect(screen.getByRole("heading", { level: 3, name: "流程" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual(["19:00 報到", "19:30 開始"]);
    const first = container.querySelector("p");
    expect(first?.textContent).toBe("歡迎參加第二行");
    expect(first?.querySelectorAll("br")).toHaveLength(1);
  });

  it("never reads the text as HTML", () => {
    const { container } = render(<PlainText text={TEXT} />);
    expect(screen.getByText("<b>粗體</b>")).toBeInTheDocument();
    expect(container.querySelector("b")).toBeNull();
  });

  it.each([2, 3, 4] as const)("renders headings at level %i", (level) => {
    render(<PlainText text="# 注意事項" headingLevel={level} />);
    expect(screen.getByRole("heading", { level, name: "注意事項" })).toBeInTheDocument();
  });

  it("lets a className replace the type size", () => {
    const { container } = render(<PlainText text="說明" className="max-w-[60ch] text-lead" />);
    const wrapper = container.firstElementChild;
    expect(wrapper).toHaveClass("text-lead", "max-w-[60ch]");
    expect(wrapper).not.toHaveClass("text-body", "max-w-[65ch]");
  });
});
