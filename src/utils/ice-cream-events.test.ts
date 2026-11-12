import type { IceEvent } from "@/types/ice-cream";
import { ICE_STATUS_TEXT, describeIceEvent } from "./ice-cream-events";

const event = (type: string, actor: string | null, target: string | null): IceEvent => ({
  id: "e1",
  serial: 12,
  iceCreamId: "i1",
  type,
  actor: actor ? { nickname: actor } : null,
  target: target ? { nickname: target } : null,
  note: "",
  createdAt: "2026-11-12T06:30:00.000Z",
});

describe("describeIceEvent", () => {
  it("words the physical redemption the holder confirms", () => {
    expect(describeIceEvent(event("physical_claimed", "阿明", "小華"))).toBe("阿明 說請 小華 吃了一支，等驗收");
    expect(describeIceEvent(event("physical_confirmed", "小華", "小華"))).toBe("小華 確認吃到了，功成身退");
    expect(describeIceEvent(event("physical_disputed", "小華", "阿明"))).toBe("小華 說沒吃到，退回兌換中");
    expect(describeIceEvent(event("physical_auto_confirmed", null, "小華"))).toBe(
      "72 小時沒回應，當作 小華 吃到了，功成身退",
    );
  });

  it("shows an unknown code as it is", () => {
    expect(describeIceEvent(event("something_new", "阿明", null))).toBe("something_new");
  });
});

describe("ICE_STATUS_TEXT", () => {
  it("names the waiting state", () => {
    expect(ICE_STATUS_TEXT.confirming).toBe("等驗收");
  });
});
