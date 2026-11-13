import { Sparkles, UserPlus } from "lucide-react";
import { questHref, questIcon } from "./quests";

describe("quest looks", () => {
  it("links each known quest to where it is done", () => {
    expect(questHref("friend")).toBe("/member?tab=friends");
    expect(questHref("checkin")).toBe("/member?tab=points");
    expect(questHref("party")).toBe("/party");
    expect(questIcon("friend")).toBe(UserPlus);
  });

  it("gives an unknown quest the default icon and no link", () => {
    expect(questHref("something_new")).toBeNull();
    expect(questIcon("something_new")).toBe(Sparkles);
  });
});
