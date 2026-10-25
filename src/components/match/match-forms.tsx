"use client";

import { useActionState, useState } from "react";
import {
  cancelMatchAction,
  confirmTeamsAction,
  createMatchAction,
  generateTeamsAction,
  importPartyAction,
  joinGroupAction,
  leaveAction,
  lockAction,
  removePlayerAction,
  signUpAction,
  unlockAction,
} from "@/app/matches/actions";
import { CheckboxField, FormField, FormMessage, SelectField, SubmitButton } from "@/components/member/form-controls";
import { cn } from "@/lib/utils";
import type { MatchActionState } from "@/types/match";

/**
 * Match forms: each is a <form action> bound to a Server Action with useActionState, so all of
 * them work without JavaScript. The backend decides; these only show its message and field errors.
 */

const secondaryButton = cn(
  "inline-flex items-center justify-center gap-2 rounded-sm border border-line-strong px-5 py-3 text-body text-ink",
  "hover:border-signal focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-60",
);

type SimpleAction = (state: MatchActionState) => Promise<MatchActionState>;

/** One button that runs one action (sign up, leave, import, lock, generate). */
function ActionButton({ action, label, secondary }: { action: SimpleAction; label: string; secondary?: boolean }) {
  const [state, formAction, pending] = useActionState<MatchActionState>(action, {});
  return (
    <form action={formAction} className="flex flex-col items-start gap-3">
      {secondary ? (
        <button type="submit" disabled={pending} className={secondaryButton}>
          {pending ? "處理中…" : label}
        </button>
      ) : (
        <SubmitButton pending={pending}>{label}</SubmitButton>
      )}
      <FormMessage state={state} />
    </form>
  );
}

// ---- Signing up ----

export function SignUpButtons({ matchId }: { matchId: string }) {
  return (
    <div className="flex flex-wrap items-start gap-4">
      <ActionButton action={signUpAction.bind(null, matchId, "solo")} label="單人報名" />
      <ActionButton action={signUpAction.bind(null, matchId, "group")} label="建立小隊" secondary />
    </div>
  );
}

export function JoinGroupForm({ matchId }: { matchId: string }) {
  const [state, action, pending] = useActionState<MatchActionState, FormData>(joinGroupAction.bind(null, matchId), {});
  return (
    <form action={action} className="flex max-w-sm flex-col gap-4">
      <FormField
        id="invite-code"
        name="code"
        label="邀請碼"
        required
        maxLength={20}
        autoComplete="off"
        defaultValue={state.values?.code}
        hint="向小隊建立者索取 6 碼邀請碼，大小寫不拘。"
        error={state.fields?.code}
      />
      <button type="submit" disabled={pending} className={cn(secondaryButton, "self-start")}>
        {pending ? "處理中…" : "加入小隊"}
      </button>
      <FormMessage state={state} />
    </form>
  );
}

export function LeaveButton({ matchId }: { matchId: string }) {
  return <ActionButton action={leaveAction.bind(null, matchId)} label="退出報名" secondary />;
}

// ---- Creating ----

type Option = { value: string; label: string };

/** Title and an optional party; the game is always Counter-Strike 2 (the backend sets it). */
export function CreateMatchForm({ parties }: { parties: Option[] }) {
  const [state, action, pending] = useActionState<MatchActionState, FormData>(createMatchAction, {});
  return (
    <form action={action} className="flex max-w-xl flex-col gap-6">
      <FormField
        id="match-title"
        name="title"
        label="標題"
        required
        maxLength={60}
        defaultValue={state.values?.title}
        error={state.fields?.title}
      />
      <SelectField
        id="match-party"
        name="partyId"
        label="所屬派對"
        placeholder="不屬於派對"
        options={parties}
        defaultValue={state.values?.partyId}
        error={state.fields?.partyId}
      />
      <p className="text-caption text-ink-muted">選了派對，已報名該派對且綁定 Steam 的會員會自動加入名單。</p>
      <SubmitButton pending={pending} className="self-start">
        建立場次
      </SubmitButton>
      <FormMessage state={state} />
    </form>
  );
}

// ---- Managing (the creating member) ----

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

type ConfirmedAction = (state: MatchActionState, form: FormData) => Promise<MatchActionState>;

