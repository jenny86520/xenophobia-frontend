import { resolvePartyLifecycleStatus } from "./party-lifecycle";

describe("resolvePartyLifecycleStatus", () => {
  it("returns 'ended' when the party status is 'expired'", () => {
    expect(resolvePartyLifecycleStatus("expired")).toBe("ended");
  });

  it("returns 'ongoing' for any other party status", () => {
    expect(resolvePartyLifecycleStatus("active")).toBe("ongoing");
    expect(resolvePartyLifecycleStatus("all")).toBe("ongoing");
  });
});
