import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { checkInAction } from "@/app/member/actions";
import { CheckInPanel } from "./check-in-panel";

jest.mock("@/app/member/actions", () => ({ checkInAction: jest.fn() }));

const mockedAction = checkInAction as jest.Mock;

function renderPanel(checkedInToday = false) {
  return render(
    <CheckInPanel
      checkedInToday={checkedInToday}
      balance={<p>12 點</p>}
      campaign={<div data-testid="campaign" />}
    />,
  );
}

describe("CheckInPanel", () => {
  beforeEach(() => mockedAction.mockReset());

  it("arms the stamp animation once it has mounted, but plays nothing yet", () => {
    const { container } = renderPanel();

    const root = container.firstElementChild!;
    expect(root).toHaveAttribute("data-stamp-armed");
    expect(root).not.toHaveAttribute("data-just-checked-in");
    expect(screen.getByText("12 點")).toBeInTheDocument();
    expect(screen.getByTestId("campaign")).toBeInTheDocument();
  });

  it("marks a successful check-in so today's stamp lands, and shows the message", async () => {
    mockedAction.mockResolvedValue({ ok: true, message: "簽到成功，獲得 1 點。" });
    const { container } = renderPanel();

    fireEvent.click(screen.getByRole("button", { name: "簽到 +1" }));

    expect(await screen.findByRole("status")).toHaveTextContent("簽到成功，獲得 1 點。");
    expect(container.firstElementChild).toHaveAttribute("data-just-checked-in");
  });

  it("plays no stamp when the check-in is refused", async () => {
    mockedAction.mockResolvedValue({ ok: false, message: "今天已經簽到過了" });
    const { container } = renderPanel();

    fireEvent.click(screen.getByRole("button", { name: "簽到 +1" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("今天已經簽到過了");
    await waitFor(() => expect(mockedAction).toHaveBeenCalled());
    expect(container.firstElementChild).not.toHaveAttribute("data-just-checked-in");
  });

  it("says so instead of offering the button once checked in", () => {
    renderPanel(true);

    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByText("今天已簽到")).toBeInTheDocument();
  });
});