/** A destructive action: needs its box ticked first (no dialog without JavaScript). */
function ConfirmedActionForm({
  id,
  action,
  label,
  confirmText,
}: {
  id: string;
  action: ConfirmedAction;
  label: string;
  confirmText: string;
}) {
  const [state, formAction, pending] = useActionState<MatchActionState, FormData>(action, {});
  return (
    <form action={formAction} className="flex flex-col items-start gap-3">
      <CheckboxField id={`${id}-confirm`} name="confirm" required error={state.fields?.confirm}>
        {confirmText}
      </CheckboxField>
      <button type="submit" disabled={pending} className={secondaryButton}>
        {pending ? "處理中…" : label}
      </button>
      <FormMessage state={state} />
    </form>
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

export function CancelMatchForm({ matchId }: { matchId: string }) {
  return (
    <ConfirmedActionForm
      id="cancel"
      action={cancelMatchAction.bind(null, matchId)}
      label="取消場次"
      confirmText="確認取消這場，取消後不能再報名或分隊"
    />
  );
}

export function RemovePlayerForm({ matchId, players }: { matchId: string; players: Option[] }) {
  const [state, action, pending] = useActionState<MatchActionState, FormData>(
    removePlayerAction.bind(null, matchId),
    {},
  );
  return (
    <form action={action} className="flex max-w-sm flex-col gap-4">
      <SelectField
        id="remove-player"
        name="playerId"
        label="玩家"
        required
        placeholder="請選擇玩家"
        options={players}
        error={state.fields?.playerId}
      />
      <CheckboxField id="remove-confirm" name="confirm" required error={state.fields?.confirm}>
        確認把這位玩家移出名單
      </CheckboxField>
      <button type="submit" disabled={pending} className={cn(secondaryButton, "self-start")}>
        {pending ? "處理中…" : "移出"}
      </button>
      <FormMessage state={state} />
    </form>
  );
}

export type TeamPlayer = { playerId: string; name: string; rating: number; group: string | null };

/**
 * The final split: A or B for each player (preset from the chosen candidate), a captain per team
 * (preset to the suggestion) and the box that allows splitting a group. The backend checks it all.
 */
export function TeamConfirmForm({
  matchId,
  players,
  teamOf,
  captainA,
  captainB,
}: {
  matchId: string;
  players: TeamPlayer[];
  teamOf: Record<string, "A" | "B">;
  captainA: string;
  captainB: string;
}) {
  const [state, action, pending] = useActionState<MatchActionState, FormData>(
    confirmTeamsAction.bind(null, matchId),
    {},
  );
  const teamError = state.fields?.teamA ?? state.fields?.teamB;
  // After a refused confirm, show what was chosen rather than the preset again.
  const chosen = state.values;
  const sideOf = (playerId: string) => chosen?.[`team-${playerId}`] ?? teamOf[playerId];
  // The radios stay uncontrolled (they work without JavaScript); this copy only filters the captains.
  const [sides, setSides] = useState<Record<string, string>>(() =>
    Object.fromEntries(players.map((player) => [player.playerId, sideOf(player.playerId)])),
  );
  const [captains, setCaptains] = useState({
    A: chosen?.captainA ?? captainA,
    B: chosen?.captainB ?? captainB,
  });
  const teamOptions = (side: "A" | "B") =>
    players.filter((player) => sides[player.playerId] === side).map((p) => ({ value: p.playerId, label: p.name }));
  // A captain moved to the other team falls back to the first player left on their team.
  const captainOf = (side: "A" | "B") => {
    const options = teamOptions(side);
    return options.some((option) => option.value === captains[side]) ? captains[side] : (options[0]?.value ?? "");
  };
  return (
    <form action={action} className="flex flex-col gap-6">
      <fieldset aria-describedby={teamError ? "team-error" : undefined} className="flex flex-col">
        <legend className="mb-3 text-body text-ink">每位玩家的隊伍</legend>
        <ul className="border-t border-line">
          {players.map((player) => (
            <li
              key={player.playerId}
              className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-line py-3"
            >
              <span className="text-body text-ink">
                {player.name}
                <span className="ml-3 font-mono text-label text-ink-secondary tabular-nums">{player.rating}</span>
                {player.group && <span className="ml-3 font-mono text-meta text-ink-muted">{player.group}</span>}
              </span>
              <span
                role="radiogroup"
                aria-label={`${player.name} 的隊伍`}
                className="inline-flex overflow-hidden rounded-sm border border-line-strong"
              >
                {(["A", "B"] as const).map((side) => (
                  // A real radio (works without JavaScript) shown as one half of a segmented switch.
                  <label key={side} className="cursor-pointer">
                    <input
                      type="radio"
                      name={`team-${player.playerId}`}
                      value={side}
                      defaultChecked={sideOf(player.playerId) === side}
                      onChange={() => setSides((current) => ({ ...current, [player.playerId]: side }))}
                      className="peer sr-only"
                    />
                    <span
                      className={cn(
                        "block px-4 py-1.5 text-body text-ink-secondary transition-colors",
                        side === "B" && "border-l border-line-strong",
                        "hover:text-ink peer-checked:bg-cta peer-checked:font-medium peer-checked:text-cta-ink",
                        "peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50 peer-focus-visible:ring-inset",
                      )}
                    >
                      {side} 隊
                    </span>
                  </label>
                ))}
              </span>
            </li>
          ))}
        </ul>
        {teamError && (
          <p id="team-error" className="mt-2 text-caption text-destructive">
            {teamError}
          </p>
        )}
      </fieldset>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {(["A", "B"] as const).map((side) => (
          <SelectField
            key={side}
            id={`captain-${side.toLowerCase()}`}
            name={`captain${side}`}
            label={`${side} 隊隊長`}
            required
            placeholder="請選擇隊長"
            options={teamOptions(side)}
            value={captainOf(side)}
            onChange={(event) => setCaptains((current) => ({ ...current, [side]: event.target.value }))}
            error={state.fields?.[`captain${side}`]}
          />
        ))}
      </div>
      <CheckboxField
        id="allow-split"
        name="allowSplit"
        defaultChecked={chosen?.allowSplit === "on"}
        error={state.fields?.allowSplit}
      >
        允許拆開小隊（同一小隊的人分到不同隊時需要勾選）
      </CheckboxField>
      <SubmitButton pending={pending} className="self-start">
        確認分隊
      </SubmitButton>
      <FormMessage state={state} />
    </form>
  );
}
