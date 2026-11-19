import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { TeamConfirmForm } from "./match-forms";

// The module still imports createMatchAction; the real actions pull in next/cache.
jest.mock("@/app/matches/actions", () => ({ createMatchAction: jest.fn() }));

/** The server component hands the form `confirmTeamsAction` already bound to the match. */
const confirmTeamsAction = jest.fn();

const players = [
  { playerId: "a", name: "阿強", rating: 1500, group: null },
  { playerId: "b", name: "小明", rating: 1400, group: null },
];

it("sends the team names and shows the backend's refusal on the field it names", async () => {
  confirmTeamsAction.mockResolvedValue({
    ok: false,
    message: "分隊不符合規則，請查看標示的欄位",
    fields: { teamBName: "兩隊的隊名不能相同" },
    // As the real action does (keepValues), so the form shows what was typed again.
    values: { teamAName: "Alpha", teamBName: "alpha" },
  });
  render(
    <TeamConfirmForm
      confirm={confirmTeamsAction}
      players={players}
      teamOf={{ a: "A", b: "B" }}
      captainA="a"
      captainB="b"
    />,
  );
  fireEvent.change(screen.getByRole("textbox", { name: "A 隊隊名" }), { target: { value: "Alpha" } });
  fireEvent.change(screen.getByRole("textbox", { name: "B 隊隊名" }), { target: { value: "alpha" } });
  fireEvent.click(screen.getByRole("button", { name: "確認分隊" }));

  await waitFor(() => expect(confirmTeamsAction).toHaveBeenCalled());
  const form = confirmTeamsAction.mock.calls[0][1] as FormData;
  expect([form.get("teamAName"), form.get("teamBName")]).toEqual(["Alpha", "alpha"]);
  const teamB = await screen.findByRole("textbox", { name: "B 隊隊名" });
  await waitFor(() => expect(teamB).toHaveAccessibleDescription(/兩隊的隊名不能相同/));
  expect(teamB).toHaveAttribute("aria-invalid", "true");
  // What was typed comes back, so the manager only fixes the name.
  expect(screen.getByRole("textbox", { name: "A 隊隊名" })).toHaveValue("Alpha");
});
