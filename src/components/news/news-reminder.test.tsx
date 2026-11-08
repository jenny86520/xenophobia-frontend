import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { NewsReminder } from "./news-reminder";

const mockAcknowledge = jest.fn();
jest.mock("@/app/news/actions", () => ({
  acknowledgeNewsAction: (formData: FormData) => mockAcknowledge(formData),
}));

const reminder = (id: string, title: string) => ({
  id,
  title,
  // 16:00Z is the next day in Taiwan.
  publishAt: "2026-11-07T16:00:00.000Z",
  excerpt: `${title}的開頭`,
});

beforeEach(() => mockAcknowledge.mockReset());

describe("NewsReminder", () => {
  it("renders nothing without reminders", () => {
    const { container } = render(<NewsReminder reminders={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("lists every reminder in one dialog with a link to its full text", () => {
    render(<NewsReminder reminders={[reminder("b", "點數商店上線"), reminder("a", "冰炫風")]} />);

    const dialog = screen.getByRole("dialog", { name: "最新消息" });
    expect(
      within(dialog)
        .getAllByRole("heading", { level: 3 })
        .map((h) => h.textContent),
    ).toEqual(["點數商店上線", "冰炫風"]);
    expect(within(dialog).getAllByText("2026-11-08", { selector: "time" })).toHaveLength(2);
    expect([...dialog.querySelectorAll<HTMLInputElement>("input[name=ids]")].map((input) => input.value)).toEqual([
      "b",
      "a",
    ]);
    expect(within(dialog).getByRole("button", { name: /^看全文\s?：點數商店上線$/ })).toHaveAttribute("value", "/news/b");
    expect(within(dialog).getByRole("button", { name: "知道了" })).toHaveAttribute("type", "submit");
  });

  it("counts closing with Esc as seen", async () => {
    render(<NewsReminder reminders={[reminder("b", "點數商店上線")]} />);

    await act(async () => {
      fireEvent(screen.getByRole("dialog", { hidden: true }), new Event("cancel", { cancelable: true }));
    });
    await waitFor(() => expect(mockAcknowledge).toHaveBeenCalledTimes(1));
    expect((mockAcknowledge.mock.calls[0][0] as FormData).getAll("ids")).toEqual(["b"]);
  });
});
