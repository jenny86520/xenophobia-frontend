import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CalendarCheck, Flame } from "lucide-react";
import { buyCosmeticAction, claimIceCampaignAction, claimQuestAction } from "@/app/member/actions";
import { PageHeader } from "@/components/brand/page-header";
import { Section } from "@/components/brand/section";
import { TextLink } from "@/components/brand/text-link";
import { CosmeticPreview } from "@/components/cosmetics/cosmetic-preview";
import { FriendActionButton } from "@/components/member/friend-forms";
import { BuyCosmeticForm } from "@/components/shop/buy-cosmetic-form";
import { ProductCard, ProductShelf } from "@/components/shop/product-card";
import { ShopBalance } from "@/components/shop/shop-balance";
import { fetchMemberProfile } from "@/lib/member-session";
import { fetchShop } from "@/lib/public-content-client";
import type { ShopCosmetic } from "@/types/cosmetic";
import type { ShopQuest } from "@/types/quest";
import { cosmeticTerms } from "@/utils/cosmetics";
import { questHref, questIcon } from "@/utils/quests";

export const metadata: Metadata = {
  title: "Shop",
  description: "XenoPhobiA 點數商店：限定冰炫風、每日簽到、連續簽到活動、新手任務與外觀。",
};

const dateText = (date: string) => date.replaceAll("-", "/");

const PICTURE_CLASSES = "size-14";

/** A quest card's action, from the backend's state (null for visitors). */
function questAction(quest: ShopQuest, signIn: (label: string) => ReactNode) {
  if (quest.state === null) return signIn("登入會員後即可領取");
  if (quest.state === "claimable") {
    return <FriendActionButton action={claimQuestAction.bind(null, quest.code)} label="領取" primary />;
  }
  if (quest.state === "claimed") return <span className="text-body text-ink-secondary">已領取</span>;
  const href = questHref(quest.code);
  return href ? <TextLink href={href}>去完成</TextLink> : null;
}

/** A cosmetic card's action: buy, 已擁有 (collectibles) or a sign-in for visitors. */
function cosmeticAction(item: ShopCosmetic, signIn: (label: string) => ReactNode) {
  if (item.owned === null && item.stock === null) return signIn("登入會員後即可購買");
  return <BuyCosmeticForm buy={buyCosmeticAction.bind(null, item.id, item.price)} owned={item.owned === true} />;
}

/**
 * The point shop, open to everyone: square product cards on two shelves, each under its heading.
 * 冰炫風 holds the limited ice creams running now (tagged 期間限定; members claim one each per period)
 * and issuing your own; 點數任務 holds the ways to earn points: daily check-in, the running streak
 * campaign and the newbie quests (tagged 新手任務); 外觀 holds the cosmetics on sale (titles, scrim
 * room frames, stamp cards and ice cream cups, each previewed). Everything, quest states and what a
 * member owns included, comes from the backend.
 */
export default async function ShopPage() {
  const [shop, profile] = await Promise.all([fetchShop(), fetchMemberProfile()]);
  const signIn = (label: string) => <TextLink href="/member/login">{label}</TextLink>;
  const checkInLink = profile ? <TextLink href="/member?tab=points">前往簽到</TextLink> : signIn("登入會員後即可簽到");

  return (
    <main id="main">
      <Section spacing="tight" labelledBy="page-title">
        <PageHeader
          eyebrow="SHOP / POINTS"
          title="點數商店"
          description="簽到攢點數，換點好料。限定冰炫風手刀搶，自己發的冰炫風送朋友。"
          actions={<TextLink href="/ice-creams">冰炫風成長史冊</TextLink>}
        />
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
                    <span className="text-body text-ink-secondary">已兌換</span>
                  ) : (
                    <FriendActionButton action={claimIceCampaignAction.bind(null, campaign.id)} label="兌換" primary />
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
                  <TextLink href="/member?tab=ice-creams">到我的冰炫風建立</TextLink>
                ) : (
                  signIn("登入會員後即可建立")
                )
              }
            />
          </ProductShelf>
          <ProductShelf id="shelf-tasks" title="點數任務">
            <ProductCard
              id="product-checkin"
              picture={<CalendarCheck aria-hidden="true" className={PICTURE_CLASSES} />}
              name="每日簽到"
              price={`+${shop.checkin.points} 點`}
              terms={["每天一次（台灣時間）"]}
              action={checkInLink}
            />
            {shop.streakCampaign && (
              <ProductCard
                id="product-streak"
                picture={<Flame aria-hidden="true" className={PICTURE_CLASSES} />}
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
                  picture={<Icon aria-hidden="true" className={PICTURE_CLASSES} />}
                  name={quest.title}
                  price={`+${quest.points} 點`}
                  terms={[quest.description, "每人限領一次"]}
                  action={questAction(quest, signIn)}
                />
              );
            })}
          </ProductShelf>
          <ProductShelf id="shelf-cosmetics" title="外觀">
            {(shop.cosmetics ?? []).length === 0 ? (
              <li className="text-body text-ink-secondary">目前沒有外觀商品</li>
            ) : (
              (shop.cosmetics ?? []).map((item) => (
                <ProductCard
                  key={item.id}
                  id={`product-cosmetic-${item.id}`}
                  picture={<CosmeticPreview kind={item.kind} look={item.look} />}
                  name={item.name}
                  price={`${item.price} 點`}
                  terms={item.stock === null ? [cosmeticTerms(item.kind)] : [cosmeticTerms(item.kind), `庫存 ${item.stock}`]}
                  action={cosmeticAction(item, signIn)}
                />
              ))
            )}
          </ProductShelf>
        </div>
      </Section>
      {shop.balance !== null && <ShopBalance balance={shop.balance} />}
    </main>
  );
}
