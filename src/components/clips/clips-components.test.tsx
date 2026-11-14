import { fireEvent, render, screen, within } from "@testing-library/react";
import { ClipVoteForm } from "./clip-vote-form";
import { ReportClipDialog } from "./report-clip-dialog";

const noop = jest.fn().mockResolvedValue({});

describe("ClipVoteForm", () => {
  it("sends a like when nothing is chosen, and marks nothing pressed", () => {
    render(<ClipVoteForm vote={noop} likes={2} dislikes={0} myVote={null} disabled={false} />);

    const like = screen.getByRole("button", { name: /讚/ });
    expect(like).toHaveAttribute("value", "like");
    expect(like).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: /爛/ })).toHaveAttribute("value", "dislike");
  });

  it("takes a like back when pressed again and switches straight to a dislike", () => {
    render(<ClipVoteForm vote={noop} likes={3} dislikes={0} myVote="like" disabled={false} />);

    const like = screen.getByRole("button", { name: /讚/ });
    expect(like).toHaveAttribute("aria-pressed", "true");
    expect(like).toHaveAttribute("value", "");
    expect(screen.getByRole("button", { name: /爛/ })).toHaveAttribute("value", "dislike");
  });

  it("is one plain form with named submit buttons, so it works without JavaScript", () => {
    const { container } = render(
      <ClipVoteForm vote={noop} likes={0} dislikes={0} myVote={null} disabled={false} />,
    );
    const buttons = container.querySelectorAll("form button[type=submit][name=vote]");
    expect(buttons).toHaveLength(2);
  });

  it("disables both buttons when voting is not possible", () => {
    render(<ClipVoteForm vote={noop} likes={0} dislikes={0} myVote={null} disabled />);

    for (const button of screen.getAllByRole("button")) expect(button).toBeDisabled();
  });
});

describe("ReportClipDialog", () => {
  const props = {
    report: noop,
    videoId: "v1",
    title: "殘局 1v3｜小明",
    reported: false,
    canReport: true,
    disabledReason: null,
  };

  it("opens a dialog holding the categories, the required explanation and the submit", () => {
    render(<ReportClipDialog {...props} />);

    const opener = screen.getByRole("button", { name: "檢舉" });
    expect(opener).toHaveAttribute("popovertarget", "report-clip-v1");
    const dialog = within(document.getElementById("report-clip-v1") as HTMLElement);
    expect(dialog.getAllByRole("radio")).toHaveLength(5);
    expect(dialog.getByRole("radio", { name: "不當內容" })).toBeChecked();
    expect(dialog.getByRole("textbox", { name: "說明" })).toBeRequired();
    expect(dialog.getByRole("button", { name: "送出檢舉" })).toHaveAttribute("type", "submit");
    expect(dialog.getByRole("button", { name: "送出檢舉" }).closest("form")).not.toBeNull();
  });

  it("shows the backend's refusal and field error inside the dialog, keeping what was typed", async () => {
    const report = jest.fn().mockResolvedValue({
      ok: false,
      message: "今天的檢舉次數已用完（每天最多 5 筆），請明天再試",
      fields: { detail: "請說明檢舉的原因" },
      values: { category: "infringement", detail: "盜用" },
    });
    render(<ReportClipDialog {...props} report={report} />);

    const dialog = within(document.getElementById("report-clip-v1") as HTMLElement);
    fireEvent.change(dialog.getByRole("textbox", { name: "說明" }), { target: { value: "盜用" } });
    fireEvent.submit(dialog.getByRole("button", { name: "送出檢舉" }).closest("form") as HTMLFormElement);

    expect(await dialog.findByRole("alert")).toHaveTextContent("今天的檢舉次數已用完");
    expect(dialog.getByRole("textbox", { name: "說明" })).toHaveAccessibleDescription(/請說明檢舉的原因/);
    expect(dialog.getByRole("radio", { name: "侵權" })).toBeChecked();
  });

  it("shows 已檢舉 instead of the button once reported", () => {
    render(<ReportClipDialog {...props} reported canReport={false} />);

    expect(screen.queryByRole("button", { name: "檢舉" })).toBeNull();
    expect(screen.getByText("已檢舉")).toBeInTheDocument();
  });

  it("shows nothing for the member's own clip", () => {
    const { container } = render(<ReportClipDialog {...props} canReport={false} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("disables the button with the reason while reporting is paused", () => {
    render(<ReportClipDialog {...props} disabledReason="影片檢舉目前暫停" />);

    const opener = screen.getByRole("button", { name: "檢舉" });
    expect(opener).toBeDisabled();
    expect(opener).toHaveAttribute("title", "影片檢舉目前暫停");
  });
});
