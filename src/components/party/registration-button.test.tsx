import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { RegistrationButton } from "./registration-button";

/** The server component hands the button `registrationAction` already bound. */
const mockedAction = jest.fn();

describe("RegistrationButton", () => {
  beforeEach(() => mockedAction.mockReset());

  it("shows no text after a successful sign-up or leave", async () => {
    mockedAction.mockResolvedValue({ ok: true });
    render(<RegistrationButton action={mockedAction} subPartyId="s1" intent="join" blockedReason={null} />);

    fireEvent.click(screen.getByRole("button", { name: "參加" }));

    await waitFor(() => expect(mockedAction).toHaveBeenCalledWith(expect.anything(), expect.anything()));
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.queryByText(/已報名|已取消報名/)).toBeNull();
  });

  it("shows the backend's refusal to the right of the button", async () => {
    mockedAction.mockResolvedValue({ ok: false, message: "請先報名主派對" });
    render(<RegistrationButton action={mockedAction} subPartyId="s1" intent="join" blockedReason={null} />);

    const button = screen.getByRole("button", { name: "參加" });
    fireEvent.click(button);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("請先報名主派對");
    expect(alert.parentElement).toBe(button.parentElement);
  });

  it("keeps the reason for a disabled button below it", () => {
    render(<RegistrationButton action={mockedAction} intent="join" blockedReason="請先報名主派對" />);

    const button = screen.getByRole("button", { name: "參加" });
    expect(button).toBeDisabled();
    expect(button).toHaveAccessibleDescription("請先報名主派對");
    expect(screen.getByText("請先報名主派對").parentElement).not.toBe(button.parentElement);
  });
});
