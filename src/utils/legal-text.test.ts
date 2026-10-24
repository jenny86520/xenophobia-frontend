import { parseLegalText } from "./legal-text";

describe("parseLegalText", () => {
  it("splits headings, paragraphs and lists", () => {
    const text = [
      "# 一、蒐集的資料",
      "我們蒐集以下資料：",
      "- 姓名",
      "- email",
      "",
      "第二段第一行",
      "第二段第二行",
      "",
      "",
      "# 二、聯絡方式",
      "請寄信給我們。",
    ].join("\n");

    expect(parseLegalText(text)).toEqual([
      { type: "heading", text: "一、蒐集的資料" },
      { type: "paragraph", lines: ["我們蒐集以下資料："] },
      { type: "list", items: ["姓名", "email"] },
      { type: "paragraph", lines: ["第二段第一行", "第二段第二行"] },
      { type: "heading", text: "二、聯絡方式" },
      { type: "paragraph", lines: ["請寄信給我們。"] },
    ]);
  });

  it("handles Windows line breaks and an empty document", () => {
    expect(parseLegalText("a\r\nb\r\n\r\n- c")).toEqual([
      { type: "paragraph", lines: ["a", "b"] },
      { type: "list", items: ["c"] },
    ]);
    expect(parseLegalText("")).toEqual([]);
    expect(parseLegalText("  \n\n ")).toEqual([]);
  });

  it("keeps markup as plain text", () => {
    expect(parseLegalText("<script>alert(1)</script>")).toEqual([
      { type: "paragraph", lines: ["<script>alert(1)</script>"] },
    ]);
    // Only "# " (with the space) starts a heading.
    expect(parseLegalText("#1 rule")).toEqual([{ type: "paragraph", lines: ["#1 rule"] }]);
  });
});
