import type { ReactNode } from "react";
import { IceCreamIcon } from "@/components/brand/ice-cream-icon";
import { MetaLabel } from "@/components/brand/meta-label";
import { PopoverDialog } from "@/components/brand/popover-dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { IceCreamHistory } from "@/types/ice-cream";
import { ICE_STATUS_TEXT, iceCreamName } from "@/utils/ice-cream-events";
import { IceEventList } from "./ice-event-list";

/** What a card shows of a token. */
export type IceCreamCover = {
  serial: number;
  /** The issuer's nickname, 「管理員」 or 「已離開的會員」. */
  issuer: string;
  /** Who holds it and how (「小華・持有中」), or how it ended (「功成身退」). */
  state: string;
  isNew?: boolean;
};

type IceCreamFacts = Pick<IceCreamHistory["iceCream"], "serial" | "issuer" | "status" | "holder">;

/** A token's cover from the backend's view of it. */
export function coverOf(ice: IceCreamFacts & { isNew?: boolean }): IceCreamCover {
  const status = ICE_STATUS_TEXT[ice.status] ?? ice.status;
  return {
    serial: ice.serial,
    issuer: ice.issuer.nickname,
    state: ice.holder ? `${ice.holder.nickname}・${status}` : status,
    isNew: ice.isNew,
  };
}

/** Buttons that open a dialog from a card (gift, redeem, delete). */
export const CARD_BUTTON_CLASSES = cn(
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-sm border border-line-strong px-3 py-1.5 text-caption text-ink",
  "hover:border-signal focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
);

function CoverContent({ cover }: { cover: IceCreamCover }) {
  return (
    <>
      <IceCreamIcon className="size-10 text-ink-secondary" />
      <span className="text-lead text-ink">{iceCreamName(cover.serial)}</span>
      <MetaLabel>{cover.issuer} 發行</MetaLabel>
      <span className="text-caption text-ink-secondary">{cover.state}</span>
      {cover.isNew && <Badge variant="outline">新</Badge>}
    </>
  );
}

const COVER_CLASSES = "flex flex-col items-center gap-2 px-3 py-6 text-center";

/**
 * One token as a borderless card (a tile slightly lighter than the page). With `detailsId` the
 * cover is a button opening that dialog; `children` (the actions) sit under the cover, and
 * `dialogs` (the popovers the card's buttons open) stay inside the list item.
 */
export function IceCreamCard({
  cover,
  detailsId,
  children,
  dialogs,
}: {
  cover: IceCreamCover;
  detailsId?: string;
  children?: ReactNode;
  dialogs?: ReactNode;
}) {
  return (
    <li className="flex flex-col rounded-sm bg-surface">
      {detailsId ? (
        <button
          type="button"
          popoverTarget={detailsId}
          className={cn(
            COVER_CLASSES,
            "w-full flex-1 cursor-pointer rounded-sm hover:bg-surface-elevated",
            "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
          )}
        >
          <CoverContent cover={cover} />
        </button>
      ) : (
        <div className={cn(COVER_CLASSES, "flex-1")}>
          <CoverContent cover={cover} />
        </div>
      )}
      {children && <div className="flex flex-col items-center gap-3 px-3 pb-4 text-center">{children}</div>}
      {dialogs}
    </li>
  );
}

/** Cards side by side: two per row on phones, more on wider screens. */
export function IceCreamGrid({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <ul aria-label={label} className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4", className)}>
      {children}
    </ul>
  );
}

/** One token in detail (number, issuer, holder or ending, its whole life) in a dialog. */
export function IceCreamDetailDialog({ id, history }: { id: string; history: IceCreamHistory }) {
  const { iceCream, events } = history;
  const name = iceCreamName(iceCream.serial);
  const status = ICE_STATUS_TEXT[iceCream.status] ?? iceCream.status;
  const details = [
    { label: "發行人", value: iceCream.issuer.nickname },
    iceCream.holder ? { label: "持有人", value: iceCream.holder.nickname } : { label: "結局", value: status },
    ...(iceCream.holder ? [{ label: "狀態", value: status }] : []),
  ];
  return (
    <PopoverDialog id={id} title={name} size="wide">
      <dl className="grid grid-cols-1 gap-x-6 sm:grid-cols-3">
        {details.map((item) => (
          <div key={item.label} className="flex flex-col gap-1 py-2">
            <dt>
              <MetaLabel>{item.label}</MetaLabel>
            </dt>
            <dd className="text-lead text-ink">{item.value}</dd>
          </div>
        ))}
      </dl>
      <IceEventList events={events} label={`${name}的一生`} />
    </PopoverDialog>
  );
}

/** A card that opens the token's detail dialog (the album and the friend page). */
export function IceCreamDetailCard({ history, cover }: { history: IceCreamHistory; cover?: IceCreamCover }) {
  const id = `ice-detail-${history.iceCream.id}`;
  return (
    <IceCreamCard
      cover={cover ?? coverOf(history.iceCream)}
      detailsId={id}
      dialogs={<IceCreamDetailDialog id={id} history={history} />}
    />
  );
}
