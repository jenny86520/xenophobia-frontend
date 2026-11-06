import { MetaLabel } from "@/components/brand/meta-label";
import { TextLink } from "@/components/brand/text-link";
import { Heading } from "@/components/brand/typography";
import type { MemberPoints, PointCampaignProgress } from "@/types/member";
import { formatTaipeiDateTime } from "@/utils/datetime";
import { memberTabHref } from "@/utils/member-tabs";
import { formatPointAmount, pointKindLabel } from "@/utils/point-kinds";
import { CheckInForm } from "./check-in-form";
import { MemberTabColumns } from "./member-tabs";

/** The running campaign: name, end and the run as text, plus a bar that repeats it. */
function CampaignProgress({ campaign }: { campaign: PointCampaignProgress }) {
  const label = `連續 ${campaign.streak} / ${campaign.requiredDays} 天`;
  return (
    <section aria-labelledby="campaign-title" className="flex flex-col gap-3 border-t border-line pt-6">
      <MetaLabel>簽到活動・{campaign.endDate.replaceAll("-", "/")} 結束</MetaLabel>
      <Heading level={3} id="campaign-title">
        {campaign.title}
      </Heading>
      <p className="text-body text-ink-secondary">
        活動期間連續簽到滿 {campaign.requiredDays} 天，另外獲得 1 點，然後重新計算；漏簽一天也會重新計算。
      </p>
      <p className="font-mono text-lead text-ink">{label}</p>
      <progress
        value={campaign.streak}
        max={campaign.requiredDays}
        aria-label={label}
        className="h-2 w-full overflow-hidden rounded-sm [&::-moz-progress-bar]:bg-signal [&::-webkit-progress-bar]:bg-surface-elevated [&::-webkit-progress-value]:bg-signal"
      />
    </section>
  );
}

/** Links to the newer and older pages of entries (?tab=points&page=N). */
function EntryPages({ page, pageSize, total }: MemberPoints["entries"]) {
  const pages = Math.ceil(total / pageSize);
  if (pages <= 1) return null;
  const href = (target: number) => (target === 1 ? memberTabHref("points") : `/member?tab=points&page=${target}`);
  return (
    <nav aria-label="點數紀錄分頁" className="flex items-center justify-between gap-4 text-body">
      {page > 1 ? <TextLink href={href(page - 1)}>較新的紀錄</TextLink> : <span />}
      <MetaLabel>
        {page} / {pages}
      </MetaLabel>
      {page < pages ? <TextLink href={href(page + 1)}>較早的紀錄</TextLink> : <span />}
    </nav>
  );
}

/**
 * The 點數 tab: the balance, today's check-in and the running campaign's progress on the left, the
 * member's ledger (newest first) on the right. Every number comes from the backend.
 */
export function MemberPointsPanel({ points }: { points: MemberPoints }) {
  const { entries } = points;
  return (
    <MemberTabColumns
      id="points-title"
      eyebrow="Points"
      title="點數"
      main={
        <>
          <div className="flex flex-col gap-1">
            <MetaLabel>目前點數</MetaLabel>
            <p className="font-mono text-display text-ink">{points.balance}</p>
          </div>
          <CheckInForm checkedInToday={points.checkedInToday} />
          <p className="text-caption text-ink-secondary">每天（台灣時間）可以簽到一次，每次獲得 1 點。</p>
          {points.campaign && <CampaignProgress campaign={points.campaign} />}
        </>
      }
      side={
        <section aria-labelledby="point-entries-title" className="flex flex-col gap-4">
          <Heading level={3} id="point-entries-title">
            點數紀錄
          </Heading>
          {entries.total === 0 ? (
            <p className="text-body text-ink-secondary">還沒有點數紀錄，簽到就能拿到第一點。</p>
          ) : (
            <ol className="border-t border-line">
              {entries.items.map((entry) => (
                <li key={entry.id} className="flex items-baseline justify-between gap-4 border-b border-line py-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-body text-ink">{pointKindLabel(entry.kind)}</span>
                    <MetaLabel>{formatTaipeiDateTime(entry.createdAt)}</MetaLabel>
                  </div>
                  <span className="font-mono text-lead text-ink">{formatPointAmount(entry.amount)}</span>
                </li>
              ))}
            </ol>
          )}
          <EntryPages {...entries} />
        </section>
      }
    />
  );
}
