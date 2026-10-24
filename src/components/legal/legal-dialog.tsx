import { X } from "lucide-react";
import { Eyebrow } from "@/components/brand/eyebrow";
import { MetaLabel } from "@/components/brand/meta-label";
import { Placeholder } from "@/components/brand/placeholder";
import { Heading } from "@/components/brand/typography";
import type { LegalDocument, LegalKey } from "@/types/legal";
import { formatTaipeiDate } from "@/utils/datetime";
import { parseLegalText } from "@/utils/legal-text";
import { LEGAL_DIALOG_ID } from "./legal-ids";

/** Titles used when the document could not be loaded (the backend sends its own otherwise). */
const FALLBACK_TITLE: Record<LegalKey, string> = { privacy: "隱私權政策", terms: "使用條款" };

type LegalDialogProps = {
  kind: LegalKey;
  /** The document, or null when it could not be loaded. */
  document: LegalDocument | null;
};

/**
 * One legal document as a popover dialog (opened by any button with its id as popoverTarget). The
 * popover attribute needs no JavaScript: the browser opens and closes it, Esc and a click outside
 * close it, and the close button's autofocus takes focus when it opens. Rendered on the server.
 */
export function LegalDialog({ kind, document }: LegalDialogProps) {
  const id = LEGAL_DIALOG_ID[kind];
  const title = document?.title ?? FALLBACK_TITLE[kind];
  const published = Boolean(document?.content.trim());

  return (
    <div id={id} popover="auto" role="dialog" aria-labelledby={`${id}-title`} className="legal-dialog">
      <header className="flex items-start justify-between gap-6 border-b border-line-subtle px-6 py-5">
        <div className="flex flex-col gap-3">
          <Eyebrow>{`Legal / ${kind}`}</Eyebrow>
          <Heading level={2} size={3} id={`${id}-title`}>
            {title}
          </Heading>
          {published && document?.updatedAt && (
            <MetaLabel>{`Updated ${formatTaipeiDate(document.updatedAt)}`}</MetaLabel>
          )}
        </div>
        <button
          type="button"
          popoverTarget={id}
          popoverTargetAction="hide"
          autoFocus
          aria-label="關閉"
          className="legal-dialog-close -mt-1 -mr-2 inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-transparent text-ink-secondary hover:border-signal hover:text-ink focus-visible:border-signal"
        >
          <X aria-hidden="true" className="size-5" />
        </button>
      </header>
      <div className="legal-dialog-body px-6 py-6">
        {!document ? (
          <p className="text-body text-ink-secondary">目前無法載入，請稍後再試。</p>
        ) : published ? (
          <LegalText text={document.content} />
        ) : (
          <Placeholder name={`legal.${kind}`} label={title} />
        )}
      </div>
    </div>
  );
}

/** The admin's plain text laid out as headings, paragraphs and lists; never read as HTML. */
function LegalText({ text }: { text: string }) {
  return (
    <div className="flex max-w-[65ch] flex-col gap-4 text-body text-ink-secondary">
      {parseLegalText(text).map((block, index) => {
        if (block.type === "heading") {
          return (
            <h3 key={index} className="mt-4 font-heading text-h3 text-ink first:mt-0">
              {block.text}
            </h3>
          );
        }
        if (block.type === "list") {
          return (
            <ul key={index} className="flex list-disc flex-col gap-1 pl-5 marker:text-signal">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{item}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={index}>
            {block.lines.map((line, lineIndex) => (
              <span key={lineIndex}>
                {lineIndex > 0 && <br />}
                {line}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
