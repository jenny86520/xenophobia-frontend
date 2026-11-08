import { InfoDialog } from "@/components/brand/info-dialog";
import { PlainText } from "@/components/brand/plain-text";
import { TextLink } from "@/components/brand/text-link";
import type { Guide } from "@/types/guide";
import { GuideMedia } from "./guide-media";

/**
 * The 「怎麼玩？」 button beside a feature: opens that feature's guide (image, video, text) in a
 * native popover dialog, with a link to its page. The page fetches the guide (fetchGuide, null while
 * unpublished); nothing renders without one.
 */
export function GuideButton({ guide }: { guide: Guide | null }) {
  if (!guide) return null;
  return (
    <InfoDialog id={`guide-${guide.ref}`} title={guide.title} label="怎麼玩？" size="wide">
      <GuideMedia guide={guide} />
      <PlainText text={guide.content} />
      <TextLink href={`/guide/${guide.ref}`} className="self-start">
        看完整手冊
      </TextLink>
    </InfoDialog>
  );
}
