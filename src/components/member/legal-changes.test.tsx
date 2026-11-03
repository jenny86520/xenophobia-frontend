import { render, screen } from "@testing-library/react";
import type { LegalConsentChangesDocument } from "@/types/member";
import { LegalChanges } from "./legal-changes";

type Comparison = LegalConsentChangesDocument["comparison"];

const renderChanges = (comparison: Comparison) => render(<LegalChanges title="使用條款" comparison={comparison} />);

describe("LegalChanges", () => {
  it("marks the words rewritten within a line, and labels the line for screen readers", () => {
    renderChanges({
      fromVersion: 2,
      blocks: [
        { kind: "unchanged", lines: ["# 退出"] },
        {
          kind: "changed",
          removed: [
            [
              { text: "會員可於", change: "same" },
              { text: "三十", change: "removed" },
              { text: "日內申請退出。", change: "same" },
            ],
          ],
          added: [
            [
              { text: "會員可於", change: "same" },
              { text: "十四", change: "added" },
              { text: "日內申請退出。", change: "same" },
            ],
          ],
        },
      ],
    });

    expect(screen.getByText(/與你同意的第 2 版相比/)).toBeInTheDocument();
    const changes = screen.getByRole("region", { name: "使用條款的變更" });
    expect(changes).toHaveAttribute("tabindex", "0");
    expect(changes).toHaveTextContent("未變動：# 退出");
    expect(changes).toHaveTextContent("修改前：會員可於三十日內申請退出。");
    expect(changes).toHaveTextContent("修改後：會員可於十四日內申請退出。");
    expect(screen.getByText("三十").tagName).toBe("DEL");
    expect(screen.getByText("十四").tagName).toBe("INS");
  });

  it("marks whole lines added or removed, and folds unchanged ones", () => {
    renderChanges({
      fromVersion: 1,
      blocks: [
        { kind: "omitted", lineCount: 7 },
        { kind: "changed", removed: [[{ text: "舊段落", change: "removed" }]], added: [] },
        { kind: "changed", removed: [], added: [[{ text: "新段落", change: "added" }]] },
      ],
    });

    const changes = screen.getByRole("region", { name: "使用條款的變更" });
    expect(changes).toHaveTextContent("省略 7 行未變動");
    expect(changes).toHaveTextContent("刪除：舊段落");
    expect(changes).toHaveTextContent("新增：新段落");
    expect(screen.getByText("舊段落").tagName).toBe("DEL");
    expect(screen.getByText("新段落").tagName).toBe("INS");
  });

  it("asks to read the full text when there is nothing to compare with", () => {
    renderChanges(null);
    expect(screen.getByText("沒有你先前同意版本的紀錄，請點文件名稱閱讀全文。")).toBeInTheDocument();
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("says so when the text is the same as the agreed version", () => {
    renderChanges({ fromVersion: 2, blocks: [] });
    expect(screen.getByText("內容與你先前同意的第 2 版相同。")).toBeInTheDocument();
  });

  it("shows HTML in the text as text", () => {
    const { container } = renderChanges({
      fromVersion: 2,
      blocks: [{ kind: "changed", removed: [], added: [[{ text: "<b>粗體</b>", change: "added" }]] }],
    });
    expect(screen.getByText("<b>粗體</b>")).toBeInTheDocument();
    expect(container.querySelector("b")).toBeNull();
  });
});
