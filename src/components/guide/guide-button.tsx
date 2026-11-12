import { InfoDialog } from "@/components/brand/info-dialog";
import { PlainText } from "@/components/brand/plain-text";
import { TextLink } from "@/components/brand/text-link";
import type { Guide } from "@/types/guide";
import { GuideMedia } from "./guide-media";

/**
 * The button beside a feature (「怎麼玩？」, or another `label` such as Steam's 「安全嗎？」): opens that
 * feature's guide (image, video, text) in a native popover dialog, with a link to its page. The page
 * fetches the guide (fetchGuide, null while unpublished); nothing renders without one. A page that
 * shows the same guide twice gives each button its own `idSuffix`, so the dialogs' ids stay unique.
 */
export function GuideButton({
  guide,
  label = "怎麼玩？",
  idSuffix,
}: {
  guide: Guide | null;
  label?: string;
  idSuffix?: string;
}) {
  if (!guide) return null;
  const id = idSuffix ? `guide-${guide.ref}-${idSuffix}` : `guide-${guide.ref}`;
  return (
    <InfoDialog id={id} title={guide.title} label={label} size="wide">
      <GuideMedia guide={guide} />
      <PlainText text={guide.content} />
      <TextLink href={`/guide/${guide.ref}`} className="self-start">
        看完整手冊
      </TextLink>
    </InfoDialog>
  );
}
