import { render, screen, within } from "@testing-library/react";
import type { IceCreamHistory } from "@/types/ice-cream";
import { IceCreamDetailDialog, coverOf } from "./ice-cream-card";

const xmas = { name: "聖誕杯", template: "cup.classic", params: { lineColor: "#ffffff", cupColor: "#c62a2f" } };
const sakura = { name: "櫻花杯", template: "cup.striped", params: { lineColor: "#ffffff", stripeColor: "#ff8fab" } };

const history: IceCreamHistory = {
  iceCream: {
    id: "i20",
    serial: 20,
    origin: "member",
    status: "held",
    issuer: { nickname: "阿明" },
    holder: { nickname: "小華" },
    giftTo: null,
    giftExpiresAt: null,
    confirmExpiresAt: null,
    disputed: false,
    createdAt: "2026-11-01T00:00:00Z",
    endedAt: null,
    cup: sakura,
  },
  events: [
    { id: "e1", serial: 20, iceCreamId: "i20", type: "created", actor: { nickname: "阿明" }, target: null, note: "", cup: null, createdAt: "2026-11-01T00:00:00Z" },
    { id: "e2", serial: 20, iceCreamId: "i20", type: "cup_changed", actor: { nickname: "小華" }, target: null, note: "聖誕杯", cup: xmas, createdAt: "2026-11-02T00:00:00Z" },
    { id: "e3", serial: 20, iceCreamId: "i20", type: "cup_changed", actor: { nickname: "小華" }, target: null, note: "櫻花杯", cup: sakura, createdAt: "2026-11-03T00:00:00Z" },
  ],
};

describe("ice cream cups", () => {
  it("names the current cup and shows each event's cup in the record", () => {
    render(
      <IceCreamDetailDialog id="d" history={history}>
        <p>換杯子表單</p>
      </IceCreamDetailDialog>,
    );
    expect(screen.getByText("杯子").closest("div")).toHaveTextContent("櫻花杯");
    expect(screen.getByText("換杯子表單")).toBeInTheDocument();
    const rows = within(screen.getByRole("list", { name: "冰炫風 #20的一生" })).getAllByRole("listitem");
    expect(rows.map((row) => row.getAttribute("data-event-cup"))).toEqual(["預設杯", "聖誕杯", "櫻花杯"]);
    expect(rows[1].querySelector("svg")).toHaveAttribute("data-cup", "cup.classic");
    expect(rows[0].querySelector("svg")).not.toHaveAttribute("data-cup");
  });

  it("says 預設杯 for a token whose cup never changed, and the cover carries the cup", () => {
    render(<IceCreamDetailDialog id="d" history={{ ...history, iceCream: { ...history.iceCream, cup: null } }} />);
    expect(screen.getByText("杯子").closest("div")).toHaveTextContent("預設杯");
    expect(coverOf(history.iceCream).cup).toEqual(sakura);
  });
});
