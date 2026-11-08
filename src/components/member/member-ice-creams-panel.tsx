import type { ReactNode } from "react";
import { iceCreamStepAction, redeemIceCreamAction } from "@/app/member/actions";
import { MetaLabel } from "@/components/brand/meta-label";
import { GuideButton } from "@/components/guide/guide-button";
import { PopoverDialog } from "@/components/brand/popover-dialog";
import { TextLink } from "@/components/brand/text-link";
import { Heading } from "@/components/brand/typography";
import {
  CARD_BUTTON_CLASSES,
  IceCreamCard,
  IceCreamDetailDialog,
  IceCreamGrid,
} from "@/components/ice-cream/ice-cream-card";
import type { Guide } from "@/types/guide";
import type { IceCream, MemberIceCream, MemberIceCreams } from "@/types/ice-cream";
import { formatTaipeiDateTime } from "@/utils/datetime";
import { ICE_STATUS_TEXT, iceCreamName } from "@/utils/ice-cream-events";
import { FriendActionButton } from "./friend-forms";
import { CreateIceCreamForm, DeleteIceCreamForm, GiftIceCreamForm } from "./ice-cream-forms";
import { MarkIceCreamsSeen } from "./mark-ice-creams-seen";
import { MemberTabColumns } from "./member-tabs";

/** One block of the tab: a heading, then its cards or, when there are none, a line saying so. */
function CardSection({
  id,
  title,
  label,
  empty,
  className,
  children,
}: {
  id: string;
  title: string;
  /** Names the list of cards. */
  label: string;
  empty: string;
  className?: string;
  children: ReactNode[];
}) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4">
      <Heading level={3} id={id}>
        {title}
      </Heading>
      {children.length === 0 ? (
        <p className="text-body text-ink-secondary">{empty}</p>
      ) : (
        <IceCreamGrid label={label} className={className}>
          {children}
        </IceCreamGrid>
      )}
    </section>
  );
}

const detailId = (ice: MemberIceCream) => `ice-detail-${ice.id}`;

/** The token's life in a dialog, opened by clicking its card. */
function DetailDialog({ ice }: { ice: MemberIceCream }) {
  return <IceCreamDetailDialog id={detailId(ice)} history={{ iceCream: ice, events: ice.events }} />;
}

/** A gift waiting for the member: take it, or send it back. */
function IncomingCard({ ice }: { ice: MemberIceCream }) {
  return (
    <IceCreamCard
      cover={{ serial: ice.serial, issuer: ice.issuer.nickname, state: `「${ice.holder?.nickname}」塞給你的` }}
      detailsId={detailId(ice)}
      dialogs={<DetailDialog ice={ice} />}
    >
      <p className="text-caption text-ink-secondary">
        {formatTaipeiDateTime(ice.giftExpiresAt ?? "")} 前不收，它就溜回去了
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <FriendActionButton action={iceCreamStepAction.bind(null, ice.id, "accept")} label="收下" primary />
        <FriendActionButton action={iceCreamStepAction.bind(null, ice.id, "decline")} label="退回去" />
      </div>
    </IceCreamCard>
  );
}

/** A token the member issued that its holder wants paid: 3 points, or a real one. */
function RequestCard({ ice }: { ice: MemberIceCream }) {
  return (
    <IceCreamCard
      cover={{ serial: ice.serial, issuer: ice.issuer.nickname, state: `「${ice.holder?.nickname}」拿著它來討了` }}
      detailsId={detailId(ice)}
      dialogs={<DetailDialog ice={ice} />}
    >
      <div className="flex flex-wrap justify-center gap-2">
        <FriendActionButton action={redeemIceCreamAction.bind(null, ice.id, "points")} label="給 3 點" primary />
        <FriendActionButton action={redeemIceCreamAction.bind(null, ice.id, "physical")} label="請吃一支" />
      </div>
    </IceCreamCard>
  );
}

/** Where a held token is now, as the card's status line. */
function heldState(ice: IceCream): string {
  if (ice.status === "gifting") return `${ICE_STATUS_TEXT.gifting}：正飛去「${ice.giftTo?.nickname}」那裡`;
  if (ice.status === "redeeming") return `${ICE_STATUS_TEXT.redeeming}：等發行人請客`;
  if (ice.status === "held") return "在你手上";
  return ICE_STATUS_TEXT[ice.status];
}

/**
 * A token the member holds, as a card (clicking it opens its life) with what they may do with it
 * (the backend's `actions`). Giving, asking to redeem and deleting each open a dialog: the friend picker, a second
 * confirmation naming the issuer, or the ticked delete. Native popovers, so no JavaScript needed.
 */
