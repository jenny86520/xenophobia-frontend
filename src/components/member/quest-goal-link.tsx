import { TextLink } from "@/components/brand/text-link";
import { OpenFriendsButton } from "@/components/friends/open-friends-button";
import { questGoal } from "@/utils/quests";

/**
 * 「去完成」 for a quest not done yet: a link to the page where it is done, or, for the first friend,
 * a button opening the friends sidebar on the page the member is on. Nothing for a quest this site
 * does not know yet.
 */
export function QuestGoalLink({ code }: { code: string }) {
  const goal = questGoal(code);
  if (!goal) return null;
  if (goal.kind === "friends-panel") {
    return <OpenFriendsButton className="link-underline cursor-pointer text-left">去完成</OpenFriendsButton>;
  }
  return <TextLink href={goal.href}>去完成</TextLink>;
}
