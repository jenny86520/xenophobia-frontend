import {
  cancelMatchAction,
  generateTeamsAction,
  importPartyAction,
  inviteFriendAction,
  leaveAction,
  lockAction,
  serverAbortAction,
  signUpAction,
  unconfirmTeamsAction,
  unlockAction,
  vetoResetAction,
  vetoUndoAction,
} from "@/app/matches/actions";
import { ActionButton, ConfirmedActionForm } from "./match-forms";

/**
 * The match room's one-step buttons and ticked forms. This is a server module on purpose: each
 * binds its Server Action here and hands it to the client `ActionButton`/`ConfirmedActionForm`,
 * because binding inside a client component made the no-JavaScript submission hang in `next dev`.
 */

export function SignUpButtons({ matchId }: { matchId: string }) {
  return (
    <div className="flex flex-wrap items-start gap-4">
      <ActionButton action={signUpAction.bind(null, matchId, "solo")} label="單人報名" />
      <ActionButton action={signUpAction.bind(null, matchId, "group")} label="建立小隊" secondary />
    </div>
  );
}

/** 邀進小隊 or 邀請報名 for one friend (members only; the backend checks the friendship and the group). */
export function InviteFriendButton({
  matchId,
  memberId,
  kind,
}: {
  matchId: string;
  memberId: string;
  kind: "group" | "signup";
}) {
  return (
    <ActionButton
      action={inviteFriendAction.bind(null, matchId, memberId, kind)}
      label={kind === "group" ? "邀進小隊" : "邀請報名"}
      secondary
    />
  );
}

export function LeaveButton({ matchId }: { matchId: string }) {
  return <ActionButton action={leaveAction.bind(null, matchId)} label="退出報名" secondary />;
}

export function ImportPartyButton({ matchId }: { matchId: string }) {
  return <ActionButton action={importPartyAction.bind(null, matchId)} label="從派對帶入" secondary />;
}

export function LockButton({ matchId }: { matchId: string }) {
  return <ActionButton action={lockAction.bind(null, matchId)} label="鎖定名單" />;
}

export function GenerateTeamsButton({ matchId, again }: { matchId: string; again?: boolean }) {
  return (
    <ActionButton
      action={generateTeamsAction.bind(null, matchId)}
      label={again ? "依目前評分重新計算" : "產生分隊候選"}
      secondary={again}
    />
  );
}

export function UnlockForm({ matchId }: { matchId: string }) {
  return (
    <ConfirmedActionForm
      id="unlock"
      action={unlockAction.bind(null, matchId)}
      label="解除鎖定"
      confirmText="確認解除鎖定，名單回到報名中"
    />
  );
}

export function UnconfirmTeamsForm({ matchId }: { matchId: string }) {
  return (
    <ConfirmedActionForm
      id="unconfirm"
      action={unconfirmTeamsAction.bind(null, matchId)}
      label="退回分隊"
      confirmText="確認退回分隊，清除兩隊、隊長與評分快照，候選依目前評分重新產生"
    />
  );
}

export function CancelMatchForm({ matchId }: { matchId: string }) {
  return (
    <ConfirmedActionForm
      id="cancel"
      action={cancelMatchAction.bind(null, matchId)}
      label="取消場次"
      confirmText="確認取消這場，取消後不能再報名、分隊或 Ban 圖"
    />
  );
}

export function VetoUndoForm({ matchId }: { matchId: string }) {
  return (
    <ConfirmedActionForm
      id="veto-undo"
      action={vetoUndoAction.bind(null, matchId)}
      label="撤銷最近一步"
      confirmText="確認撤銷最近一步，那張地圖回到可選"
    />
  );
}

export function VetoResetForm({ matchId }: { matchId: string }) {
  return (
    <ConfirmedActionForm
      id="veto-reset"
      action={vetoResetAction.bind(null, matchId)}
      label="重設 Ban 圖"
      confirmText="確認重設，清除所有 Ban 與先手，回到隊伍已確認"
    />
  );
}

export function ServerAbortForm({ matchId }: { matchId: string }) {
  return (
    <ConfirmedActionForm
      id="server-abort"
      action={serverAbortAction.bind(null, matchId)}
      label="中止比賽"
      confirmText="確認中止，伺服器上的比賽會結束，比分與數據清除，之後可以重新開打"
    />
  );
}
