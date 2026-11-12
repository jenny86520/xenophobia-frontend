import { CtaLink } from "@/components/brand/cta-link";
import { MetaLabel } from "@/components/brand/meta-label";
import { TextLink } from "@/components/brand/text-link";
import { GuideButton } from "@/components/guide/guide-button";
import { STEAM_ERROR_TEXT, isSteamError } from "@/lib/steam-login";
import type { Guide } from "@/types/guide";
import type { SteamAccount } from "@/types/player";
import { SteamLinkForm } from "./steam-link-form";

type MemberSteamProps = {
  steam: SteamAccount | null;
  /** The member may create scrims (the backend's canCreateMatch): a shortcut on the right of the row. */
  createMatch?: boolean;
  /** The ?steam= code /steam/callback sent back with ("linked" or an error code). */
  result?: string;
  /** The published Steam security guide (「安全嗎？」 beside the link form), null hides the button. */
  guide?: Guide | null;
};

/**
 * The member's Steam account on the member page: linked (with the profile link; changing it is up
 * to an admin), or the form that asks for the password again before going to Steam to bind it.
 * Shows how the last attempt ended.
 */
export function MemberSteam({ steam, result, createMatch, guide = null }: MemberSteamProps) {
  return (
    <div className="mt-6 flex flex-wrap items-start justify-between gap-x-8 gap-y-4 border-b border-line pb-6">
      <div className="flex min-w-0 flex-col gap-3">
        <MetaLabel>Steam 帳號</MetaLabel>
        {result === "linked" && (
          <p role="status" className="text-body text-ink">
            已綁定 Steam 帳號。
          </p>
        )}
        {isSteamError(result) && (
          <p role="alert" className="border-l-2 border-signal pl-3 text-body text-ink">
            {STEAM_ERROR_TEXT[result]}
          </p>
        )}
        {steam ? (
          <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-body text-ink">
            <span className="text-lead break-all">{steam.steamName ?? steam.steamId}</span>
            <TextLink href={steam.profileUrl}>Steam 個人頁</TextLink>
            <span className="text-ink-secondary">如需更換請聯絡管理員。</span>
          </p>
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-body text-ink-secondary">
              參加內戰需要綁定 Steam 帳號。如果你曾以訪客身分用同一個 Steam 帳號參加過，紀錄會一併歸到會員帳號。
            </p>
            <GuideButton guide={guide} label="安全嗎？" />
            <SteamLinkForm />
          </div>
        )}
      </div>
      {createMatch && <CtaLink href="/matches/new" label="建立內戰場次" />}
    </div>
  );
}
