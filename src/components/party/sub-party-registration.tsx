import { cn } from "@/lib/utils";
import type { MemberRegistrationView, RegistrationSummary } from "@/types/member";
import {
  BLOCK_TEXT,
  ParticipantCount,
  RegistrationStatusLine,
  SignInToRegister,
  canVisitorsRegister,
} from "./party-registration";
import { RegistrationButton } from "./registration-button";

type Props = {
  partyId: string;
  subPartyId: string;
  /** Used to name the participant list. */
  title: string;
  /** Public state: the sub-party's own count with the party's status, deadline and pause. */
  summary: RegistrationSummary;
  /** The signed-in member's party view (which carries every sub-party), or null for visitors. */
  member: MemberRegistrationView | null;
};

/**
 * One sub-party's registration, the third column of its row: its own count and participants, the
 * party's window, and a 參加 button the backend may block (e.g. 請先報名主派對).
 */
export function SubPartyRegistration({ partyId, subPartyId, title, summary, member }: Props) {
  const view = member?.subParties.find((sub) => sub.subPartyId === subPartyId) ?? null;
  const listId = `sub-party-${subPartyId}-participants`;

  return (
    <div className="flex flex-col gap-3 border-t border-line-subtle pt-4 lg:border-t-0 lg:pt-0">
      {/* Status on the left, the member's button on the right. With a button the status line gets the
          button's padding, so the two stay level even when a reason shows under a disabled button. */}
      <div className="flex items-start justify-between gap-4">
        <RegistrationStatusLine
          state={summary}
          registered={view?.registered}
          className={cn("flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 text-body text-ink", member && view && "py-3")}
        />
        {member && view && (
          <div className="shrink-0">
            <RegistrationButton
              partyId={partyId}
              subPartyId={subPartyId}
              intent={view.registered ? "leave" : "join"}
              blockedReason={view.blockedBy ? BLOCK_TEXT[view.blockedBy] : null}
              align="end"
            />
          </div>
        )}
      </div>
      <ParticipantCount
        count={view?.count ?? summary.count}
        participants={view?.participants ?? null}
        id={listId}
        context={`「${title}」`}
      />
      {!(member && view) && canVisitorsRegister(summary) && <SignInToRegister />}
    </div>
  );
}
