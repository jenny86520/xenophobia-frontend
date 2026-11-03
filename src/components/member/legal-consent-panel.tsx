import { FileText } from "lucide-react";
import { MetaLabel } from "@/components/brand/meta-label";
import { LegalDialogButton } from "@/components/legal/legal-dialog-button";
import type { LegalConsent, LegalConsentChanges } from "@/types/member";
import { LegalChanges } from "./legal-changes";
import { LegalConsentForm } from "./member-forms";
import { MemberTabPanel } from "./member-tabs";

/**
 * Shown on the member page instead of the tabs while the member must agree to renewed terms: the
 * documents to read again (each name opens its full current text), each with what changed since the
 * member's version, then the consent form. The backend holds every member action until then. Without
 * `changes` (the backend could not be asked) the documents are listed without them.
 */
export function LegalConsentPanel({
  consent,
  changes,
}: {
  consent: LegalConsent;
  changes: LegalConsentChanges | null;
}) {
  const required = consent.documents.filter((document) => document.required);
  return (
    <MemberTabPanel id="consent-title" eyebrow="Terms / Updated" title="條款已更新">
      <p className="text-body text-ink-secondary">
        我們更新了下列文件。請先閱讀並同意，才能繼續報名活動、參加內戰、加好友或投稿影片；瀏覽網站不受影響。
      </p>
      <ul className="border-t border-line">
        {required.map((document) => {
          const documentChanges = changes?.documents.find((item) => item.key === document.key);
          return (
            <li key={document.key} className="flex flex-col gap-3 border-b border-line py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <span className="flex items-center gap-2 text-lead">
                  <FileText aria-hidden="true" className="size-4 text-ink-secondary" />
                  <LegalDialogButton kind={document.key}>{document.title}</LegalDialogButton>
                </span>
                <MetaLabel>第 {document.version} 版</MetaLabel>
              </div>
              {documentChanges && <LegalChanges title={document.title} comparison={documentChanges.comparison} />}
            </li>
          );
        })}
      </ul>
      <LegalConsentForm documents={consent.documents} />
    </MemberTabPanel>
  );
}
