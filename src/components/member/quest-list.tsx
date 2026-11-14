import { claimQuestAction } from "@/app/member/actions";
import { Heading } from "@/components/brand/typography";
import type { Quest } from "@/types/quest";
import { questIcon } from "@/utils/quests";
import { FriendActionButton } from "./friend-forms";
import { QuestGoalLink } from "./quest-goal-link";

/** What a quest row offers: claim it, go and do it, or nothing more. */
function QuestAction({ quest }: { quest: Quest }) {
  if (quest.state === "claimable") {
    return <FriendActionButton action={claimQuestAction.bind(null, quest.code)} label="領取" primary />;
  }
  if (quest.state === "claimed") return <span className="text-body text-ink-secondary">已領取</span>;
  return <QuestGoalLink code={quest.code} />;
}

/**
 * The 點數 tab's 新手任務: one hairline row per quest in the backend's order, states from the
 * backend. Nothing renders when the list could not be loaded or every quest is claimed.
 */
export function QuestList({ quests }: { quests: Quest[] | null }) {
  if (!quests || quests.every((quest) => quest.state === "claimed")) return null;
  return (
    <section aria-labelledby="quests-title" className="flex flex-col gap-4 border-t border-line pt-8">
      <Heading level={3} id="quests-title">
        新手任務
      </Heading>
      <ul className="border-t border-line">
        {quests.map((quest) => {
          const Icon = questIcon(quest.code);
          return (
            <li
              key={quest.code}
              data-quest={quest.code}
              className="flex flex-wrap items-center justify-between gap-4 border-b border-line py-3"
            >
              <div className="flex items-start gap-3">
                <Icon aria-hidden="true" className="mt-1 size-5 shrink-0 text-ink-secondary" />
                <div className="flex flex-col gap-1">
                  <span className="text-body text-ink">
                    {quest.title}
                    <span className="ml-2 font-mono text-ink-secondary">+{quest.points} 點</span>
                  </span>
                  <span className="text-caption text-ink-secondary">{quest.description}</span>
                </div>
              </div>
              <QuestAction quest={quest} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
