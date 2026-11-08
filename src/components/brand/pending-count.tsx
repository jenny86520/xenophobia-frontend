/**
 * A small count of items waiting for the member (friend requests, scrim invites, unread news): the
 * number for sighted users, 「（N 件待處理）」 (or another `unit`, e.g. 則未讀) for assistive tech;
 * nothing at 0. CTA colours, measured AA as buttons.
 */
export function PendingCount({ count, unit = "件待處理" }: { count: number; unit?: string }) {
  if (count <= 0) return null;
  return (
    <>
      <span
        aria-hidden="true"
        className="inline-flex min-w-5 items-center justify-center rounded-sm bg-cta px-1.5 font-mono text-label leading-5 text-cta-ink tabular-nums"
      >
        {count}
      </span>
      <span lang="zh-Hant-TW" className="sr-only">
        （{count} {unit}）
      </span>
    </>
  );
}
