import { act, fireEvent, render, screen } from "@testing-library/react";
import { updateProfileAction } from "@/app/member/actions";
import { ProfileForm } from "./member-forms";

jest.mock("@/app/member/actions", () => ({ updateProfileAction: jest.fn() }));

describe("ProfileForm", () => {
  it("prefills the stored 稱呼 and nickname", () => {
    render(<ProfileForm name="王小明" nickname="小明" />);
    expect(screen.getByLabelText("稱呼")).toHaveValue("王小明");
    expect(screen.getByLabelText("暱稱")).toHaveValue("小明");
    expect(screen.getByRole("button", { name: "儲存個人資料" })).toBeInTheDocument();
  });

  it("shows each field's error beside it and keeps what was typed", async () => {
    (updateProfileAction as jest.Mock).mockResolvedValue({
      ok: false,
      message: "儲存失敗",
      fields: { name: "稱呼太長", nickname: "暱稱不能空白" },
      values: { name: "很長的稱呼", nickname: "" },
    });
    render(<ProfileForm name="王小明" nickname="小明" />);

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: "儲存個人資料" }).closest("form") as HTMLFormElement);
    });

    expect(await screen.findByText("稱呼太長")).toBeInTheDocument();
    expect(screen.getByText("暱稱不能空白")).toBeInTheDocument();
    expect(screen.getByLabelText("稱呼")).toHaveValue("很長的稱呼");
    expect(screen.getByLabelText("暱稱")).toHaveValue("");
  });
});
