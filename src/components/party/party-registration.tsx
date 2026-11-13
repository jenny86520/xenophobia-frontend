import { CalendarClock, CircleCheck, CirclePause, CircleSlash, UserCheck } from "lucide-react";
import { Eyebrow } from "@/components/brand/eyebrow";
import { InfoDialog } from "@/components/brand/info-dialog";
import { formatCount } from "@/components/brand/meta-label";
import { TextLink } from "@/components/brand/text-link";
import { cn } from "@/lib/utils";
import type {
  MemberRegistrationView,
  Participant,
  RegistrationBlock,
  RegistrationStatus,
  RegistrationSummary,
} from "@/types/member";
import { RegistrationButton } from "./registration-button";
import { MemberTitleTag } from "@/components/cosmetics/member-title-tag";

const STATUS_TEXT: Record<RegistrationStatus, string> = {
  open: "開放報名中",
  "not-open": "未開放報名",
  closed: "報名已截止",
};

const STATUS_ICON = { open: CircleCheck, "not-open": CircleSlash, closed: CalendarClock } as const;

/** Shown instead of 開放報名中 while the admin has switched registration off site-wide. */
const PAUSED_TEXT = "活動報名目前暫停";

/** Wording for the backend's reason; the decision itself is the backend's. */
export const BLOCK_TEXT: Record<Exclude<RegistrationBlock, null>, string> = {
  "not-open": "此活動未開放報名",
  closed: "報名已截止",
  paused: PAUSED_TEXT,
  "no-permission": "你的角色沒有報名活動的權限",
  "role-not-allowed": "此活動限定特定角色報名",
  "main-required": "請先報名主派對",
};

/** "2026-11-01T18:00" (already Taiwan time) → "11/01 18:00". */
function formatDeadline(deadline: string): string {
  return `${deadline.slice(5, 10).replace("-", "/")} ${deadline.slice(11, 16)}`;
}

/** Status in words with its icon and, when set, the deadline (the count is `ParticipantCount`). */
export function RegistrationStatusLine({
  state,
  className,
  registered = false,
}: {
  state: Pick<RegistrationSummary, "status" | "paused" | "deadline">;
  className?: string;
  /** The signed-in member is on the list: shown as 已報名 on the same line. */
  registered?: boolean;
}) {
  // A paused site only matters while the party itself is open.
  const paused = state.paused && state.status === "open";
  const StatusIcon = paused ? CirclePause : STATUS_ICON[state.status];
  return (
    <p className={className ?? "flex flex-wrap items-center gap-x-4 gap-y-2 text-lead text-ink"}>
      <span className="inline-flex items-center gap-2">
        <StatusIcon aria-hidden="true" className="size-5 text-signal" />
        {paused ? PAUSED_TEXT : STATUS_TEXT[state.status]}
      </span>
      {registered && (
        <span className="inline-flex items-center gap-1.5 text-ink">
          <UserCheck aria-hidden="true" className="size-4 text-signal" />
          已報名
        </span>
      )}
      {state.deadline && (
        <span className="text-ink-secondary">截止：{formatDeadline(state.deadline)}（台灣時間）</span>
      )}
    </p>
  );
}

/** For visitors while registration is open: one link, to sign in. */
export function SignInToRegister() {
  return (
    <p className="text-body text-ink-secondary">
      <TextLink href="/member/login">登入會員</TextLink>後即可報名。
    </p>
  );
}

/** Visitors see how to register only while registration is actually open. */
export function canVisitorsRegister(state: Pick<RegistrationSummary, "status" | "paused">): boolean {
  return state.status === "open" && !state.paused;
}

/**
 * 「N 人參加」: for a signed-in member it opens the participant list (a disclosure, so it works without
 * JavaScript); visitors, who never get names, see the count alone.
 */
export function ParticipantCount({
  count,
  participants,
  id,
  context,
}: {
  count: number;
  /** null for visitors. */
  participants: Participant[] | null;
  /** Names the list; unique on the page. */
  id: string;
  /** Read before the count by screen readers when several lists share a page, e.g. 「第一場」. */
  context?: string;
}) {
  if (!participants) return <p className="text-body text-ink-secondary">{count} 人參加</p>;
  return (
    <details>
      <summary id={id} className="cursor-pointer text-body text-ink-secondary hover:text-ink">
        {context && <span className="sr-only">{context}</span>}
        {count} 人參加
      </summary>
      <div className="mt-2">
        <ParticipantList participants={participants} labelledBy={id} />
      </div>
    </details>
  );
}

/** The participants a signed-in member may see: nickname with a member's equipped title, Discord ID, guests marked 非會員. */
export function ParticipantList({ participants, labelledBy }: { participants: Participant[]; labelledBy: string }) {
  if (participants.length === 0) {
    return <p className="text-body text-ink-secondary">目前還沒有人報名。</p>;
  }
  return (
    <ol aria-labelledby={labelledBy} className="border-t border-line">
      {participants.map((participant) => (
        <li
          key={`${participant.discordId}-${participant.registeredAt}`}
          className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-line py-3"
        >
          <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-body text-ink">
            {participant.nickname}
            <MemberTitleTag look={participant.memberTitle} />
            {participant.guest && <span className="font-mono text-meta text-ink-muted">非會員</span>}
          </span>
          <span className="font-mono text-meta text-ink-secondary">{participant.discordId || "—"}</span>
        </li>
      ))}
    </ol>
  );
}

type Props = {
  partyId: string;
  /** Public state from the party detail (count only). */
  summary: RegistrationSummary;
  /** The signed-in member's view with the participant list, or null for visitors. */
  member: MemberRegistrationView | null;
};

/**
 * The party's registration, shown as the third column beside its title: status, count, the
 * member's 參加 button and the participant list (behind a disclosure, like each sub-party's).
 */
export function PartyRegistration({ partyId, summary, member }: Props) {
  const state = member ?? summary;
  const subPartySignUps = member?.subParties.filter((sub) => sub.registered).length ?? 0;

  return (
    // No visible heading: the column sits beside the party title; the region keeps its name.
    <section aria-label="報名" className="flex flex-col gap-4 border-t border-line pt-4">
      <Eyebrow>{`Registration / ${formatCount(state.count)}`}</Eyebrow>
      {/* Status on the left, the member's button on the right. With a button the status line gets the
          button's padding, so the two stay level even when a reason shows under a disabled button. */}
      <div className="flex items-start justify-between gap-4">
        <RegistrationStatusLine
          state={state}
          registered={member?.registered}
          className={cn("flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 text-body text-ink", member && "py-3")}
        />
        {member && (
          <div className="flex shrink-0 items-start gap-1">
            {member.registered && subPartySignUps > 0 && !member.blockedBy && (
              <InfoDialog id="leave-sub-parties" title="取消參加會一併取消子派對">
                <p>取消參加時，會一併取消你報名的 {subPartySignUps} 個子派對。</p>
              </InfoDialog>
            )}
            <RegistrationButton
              partyId={partyId}
              intent={member.registered ? "leave" : "join"}
              blockedReason={member.blockedBy ? BLOCK_TEXT[member.blockedBy] : null}
              align="end"
            />
          </div>
        )}
      </div>
      <ParticipantCount count={state.count} participants={member?.participants ?? null} id="participants-title" />
      {!member && canVisitorsRegister(state) && <SignInToRegister />}
    </section>
  );
}
