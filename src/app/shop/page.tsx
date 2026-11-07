import type { Metadata } from "next";
import { CalendarCheck, Flame } from "lucide-react";
import { claimIceCampaignAction } from "@/app/member/actions";
import { PageHeader } from "@/components/brand/page-header";
import { Section } from "@/components/brand/section";
import { TextLink } from "@/components/brand/text-link";
import { FriendActionButton } from "@/components/member/friend-forms";
import { ProductCard, ProductShelf } from "@/components/shop/product-card";
import { ShopBalance } from "@/components/shop/shop-balance";
import { fetchMemberProfile } from "@/lib/member-session";
import { fetchShop } from "@/lib/public-content-client";

export const metadata: Metadata = {
  title: "Shop",
  description: "XenoPhobiA 點數商店：每日簽到、連續簽到活動與限定冰炫風。",
};

const dateText = (date: string) => date.replaceAll("-", "/");

const PICTURE_CLASSES = "size-14";

/**
 * The point shop, open to everyone: one shelf of square product cards, no category headings.
 * The limited ice creams running now come first (tagged 期間限定; members claim one each per
 * period), then issuing your own, then the ways to earn points (daily check-in and the running
 * streak campaign). Everything comes from the backend.
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
        <ProductShelf label="商品">
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
        </ProductShelf>
      </Section>
      {shop.balance !== null && <ShopBalance balance={shop.balance} />}
    </main>
  );
}
