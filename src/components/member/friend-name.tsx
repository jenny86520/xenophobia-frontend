import { TextLink } from "@/components/brand/text-link";

/** A friend's page on the member area. */
export const friendHref = (memberId: string) => `/member/friends/${encodeURIComponent(memberId)}`;

/**
 * A friend's nickname, linked to their page when `href` is given, followed by the viewer's own private
 * note (announced as 備註 to screen readers). Used wherever the member's friends are listed.
 */
export function FriendName({ nickname, note, href }: { nickname: string; note?: string | null; href?: string }) {
  return (
    <span className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
      {href ? (
        <TextLink href={href} className="text-lead break-all text-ink">
          {nickname}
        </TextLink>
      ) : (
        <span className="text-lead break-all text-ink">{nickname}</span>
      )}
      {note && (
        <span className="text-body break-all text-ink-secondary">
          <span className="sr-only">備註：</span>
          {note}
        </span>
      )}
    </span>
  );
}
