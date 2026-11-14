"use client";

import { useActionState, useEffect, useRef } from "react";
import { Flag } from "lucide-react";
import { PopoverDialog } from "@/components/brand/popover-dialog";
import { ShelfStatus } from "@/components/shop/product-card";
import { FormMessage, SubmitButton } from "@/components/member/form-controls";
import { isPopoverOpen } from "@/lib/popover";
import { cn } from "@/lib/utils";
import type { MemberActionState } from "@/types/member";
import { REPORT_CATEGORY_OPTIONS } from "@/utils/clips";

const DETAIL_MAX = 200;

/**
 * 檢舉 on a clip (spec video-clips 「前台檢舉對話框」): a native popover holding the category radios and
 * the required explanation, so it opens, closes and submits without JavaScript. It stays mounted
 * once the clip shows 已檢舉 (the action revalidates /clips), so the thank-you message survives; with
 * JavaScript the dialog closes after a successful report. Nothing renders for the member's own clip.
 * `report` is `reportClipAction` bound to the video on the server.
 */
export function ReportClipDialog({
  report,
  videoId,
  title,
  reported,
  canReport,
  disabledReason,
}: {
  report: (
    state: MemberActionState,
    form: FormData,
  ) => Promise<MemberActionState>;
  videoId: string;
  title: string;
  reported: boolean;
  canReport: boolean;
  /** Reporting is paused or not in the member's role: the button is disabled with this reason. */
  disabledReason: string | null;
}) {
  const [state, action, pending] = useActionState<MemberActionState, FormData>(
    report,
    {},
  );
  const dialogId = `report-clip-${videoId}`;
  const answered = useRef(state);
  useEffect(() => {
    if (answered.current === state) return;
    answered.current = state;
    if (!state.ok) return;
    const dialog = document.getElementById(dialogId);
    if (dialog && isPopoverOpen(dialog)) dialog.hidePopover();
  }, [state, dialogId]);

  if (reported) {
    return (
      <div className="flex flex-col items-start gap-2">
        <ShelfStatus kind="done">已檢舉</ShelfStatus>
        {state.ok && <FormMessage state={state} />}
      </div>
    );
  }
  if (!canReport) return null;

  const detailId = `${dialogId}-detail`;
  const detailError = state.fields?.detail;
  const categoryError = state.fields?.category;
  const chosenCategory =
    state.values?.category ?? REPORT_CATEGORY_OPTIONS[0].value;
  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        popoverTarget={dialogId}
        disabled={disabledReason !== null}
        title={disabledReason ?? undefined}
        className="inline-flex cursor-pointer items-center gap-2 text-caption text-ink-secondary underline-offset-4 hover:text-ink hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:no-underline"
      >
        <Flag aria-hidden="true" className="size-4" />
        檢舉
      </button>
      <PopoverDialog id={dialogId} title="檢舉影片">
        <p>
          檢舉「<span className="text-ink">{title}</span>
          」。管理員下架這支影片時，你會得到 2 點。
        </p>
        <form action={action} className="flex flex-col gap-4">
          <fieldset
            className="flex flex-col gap-2"
            aria-describedby={
              categoryError ? `${dialogId}-category-error` : undefined
            }
          >
            <legend className="mb-2 text-body text-ink">原因分類</legend>
            {REPORT_CATEGORY_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 text-body text-ink"
              >
                <input
                  type="radio"
                  name="category"
                  value={option.value}
                  required
                  defaultChecked={chosenCategory === option.value}
                  className="size-4 accent-signal"
                />
                {option.label}
              </label>
            ))}
            {categoryError && (
              <p
                id={`${dialogId}-category-error`}
                className="text-caption text-destructive"
              >
                {categoryError}
              </p>
            )}
          </fieldset>
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline gap-2">
              <label htmlFor={detailId} className="text-body text-ink">
                說明
              </label>
              <span
                aria-hidden="true"
                className="font-mono text-meta text-signal"
              >
                必填
              </span>
            </div>
            <textarea
              id={detailId}
              name="detail"
              required
              maxLength={DETAIL_MAX}
              rows={4}
              defaultValue={state.values?.detail}
              aria-invalid={detailError ? true : undefined}
              aria-describedby={[
                `${detailId}-hint`,
                detailError ? `${detailId}-error` : null,
              ]
                .filter(Boolean)
                .join(" ")}
              className={cn(
                "w-full rounded-sm border border-line-strong bg-surface px-3 py-2.5 text-body text-ink",
                "focus-visible:border-signal focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                "aria-invalid:border-destructive",
              )}
            />
            <p id={`${detailId}-hint`} className="text-caption text-ink-muted">
              寫下你看到的問題，最多 {DETAIL_MAX} 字。只有管理員看得到。
            </p>
            {detailError && (
              <p
                id={`${detailId}-error`}
                className="text-caption text-destructive"
              >
                {detailError}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <SubmitButton pending={pending} className="px-4 py-2">
              送出檢舉
            </SubmitButton>
            <button
              type="button"
              popoverTarget={dialogId}
              popoverTargetAction="hide"
              className="cursor-pointer rounded-sm border border-line-strong px-4 py-2 text-body text-ink-secondary hover:border-signal hover:text-ink focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              取消
            </button>
          </div>
          {!state.ok && <FormMessage state={state} />}
        </form>
      </PopoverDialog>
      {/* Without JavaScript the page reloads with the dialog closed: repeat the refusal beside the
          button (plain text; the alert is the one inside the dialog). */}
      {!state.ok && state.message && (
        <p className="text-caption text-destructive">{state.message}</p>
      )}
    </div>
  );
}
