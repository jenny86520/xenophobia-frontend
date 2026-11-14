import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CalendarCheck, Flame } from "lucide-react";
import {
  buyCosmeticAction,
  claimIceCampaignAction,
  claimQuestAction,
} from "@/app/member/actions";
import { PageHeader } from "@/components/brand/page-header";
import { Section } from "@/components/brand/section";
import { TextLink } from "@/components/brand/text-link";
import { CosmeticPreview } from "@/components/cosmetics/cosmetic-preview";
import { FriendActionButton } from "@/components/member/friend-forms";
import { Heading } from "@/components/brand/typography";
import { BuyCosmeticForm } from "@/components/shop/buy-cosmetic-form";
import {
  ProductCard,
  ProductGrid,
  ProductShelf,
  ShelfStatus,
} from "@/components/shop/product-card";
import { ShopBalance } from "@/components/shop/shop-balance";
import { ShopCosmeticTabs } from "@/components/shop/shop-cosmetic-tabs";
import { ShopJumpNav } from "@/components/shop/shop-jump-nav";
import { fetchMemberProfile } from "@/lib/member-session";
import { fetchShop } from "@/lib/public-content-client";
import type { ShopCosmetic } from "@/types/cosmetic";
import type { ShopQuest } from "@/types/quest";
import { cosmeticTerms } from "@/utils/cosmetics";
import { questHref, questIcon } from "@/utils/quests";
import {
  COSMETICS_SHELF_ID,
  cosmeticGroups,
  parseHideOwned,
  parseShopCategory,
  shopCosmeticsHref,
  shownGroups,
} from "@/utils/shop-cosmetics";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "XenoPhobiA 點數商店：限定冰炫風、每日簽到、連續簽到活動、新手任務與外觀。",
};

const dateText = (date: string) => date.replaceAll("-", "/");

const PICTURE_CLASSES = "size-14";

/** A quest card's action, from the backend's state (null for visitors). */
function questAction(quest: ShopQuest, signIn: (label: string) => ReactNode) {
  if (quest.state === null) return signIn("登入會員後即可領取");
  if (quest.state === "claimable") {
    return (
      <FriendActionButton
        action={claimQuestAction.bind(null, quest.code)}
        label="領取"
        primary
      />
    );
  }
  if (quest.state === "claimed")
    return <ShelfStatus kind="done">已領取</ShelfStatus>;
  const href = questHref(quest.code);
  return href ? <TextLink href={href}>去完成</TextLink> : null;
}

/** A cosmetic card's action: buy, 已擁有 (collectibles), 已售完, or a sign-in for visitors. */
function cosmeticAction(
  item: ShopCosmetic,
  signIn: (label: string) => ReactNode,
) {
  const owned = item.owned === true;
  if (!owned && item.soldOut)
    return <ShelfStatus kind="soldOut">已售完</ShelfStatus>;
  if (item.owned === null && item.stock === null)
    return signIn("登入會員後即可購買");
  return (
    <BuyCosmeticForm
      buy={buyCosmeticAction.bind(null, item.id, item.price)}
      owned={owned}
      itemId={item.id}
      name={item.name}
      price={item.price}
      kind={item.kind}
    />
  );
}

/** 「12/31 停售」 from a Taiwan date. */
function saleEndText(date: string): string {
  const [, month, day] = date.split("-");
  return `${Number(month)}/${Number(day)} 停售`;
}

/** A cosmetic card's terms: its kind, then the member's cups in stock and the last day of sale. */
function cosmeticTermsOf(item: ShopCosmetic): string[] {
  return [
    cosmeticTerms(item.kind),
    ...(item.stock === null ? [] : [`庫存 ${item.stock}`]),
    ...(item.saleEndsOn ? [saleEndText(item.saleEndsOn)] : []),
  ];
}

/** A limited item's meter (copies left of the limit); nothing for unlimited ones. */
function stockOf(
  item: ShopCosmetic,
): { remaining: number; limit: number } | undefined {
  if (item.stockLimit === null || item.stockLimit === undefined)
    return undefined;
  return { remaining: item.remaining ?? 0, limit: item.stockLimit };
}

/** One cosmetic's card (the same under 全部 and under its category's tab). */
function cosmeticCard(
  item: ShopCosmetic,
  signIn: (label: string) => ReactNode,
) {
  return (
    <ProductCard
      key={item.id}
      id={`product-cosmetic-${item.id}`}
      picture={<CosmeticPreview kind={item.kind} look={item.look} />}
      name={item.name}
      price={`${item.price} 點`}
      terms={cosmeticTermsOf(item)}
      tag={item.stockLimit ? `限量 ${item.stockLimit} 份` : undefined}
      stock={stockOf(item)}
      soldOut={item.soldOut === true}
      action={cosmeticAction(item, signIn)}
    />
  );
}

/**
 * The cosmetics shelf (spec point-shop): tabs by the admins' categories (其他 for the rest), the
 * member's 隱藏已擁有, and under 全部 one section per category with its own heading. A single
 * group needs no heading of its own: the shelf's heading names the grid.
 */
