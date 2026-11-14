import { Sparkles, UserPlus } from "lucide-react";
import { questGoal, questIcon } from "./quests";

describe("quest looks", () => {
  it("leads each known quest to where it is done", () => {
    // Friends live in the sidebar every page has, so that quest opens it instead of a page.
    expect(questGoal("friend")).toEqual({ kind: "friends-panel" });
    expect(questGoal("checkin")).toEqual({ kind: "link", href: "/member?tab=points" });
    expect(questGoal("party")).toEqual({ kind: "link", href: "/party" });
    expect(questIcon("friend")).toBe(UserPlus);
  });

  it("gives an unknown quest the default icon and no goal", () => {
    expect(questGoal("something_new")).toBeNull();
    expect(questIcon("something_new")).toBe(Sparkles);
  });
});
