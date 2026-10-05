import { CalendarClock, CircleCheck, Hammer, type LucideIcon } from "lucide-react";
import { formatCount } from "@/components/brand/meta-label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RoadmapItem, RoadmapStatus } from "@/types/about";

/** Each status differs by text and icon (not colour alone), like the party status badges. */
const STATUS: Record<RoadmapStatus, { label: string; icon: LucideIcon; className: string }> = {
  planned: { label: "PLANNED", icon: CalendarClock, className: "text-ink-secondary" },
  in_progress: { label: "IN PROGRESS", icon: Hammer, className: "border-warning/40 bg-warning/15 text-warning" },
  launched: { label: "LIVE", icon: CircleCheck, className: "border-success/40 bg-success/15 text-success" },
};

export function RoadmapStatusBadge({ status }: { status: RoadmapStatus }) {
  const { label, icon: Icon, className } = STATUS[status];
  return (
    <Badge variant="outline" data-status={status} className={cn("font-mono", className)}>
      <Icon aria-hidden="true" />
      {label}
    </Badge>
  );
}

/** Hairline-ruled roadmap rows: number, title, status, description. Caller hides it when empty. */
export function RoadmapList({ items }: { items: RoadmapItem[] }) {
  return (
    <ol className="border-b border-line">
      {items.map((item, index) => (
        <li key={item.id} className="flex gap-6 border-t border-line py-5">
          <span className="font-mono text-meta text-signal">{formatCount(index + 1)}</span>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <h3 className="font-heading text-h3 text-ink">{item.title}</h3>
              <RoadmapStatusBadge status={item.status} />
            </div>
            {item.description && (
              <p className="max-w-[65ch] text-body whitespace-pre-line text-ink-secondary">{item.description}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
