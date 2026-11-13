import { Store } from "lucide-react";
import { equipCosmeticAction } from "@/app/member/actions";
import { MetaLabel } from "@/components/brand/meta-label";
import { TextLink } from "@/components/brand/text-link";
import { Heading } from "@/components/brand/typography";
import { CosmeticPreview } from "@/components/cosmetics/cosmetic-preview";
import { IceCreamIcon } from "@/components/brand/ice-cream-icon";
import { Badge } from "@/components/ui/badge";
import type { CosmeticCollection, OwnedCosmetic } from "@/types/cosmetic";
import { FriendActionButton } from "./friend-forms";
import { MemberTabColumns } from "./member-tabs";

/** The collectible kinds in display order, with what each one changes. */
const SECTIONS: Array<{ kind: OwnedCosmetic["kind"]; title: string; note: string }> = [
  { kind: "title", title: "稱號", note: "顯示在暱稱旁，傳奇榜、比賽室、好友與參加者名單都看得到。" },
  { kind: "frame", title: "比賽室框", note: "內戰比賽室裡，你的那一列會套上這個框。" },
  { kind: "stamp", title: "集點卡外觀", note: "點數分頁的集點卡改用這個印章，只有你看得到。" },
];

/** One owned cosmetic: its preview and name, 裝備中 when worn, and the form to wear or take it off. */
function OwnedRow({ item }: { item: OwnedCosmetic }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-line py-4">
      <div className="flex min-w-0 items-center gap-4">
        <CosmeticPreview kind={item.kind} look={item.look} className="min-w-24" />
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-lead text-ink">{item.name}</span>
          <span className="flex flex-wrap gap-2">
            {item.equipped && <Badge>裝備中</Badge>}
            {!item.onSale && <MetaLabel>已下架</MetaLabel>}
          </span>
        </div>
      </div>
      <FriendActionButton
        action={equipCosmeticAction.bind(null, item.kind, item.equipped ? null : item.id)}
        label={item.equipped ? "卸下" : "裝備"}
        primary={!item.equipped}
      />
    </li>
  );
}

/**
 * The 收藏 tab (spec member-cosmetics): owned titles, scrim-room frames and stamp card looks by kind,
 * each with 裝備 or 卸下 (one of a kind at a time); on the side the ice cream cups in stock, which are
 * changed onto tokens from the 冰炫風 tab. Every form works without JavaScript.
 */
export function MemberCosmeticsPanel({ collection }: { collection: CosmeticCollection }) {
  const empty = collection.owned.length === 0 && collection.cups.length === 0;
  return (
    <MemberTabColumns
      id="cosmetics-title"
      eyebrow="Collection"
      title="收藏"
      main={
        empty ? (
          <p className="text-body text-ink-secondary">
            還沒有任何外觀。到
            <TextLink href="/shop#shelf-cosmetics" icon={Store}>
              點數商店
            </TextLink>
            挑一個吧。
          </p>
        ) : (
          SECTIONS.map((section) => {
            const items = collection.owned.filter((item) => item.kind === section.kind);
            const headingId = `collection-${section.kind}`;
            return (
              <section key={section.kind} aria-labelledby={headingId} className="flex flex-col gap-3">
                <Heading level={3} id={headingId}>
                  {section.title}
                </Heading>
                <p className="text-caption text-ink-secondary">{section.note}</p>
                {items.length === 0 ? (
                  <p className="text-body text-ink-secondary">還沒有{section.title}。</p>
                ) : (
                  <ul aria-labelledby={headingId} className="border-t border-line">
                    {items.map((item) => (
                      <OwnedRow key={item.id} item={item} />
                    ))}
                  </ul>
                )}
              </section>
            );
          })
        )
      }
      side={
        <section aria-labelledby="collection-cups" className="flex flex-col gap-3">
          <Heading level={3} id="collection-cups">
            冰炫風杯
          </Heading>
          <p className="text-caption text-ink-secondary">
            每個杯子換一次就用掉。到
            <TextLink href="/member?tab=ice-creams">冰炫風分頁</TextLink>
            打開手上的冰炫風就能換杯子。
          </p>
          {collection.cups.length === 0 ? (
            <p className="text-body text-ink-secondary">庫存沒有杯子。</p>
          ) : (
            <ul aria-labelledby="collection-cups" className="border-t border-line">
              {collection.cups.map((entry) => (
                <li key={entry.item.id} className="flex items-center gap-4 border-b border-line py-3">
                  <IceCreamIcon aria-hidden="true" className="size-10 text-ink-secondary" look={entry.item} />
                  <span className="flex-1 text-body text-ink">{entry.item.name}</span>
                  <span className="font-mono text-body text-ink-secondary tabular-nums">× {entry.count}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="text-body">
            <TextLink href="/shop#shelf-cosmetics" icon={Store}>
              點數商店
            </TextLink>
          </p>
        </section>
      }
    />
  );
}