function HeldCard({ ice, friends }: { ice: MemberIceCream; friends: MemberIceCreams["friends"] }) {
  const can = (action: IceCream["actions"][number]) => ice.actions.includes(action);
  const name = iceCreamName(ice.serial);
  const dialog = (kind: string) => `ice-${kind}-${ice.id}`;
  return (
    <IceCreamCard
      cover={{ serial: ice.serial, issuer: ice.issuer.nickname, state: heldState(ice), isNew: ice.isNew }}
      detailsId={detailId(ice)}
      dialogs={
        <>
          <DetailDialog ice={ice} />
          {can("gift") && (
            <PopoverDialog id={dialog("gift")} title={`贈送${name}`}>
              {friends.length > 0 ? (
                <GiftIceCreamForm id={ice.id} serial={ice.serial} friends={friends} />
              ) : (
                <p>還沒有好友可以塞，先去加幾個朋友吧。</p>
              )}
            </PopoverDialog>
          )}
          {can("requestRedeem") && (
            <PopoverDialog id={dialog("redeem")} title={`兌換${name}`}>
              <p className="text-ink">
                要向「{ice.issuer.nickname}」申請兌換{name}嗎？
              </p>
              <p>對方會給你 3 點，或請你吃一支真的。反悔的話，對方處理前都能撤回。</p>
              <FriendActionButton
                action={iceCreamStepAction.bind(null, ice.id, "requestRedeem")}
                label="確認申請"
                primary
              />
            </PopoverDialog>
          )}
          {can("delete") && (
            <PopoverDialog id={dialog("delete")} title={`刪除${name}`}>
              <DeleteIceCreamForm id={ice.id} serial={ice.serial} />
            </PopoverDialog>
          )}
        </>
      }
    >
      {ice.status === "gifting" && (
        <p className="text-caption text-ink-secondary">
          {formatTaipeiDateTime(ice.giftExpiresAt ?? "")} 前沒被收下就會飛回來
        </p>
      )}
      <div className="flex flex-wrap justify-center gap-2">
        {can("gift") && (
          <button type="button" popoverTarget={dialog("gift")} className={CARD_BUTTON_CLASSES}>
            贈送
          </button>
        )}
        {can("requestRedeem") && (
          <button type="button" popoverTarget={dialog("redeem")} className={CARD_BUTTON_CLASSES}>
            兌換
          </button>
        )}
        {can("cancelRedeem") && (
          <FriendActionButton action={iceCreamStepAction.bind(null, ice.id, "cancelRedeem")} label="撤回兌換申請" />
        )}
        {can("delete") && (
          <button type="button" popoverTarget={dialog("delete")} className={CARD_BUTTON_CLASSES}>
            刪除
          </button>
        )}
      </div>
    </IceCreamCard>
  );
}

/**
 * The 冰炫風 tab: issuing and the tokens the member holds on the left; gifts waiting for them and
 * redemptions asked of them (as issuer) on the right, with links to the growth record and the shop.
 * Every rule (limit, points, who may do what) is the backend's.
 */
export function MemberIceCreamsPanel({
  iceCreams,
  guide = null,
}: {
  iceCreams: MemberIceCreams;
  guide?: Guide | null;
}) {
  const { issuing, balance, createCost, create } = iceCreams;
  return (
    <>
      {iceCreams.held.some((ice) => ice.isNew) && <MarkIceCreamsSeen />}
      <MemberTabColumns
        id="ice-creams-title"
        eyebrow="Ice cream"
        title="冰炫風"
        titleAside={<GuideButton guide={guide} />}
        main={
          <>
            <div className="flex flex-col gap-3">
              <p className="text-body text-ink-secondary">
                冰炫風是一張「欠你一支冰炫風」的票：誰發的誰請客。收到的人可以再轉手塞給別人，也可以拿著它去找發行人討。
              </p>
              <div className="flex flex-wrap gap-x-8 gap-y-2">
                <MetaLabel>
                  已發出 {issuing.active} / {issuing.limit} 支
                </MetaLabel>
                <MetaLabel>口袋 {balance} 點</MetaLabel>
              </div>
              {create.allowed ? (
                <CreateIceCreamForm cost={createCost} />
              ) : (
                <p className="text-body text-ink-secondary">{create.reason}</p>
              )}
            </div>
            <CardSection
              id="ice-held-title"
              title="我的冰庫"
              label="我的冰庫裡的冰炫風"
              empty="冰庫空空的，自己發一支，或等朋友塞冰給你。"
              className="lg:grid-cols-3"
            >
              {iceCreams.held.map((ice) => (
                <HeldCard key={ice.id} ice={ice} friends={iceCreams.friends} />
              ))}
            </CardSection>
          </>
        }
        side={
          <>
            <CardSection
              id="ice-incoming-title"
              title="有人塞冰給你"
              label="等你收下的冰炫風"
              empty="還沒有人塞冰炫風給你，先去多交幾個朋友吧。"
              className="lg:grid-cols-2"
            >
              {iceCreams.incoming.map((ice) => (
                <IncomingCard key={ice.id} ice={ice} />
              ))}
            </CardSection>
            <CardSection
              id="ice-requests-title"
              title="有人來討冰了"
              label="等你兌現的冰炫風"
              empty="目前沒人來討冰，荷包很安全。"
              className="lg:grid-cols-2"
            >
              {iceCreams.redeemRequests.map((ice) => (
                <RequestCard key={ice.id} ice={ice} />
              ))}
            </CardSection>
            <nav aria-label="冰炫風相關頁面" className="flex flex-col gap-2 text-body">
              <TextLink href="/ice-creams">冰炫風成長史冊</TextLink>
              <TextLink href="/shop">點數商店</TextLink>
            </nav>
          </>
        }
      />
    </>
  );
}
