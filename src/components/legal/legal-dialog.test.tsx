import { render, within } from "@testing-library/react";
import type { LegalDocument } from "@/types/legal";
import { LegalDialog } from "./legal-dialog";

const terms: LegalDocument = {
  key: "terms",
  title: "使用條款",
  content: "# 一、總則\n使用本站即表示同意。\n- 遵守法律\n- 尊重他人\n\n<script>alert(1)</script>",
  version: 2,
  // 2026-10-31T17:00Z is 2026-11-01 in Taiwan.
  updatedAt: "2026-10-31T17:00:00.000Z",
};

describe("LegalDialog", () => {
  it("is a popover dialog named by its title, with a close button that takes focus", () => {
    const { container } = render(<LegalDialog kind="terms" document={terms} />);

    const dialog = container.querySelector("#legal-terms") as HTMLElement;
    expect(dialog).toHaveAttribute("popover", "auto");
    expect(dialog).toHaveAttribute("role", "dialog");
    expect(dialog).toHaveAccessibleName("使用條款");
    expect(dialog).toHaveClass("legal-dialog");
    const close = within(dialog).getByRole("button", { name: "關閉", hidden: true });
    expect(close).toHaveAttribute("popovertarget", "legal-terms");
    expect(close).toHaveAttribute("popovertargetaction", "hide");
  });

  it("shows the eyebrow, the Taiwan date and the laid-out text, never as HTML", () => {
    const { container } = render(<LegalDialog kind="terms" document={terms} />);
    const dialog = container.querySelector("#legal-terms") as HTMLElement;

    expect(dialog).toHaveTextContent("Legal / terms");
    expect(dialog).toHaveTextContent("Updated 2026-11-01");
    expect(within(dialog).getByRole("heading", { level: 3, name: "一、總則", hidden: true })).toBeInTheDocument();
    expect(
      within(dialog)
        .getAllByRole("listitem", { hidden: true })
        .map((li) => li.textContent),
    ).toEqual(["遵守法律", "尊重他人"]);
    expect(within(dialog).getByText("<script>alert(1)</script>")).toBeInTheDocument();
    expect(dialog.querySelector("script")).toBeNull();
  });

  it("shows a placeholder until the document is published", () => {
    const { container } = render(
      <LegalDialog
        kind="privacy"
        document={{ ...terms, key: "privacy", title: "隱私權政策", content: "  ", version: 0, updatedAt: null }}
      />,
    );

    expect(container.querySelector('[data-placeholder="legal.privacy"]')).toHaveTextContent("待提供：隱私權政策");
    expect(container).not.toHaveTextContent("Updated");
  });

  it("says it cannot load when the backend failed", () => {
    const { container } = render(<LegalDialog kind="privacy" document={null} />);

    expect(container).toHaveTextContent("隱私權政策");
    expect(container).toHaveTextContent("目前無法載入，請稍後再試。");
  });
});