function CosmeticsShelf({
  shop,
  query,
  signedIn,
  signIn,
}: {
  shop: Awaited<ReturnType<typeof fetchShop>>;
  query: { category?: string | string[]; owned?: string | string[] };
  signedIn: boolean;
  signIn: (label: string) => ReactNode;
}) {
  const items = shop.cosmetics ?? [];
  const groups = cosmeticGroups(shop.cosmeticCategories ?? [], items);
  const current = parseShopCategory(query.category, groups);
  const hideOwned = parseHideOwned(query.owned, signedIn);
  const shown = shownGroups(groups, current, hideOwned);

  let body: ReactNode;
  if (items.length === 0) {
    body = (
      <ProductGrid labelledBy={COSMETICS_SHELF_ID}>
        <li className="text-body text-ink-secondary">目前沒有外觀商品</li>
      </ProductGrid>
    );
  } else if (shown.length === 0) {
    body = (
      <p className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-2 text-body text-ink-secondary">
        這類外觀你都擁有了
        <TextLink href={shopCosmeticsHref(current, false)}>顯示已擁有</TextLink>
      </p>
    );
  } else if (shown.length === 1) {
    body = (
      <ProductGrid labelledBy={COSMETICS_SHELF_ID}>
        {shown[0].items.map((item) => cosmeticCard(item, signIn))}
      </ProductGrid>
    );
  } else {
    body = shown.map((group) => {
      const headingId = `${COSMETICS_SHELF_ID}-${group.key}`;
      return (
        <section key={group.key} aria-labelledby={headingId} className="mt-10">
          <Heading level={3} id={headingId}>
            {group.label}
          </Heading>
          <ProductGrid labelledBy={headingId}>
            {group.items.map((item) => cosmeticCard(item, signIn))}
          </ProductGrid>
        </section>
      );
    });
  }

  return (
    <ProductShelf id={COSMETICS_SHELF_ID} title="外觀" grid={false}>
      {groups.length > 0 && (
        <ShopCosmeticTabs
          groups={groups}
          current={current}
          hideOwned={hideOwned}
          signedIn={signedIn}
        />
      )}
      {body}
    </ProductShelf>
  );
}

/**
 * The point shop, open to everyone: square product cards on two shelves, each under its heading.
 * 冰炫風 holds the limited ice creams running now (tagged 期間限定; members claim one each per period)
 * and issuing your own; 點數任務 holds the ways to earn points: daily check-in, the running streak
 * campaign and the newbie quests (tagged 新手任務); 外觀 holds the cosmetics on sale (titles, scrim
 * room frames, stamp cards and ice cream cups, each previewed). Everything, quest states and what a
 * member owns included, comes from the backend.
 */
export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const [shop, profile, query] = await Promise.all([
    fetchShop(),
    fetchMemberProfile(),
    searchParams,
  ]);
  const signIn = (label: string) => (
    <TextLink href="/member/login">{label}</TextLink>
  );
  const checkInLink = profile ? (
    <TextLink href="/member?tab=points">前往簽到</TextLink>
  ) : (
    signIn("登入會員後即可簽到")
  );

  return (
    <main id="main">
      <Section spacing="tight" labelledBy="page-title">
        <PageHeader
          eyebrow="SHOP / POINTS"
          title="點數商店"
          description="簽到攢點數，換點好料。限定冰炫風手刀搶，自己發的冰炫風送朋友。"
          actions={<TextLink href="/ice-creams">冰炫風成長史冊</TextLink>}
        />
        <ShopJumpNav />
      </Section>

      <Section spacing="tight">
        <div className="flex flex-col gap-section-tight">
          <ProductShelf id="shelf-ice-creams" title="冰炫風">
            {shop.iceCampaigns.map((campaign) => (
              <ProductCard
                key={campaign.id}
                id={`product-${campaign.id}`}
                tag="期間限定"
                name={`${campaign.title}・冰炫風`}
                price="免費"
                terms={["每人限兌換一次", `${dateText(campaign.endDate)} 結束`]}
                action={
                  !profile ? (
                    signIn("登入會員後即可兌換")
                  ) : campaign.claimed ? (
                    <ShelfStatus kind="done">已兌換</ShelfStatus>
                  ) : (
                    <FriendActionButton
                      action={claimIceCampaignAction.bind(null, campaign.id)}
                      label="兌換"
                      primary
                    />
                  )
                }
              />
            ))}
            <ProductCard
              id="product-create"
              name="冰炫風"
              price={`${shop.createCost} 點`}
              terms={["送給好友", "由你兌現"]}
              action={
                profile ? (
                  <TextLink href="/member?tab=ice-creams">
                    到我的冰炫風建立
                  </TextLink>
                ) : (
                  signIn("登入會員後即可建立")
                )
              }
            />
          </ProductShelf>
          <ProductShelf id="shelf-tasks" title="點數任務">
            <ProductCard
              id="product-checkin"
              picture={
                <CalendarCheck aria-hidden="true" className={PICTURE_CLASSES} />
              }
              name="每日簽到"
              price={`+${shop.checkin.points} 點`}
              terms={["每天一次（台灣時間）"]}
              action={checkInLink}
            />
            {shop.streakCampaign && (
              <ProductCard
                id="product-streak"
                picture={
                  <Flame aria-hidden="true" className={PICTURE_CLASSES} />
                }
                name={shop.streakCampaign.title}
                price="+1 點"
                terms={[
                  `連續簽到滿 ${shop.streakCampaign.requiredDays} 天`,
                  `${dateText(shop.streakCampaign.endDate)} 結束`,
                ]}
                action={checkInLink}
              />
            )}
            {(shop.quests ?? []).map((quest) => {
              const Icon = questIcon(quest.code);
              return (
                <ProductCard
                  key={quest.code}
                  id={`product-quest-${quest.code}`}
                  tag="新手任務"
                  picture={
                    <Icon aria-hidden="true" className={PICTURE_CLASSES} />
                  }
                  name={quest.title}
                  price={`+${quest.points} 點`}
                  terms={[quest.description, "每人限領一次"]}
                  action={questAction(quest, signIn)}
                />
              );
            })}
          </ProductShelf>
          <CosmeticsShelf
            shop={shop}
            query={query}
            signedIn={profile !== null}
            signIn={signIn}
          />
        </div>
      </Section>
      {shop.balance !== null && <ShopBalance balance={shop.balance} />}
    </main>
  );
}
