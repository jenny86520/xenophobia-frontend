"use client";

import { useActionState } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { FormMessage } from "@/components/member/form-controls";
import { cn } from "@/lib/utils";
import type { ClipVote } from "@/types/clip";
import type { MemberActionState } from "@/types/member";
import { nextVote } from "@/utils/clips";

/**
 * 讚 and 爛 on a clip (spec video-clips): one form, each button sends what pressing it means (the
 * same vote again takes it back, the other switches to it), so it works without JavaScript. The
 * current vote is `aria-pressed` and outlined, not only coloured. `vote` is `voteClipAction` bound to
 * the video on the server; the counts come back with the page the action revalidates.
 */
export function ClipVoteForm({
  vote,
  likes,
  dislikes,
  myVote,
  disabled,
}: {
  vote: (
    state: MemberActionState,
    form: FormData,
  ) => Promise<MemberActionState>;
  likes: number;
  dislikes: number;
  myVote: ClipVote | null;
  /** Voting is paused or not in the member's role (the page says why). */
  disabled: boolean;
}) {
  const [state, action, pending] = useActionState<MemberActionState, FormData>(
    vote,
    {},
  );
  const buttons = [
    { value: "like" as const, label: "讚", count: likes, Icon: ThumbsUp },
    {
      value: "dislike" as const,
      label: "爛",
      count: dislikes,
      Icon: ThumbsDown,
    },
  ];
  return (
    <form action={action} className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {buttons.map(({ value, label, count, Icon }) => {
          const pressed = myVote === value;
          return (
            <button
              key={value}
              type="submit"
              name="vote"
              value={nextVote(myVote, value) ?? ""}
              aria-pressed={pressed}
              disabled={disabled || pending}
              className={cn(
                "inline-flex cursor-pointer items-center gap-2 rounded-sm border px-3 py-1.5 text-body",
                "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60",
                pressed
                  ? "border-signal bg-surface-elevated text-ink"
                  : "border-line-strong text-ink-secondary hover:border-signal hover:text-ink",
              )}
            >
              <Icon
                aria-hidden="true"
                className={cn("size-4", pressed && "fill-current")}
              />
              {label}
              <span className="font-mono tabular-nums">{count}</span>
            </button>
          );
        })}
      </div>
      {!state.ok && <FormMessage state={state} />}
    </form>
  );
}
