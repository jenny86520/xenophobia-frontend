import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MatchTitleForm } from "./match-forms";

// The module still imports createMatchAction; the real actions pull in next/cache.
jest.mock("@/app/matches/actions", () => ({ createMatchAction: jest.fn() }));

/** The server component hands the form `matchTitleAction` already bound to the match. */
const matchTitleAction = jest.fn();

it("sends the title and shows the backend's refusal on the field, keeping what was typed", async () => {
  matchTitleAction.mockResolvedValue({
    ok: false,
    message: "請填寫標題",
    fields: { title: "標題最多 60 字" },
    values: { title: "長".repeat(61) },
  });
  render(<MatchTitleForm rename={matchTitleAction} current="週五晚場" />);
  const field = screen.getByRole("textbox", { name: /場次標題/ });
  expect(field).toHaveValue("週五晚場");
  expect(field).toBeRequired();

  fireEvent.change(field, { target: { value: "長".repeat(61) } });
  fireEvent.click(screen.getByRole("button", { name: "儲存標題" }));

  await waitFor(() =>
    expect(screen.getByRole("textbox", { name: /場次標題/ })).toHaveAccessibleDescription(/標題最多 60 字/),
  );
  const form = matchTitleAction.mock.calls[0][1] as FormData;
  expect(form.get("title")).toBe("長".repeat(61));
  expect(screen.getByRole("textbox", { name: /場次標題/ })).toHaveValue("長".repeat(61));
});
