import { CalendarClock, CircleCheck, CircleSlash } from "lucide-react";
import { EditorialGrid } from "@/components/brand/editorial-grid";
import { Eyebrow } from "@/components/brand/eyebrow";
import { formatCount } from "@/components/brand/meta-label";
import { Section } from "@/components/brand/section";
import { TextLink } from "@/components/brand/text-link";
import { Heading } from "@/components/brand/typography";
import type {
  MemberRegistrationView,
  RegistrationBlock,
  RegistrationStatus,
  RegistrationSummary,
} from "@/types/member";
import { RegistrationButton } from "./registration-button";

const STATUS_TEXT: Record<RegistrationStatus, string> = {
  open: "開放報名中",
  "not-open": "未開放報名",
  closed: "報名已截止",
};

const STATUS_ICON = { open: CircleCheck, "not-open": CircleSlash, closed: CalendarClock } as const;

/** Wording for the backend's reason; the decision itself is the backend's. */
const BLOCK_TEXT: Record<Exclude<RegistrationBlock, null>, string> = {
  "not-open": "此活動未開放報名",
  closed: "報名已截止",
  "no-permission": "你的角色沒有報名活動的權限",
  "role-not-allowed": "此活動限定特定角色報名",
};

/** "2026-11-01T18:00" (already Taiwan time) → "11/01 18:00". */
function formatDeadline(deadline: string): string {
  return `${deadline.slice(5, 10).replace("-", "/")} ${deadline.slice(11, 16)}`;
}

type Props = {
  partyId: string;
  /** Public state from the party detail (count only). */
  summary: RegistrationSummary;
  /** The signed-in member's view with the participant list, or null for visitors. */
  member: MemberRegistrationView | null;
};

/** Registration block of a party page: status, count, the member's 參加 button and the participant list. */
export function PartyRegistration({ partyId, summary, member }: Props) {
  const state = member ?? summary;
  const StatusIcon = STATUS_ICON[state.status];

  return (
    <Section labelledBy="registration-title" ruled>
      <EditorialGrid className="gap-y-8">
        <div className="col-span-4 flex flex-col gap-4 md:col-span-8 lg:col-span-4">
          <Eyebrow>{`Registration / ${formatCount(state.count)}`}</Eyebrow>
          <Heading level={2} id="registration-title">
            報名
          </Heading>
        </div>
        <div className="col-span-4 flex flex-col gap-6 md:col-span-8 lg:col-span-8 lg:col-start-5">
          <p className="flex flex-wrap items-center gap-x-4 gap-y-2 text-lead text-ink">
            <span className="inline-flex items-center gap-2">
              <StatusIcon aria-hidden="true" className="size-5 text-signal" />
              {STATUS_TEXT[state.status]}
            </span>
            <span className="text-ink-secondary">{state.count} 人參加</span>
            {state.deadline && (
              <span className="text-ink-secondary">截止：{formatDeadline(state.deadline)}（台灣時間）</span>
            )}
          </p>

          {member ? (
            <>
              {member.registered && <p className="text-body text-ink">你已報名這個活動。</p>}
              <RegistrationButton
                partyId={partyId}
                intent={member.registered ? "leave" : "join"}
                blockedReason={member.blockedBy ? BLOCK_TEXT[member.blockedBy] : null}
              />
              <div className="flex flex-col gap-3">
                <Heading level={3} id="participants-title">
                  參加者
                </Heading>
                {member.participants.length === 0 ? (
                  <p className="text-body text-ink-secondary">目前還沒有人報名。</p>
                ) : (
                  <ol aria-labelledby="participants-title" className="border-t border-line">
                    {member.participants.map((participant) => (
                      <li
                        key={`${participant.discordId}-${participant.registeredAt}`}
                        className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-line py-3"
                      >
                        <span className="text-body text-ink">
                          {participant.nickname}
                          {participant.guest && <span className="ml-2 font-mono text-meta text-ink-muted">非會員</span>}
                        </span>
                        <span className="font-mono text-meta text-ink-secondary">{participant.discordId || "—"}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </>
          ) : (
            state.status === "open" && (
              <p className="text-body text-ink-secondary">
                會員登入後即可報名。<TextLink href="/member/login">會員登入</TextLink>
              </p>
            )
          )}
        </div>
      </EditorialGrid>
    </Section>
  );
}
