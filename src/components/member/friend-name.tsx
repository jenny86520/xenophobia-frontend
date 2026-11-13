import { TextLink } from "@/components/brand/text-link";
import { MemberTitleTag } from "@/components/cosmetics/member-title-tag";
import type { CosmeticLook } from "@/types/cosmetic";

/** A friend's page on the member area. */
export const friendHref = (memberId: string) => `/member/friends/${encodeURIComponent(memberId)}`;

/**
 * A friend's nickname, linked to their page when `href` is given, their equipped title, then the
 * viewer's own private note (announced as 備註 to screen readers). Used wherever the member's friends
 * are listed.
 */
export function FriendName({
  nickname,
  note,
  href,
  memberTitle,
}: {
  nickname: string;
  note?: string | null;
  href?: string;
  memberTitle?: CosmeticLook | null;
}) {
  return (
    <span className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
      {href ? (
        <TextLink href={href} className="text-lead break-all text-ink">
          {nickname}
        </TextLink>
      ) : (
        <span className="text-lead break-all text-ink">{nickname}</span>
      )}
      <MemberTitleTag look={memberTitle} className="self-center" />
      {note && (
        <span className="text-body break-all text-ink-secondary">
          <span className="sr-only">備註：</span>
          {note}
        </span>
      )}
    </span>
  );
}
