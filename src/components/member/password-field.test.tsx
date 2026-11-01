import { fireEvent, render, screen } from "@testing-library/react";
import { PasswordField } from "./password-field";

function renderInForm() {
  const onSubmit = jest.fn((event: { preventDefault: () => void }) => event.preventDefault());
  render(
    <form onSubmit={onSubmit} aria-label="登入">
      <PasswordField id="pw" name="password" label="密碼" required />
      <button type="submit">送出</button>
    </form>,
  );
  return { onSubmit };
}

describe("PasswordField", () => {
  it("starts hidden and toggles with a 顯示密碼 button that never submits the form", () => {
    const { onSubmit } = renderInForm();
    const input = screen.getByLabelText("密碼");
    const toggle = screen.getByRole("button", { name: "顯示密碼" });
    expect(input).toHaveAttribute("type", "password");
    expect(toggle).toHaveAttribute("type", "button");
    expect(toggle).toHaveAttribute("aria-pressed", "false");

    fireEvent.change(input, { target: { value: "secret-123" } });
    fireEvent.click(toggle);
    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveValue("secret-123");
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.click(toggle);
    expect(input).toHaveAttribute("type", "password");
  });

  it("hides the password again when the form is submitted", () => {
    renderInForm();
    fireEvent.click(screen.getByRole("button", { name: "顯示密碼" }));
    fireEvent.submit(screen.getByRole("form", { name: "登入" }));
    expect(screen.getByLabelText("密碼")).toHaveAttribute("type", "password");
  });

  it("keeps the label, required tag and error of an ordinary field", () => {
    render(<PasswordField id="pw" name="password" label="密碼" required error="密碼錯誤" />);
    expect(screen.getByLabelText("密碼")).toBeRequired();
    expect(screen.getByLabelText("密碼")).toHaveAccessibleDescription("密碼錯誤");
  });
});
