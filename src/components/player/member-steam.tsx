import { MetaLabel } from "@/components/brand/meta-label";
import { TextLink } from "@/components/brand/text-link";
import { STEAM_ERROR_TEXT, isSteamError } from "@/lib/steam-login";
import type { SteamAccount } from "@/types/player";
import { SteamLoginLink } from "./steam-login-link";

type MemberSteamProps = {
  steam: SteamAccount | null;
  /** The ?steam= code /steam/callback sent back with ("linked" or an error code). */
  result?: string;
};

/**
 * The member's Steam account on the member page: linked (with the profile link; changing it is up
 * to an admin), or a link to sign in with Steam and bind it. Shows how the last attempt ended.
 */
export function MemberSteam({ steam, result }: MemberSteamProps) {
  return (
    <div className="mt-6 flex flex-col gap-3 border-b border-line pb-6">
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
          <SteamLoginLink intent="link" label="綁定 Steam" variant="secondary" />
        </div>
      )}
    </div>
  );
}
