import { CircleCheck, CircleSlash, CircleX, Clock, type LucideIcon } from "lucide-react";
import { MetaLabel } from "@/components/brand/meta-label";
import { Badge } from "@/components/ui/badge";
import type { MemberVideoSubmission, VideoSubmissionStatus } from "@/types/member";
import { formatTaipeiDateTime } from "@/utils/datetime";
import { submissionGameLabel } from "@/utils/video-upload";

/** What the badge shows: the review status, or 已下架 for an accepted video an admin took down. */
type ShownStatus = VideoSubmissionStatus | "taken-down";

/** Each status differs by text and icon, never by colour alone. */
const STATUS: Record<ShownStatus, { label: string; icon: LucideIcon; className: string }> = {
  pending: { label: "待審核", icon: Clock, className: "text-ink-secondary" },
  accepted: { label: "已接收", icon: CircleCheck, className: "border-success/40 bg-success/15 text-success" },
  rejected: { label: "已退回", icon: CircleX, className: "border-destructive/40 bg-destructive/15 text-destructive" },
  "taken-down": {
    label: "已下架",
    icon: CircleSlash,
    className: "border-warning/40 bg-warning/15 text-warning",
  },
};

export function SubmissionStatusBadge({ status }: { status: ShownStatus }) {
  const { label, icon: Icon, className } = STATUS[status];
  return (
    <Badge variant="outline" data-status={status} className={className}>
      <Icon aria-hidden="true" />
      {label}
    </Badge>
  );
}

/** The member's submissions as hairline-ruled rows, newest first (the backend's order). */
export function VideoSubmissionList({ items }: { items: MemberVideoSubmission[] }) {
  return (
    <ol className="border-t border-line">
      {items.map((item) => (
        <li key={item.id} className="flex flex-col gap-2 border-b border-line py-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="text-lead break-all text-ink">{item.title}</span>
            <SubmissionStatusBadge status={item.takenDown ? "taken-down" : item.status} />
          </div>
          <p className="flex flex-wrap gap-x-4 gap-y-1">
            <MetaLabel>{submissionGameLabel(item.game, item.otherGameName)}</MetaLabel>
            <MetaLabel>{item.source === "youtube" ? "YouTube 連結" : "上傳影片檔"}</MetaLabel>
            <MetaLabel>影片日期 {item.recordedOn}</MetaLabel>
            <MetaLabel>投稿 {formatTaipeiDateTime(item.createdAt)}</MetaLabel>
          </p>
          {item.status === "rejected" && item.rejectReason && (
            <p className="border-l-2 border-destructive pl-3 text-body text-ink-secondary">
              退回原因：{item.rejectReason}
            </p>
          )}
          {item.takenDown && (
            <p className="border-l-2 border-warning pl-3 text-body text-ink-secondary">
              下架原因：{item.takenDown.reason}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}
