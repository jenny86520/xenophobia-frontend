import type { ReactNode } from "react";
import type { LegalConsentChangesDocument, LegalDiffBlock, LegalDiffLine } from "@/types/member";

type Comparison = LegalConsentChangesDocument["comparison"];

/**
 * What changed in one document since the version the member agreed to, as the backend compared it:
 * removed lines (−, struck through) and added lines (+, underlined), rewritten words marked inside a line,
 * long unchanged stretches folded. All text is rendered as text, never as HTML.
 */
export function LegalChanges({ title, comparison }: { title: string; comparison: Comparison }) {
  if (!comparison) {
    return <p className="text-caption text-ink-secondary">沒有你先前同意版本的紀錄，請點文件名稱閱讀全文。</p>;
  }
  if (comparison.blocks.length === 0) {
    return <p className="text-caption text-ink-secondary">內容與你先前同意的第 {comparison.fromVersion} 版相同。</p>;
  }
  return (
    <div className="flex flex-col gap-2">
      <p className="text-caption text-ink-secondary">
        與你同意的第 {comparison.fromVersion} 版相比：
        <del className={REMOVED_CLASSES}>刪除</del>的文字加刪除線，
        <ins className={ADDED_CLASSES}>新增</ins>的文字加底線。
      </p>
      <div
        role="region"
        aria-label={`${title}的變更`}
        tabIndex={0}
        className="max-h-112 overflow-y-auto border border-line bg-surface p-3 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        {comparison.blocks.map((block, index) => (
          <DiffBlock key={index} block={block} />
        ))}
      </div>
    </div>
  );
}

const REMOVED_CLASSES = "bg-destructive/20 text-ink line-through decoration-destructive";
const ADDED_CLASSES = "bg-success/20 text-ink underline decoration-success underline-offset-4";

function DiffBlock({ block }: { block: LegalDiffBlock }) {
  if (block.kind === "omitted") {
    return <p className="py-1 pl-6 text-caption text-ink-muted">⋯ 省略 {block.lineCount} 行未變動</p>;
  }
  if (block.kind === "unchanged") {
    return block.lines.map((line, index) => (
      <DiffLineRow key={index} marker=" " label="未變動：">
        <span className="text-ink-secondary">{line}</span>
      </DiffLineRow>
    ));
  }
  // A rewritten line keeps shared text; a wholly removed or added line is one segment.
  const rewritten = (line: LegalDiffLine) => line.some((segment) => segment.change === "same");
  return (
    <>
      {block.removed.map((line, index) => (
        <DiffLineRow key={`r${index}`} marker="−" label={rewritten(line) ? "修改前：" : "刪除："}>
          <DiffSegments line={line} />
        </DiffLineRow>
      ))}
      {block.added.map((line, index) => (
        <DiffLineRow key={`a${index}`} marker="+" label={rewritten(line) ? "修改後：" : "新增："}>
          <DiffSegments line={line} />
        </DiffLineRow>
      ))}
    </>
  );
}

function DiffLineRow({ marker, label, children }: { marker: string; label: string; children: ReactNode }) {
  return (
    <p className="flex gap-2 py-0.5 text-body">
      <span aria-hidden="true" className="w-4 shrink-0 text-center font-mono text-ink-muted">
        {marker}
      </span>
      <span className="min-w-0 break-words whitespace-pre-wrap">
        <span className="sr-only">{label}</span>
        {children}
      </span>
    </p>
  );
}

function DiffSegments({ line }: { line: LegalDiffLine }) {
  return line.map((segment, index) => {
    if (segment.change === "removed") {
      return (
        <del key={index} className={REMOVED_CLASSES}>
          {segment.text}
        </del>
      );
    }
    if (segment.change === "added") {
      return (
        <ins key={index} className={ADDED_CLASSES}>
          {segment.text}
        </ins>
      );
    }
    return <span key={index}>{segment.text}</span>;
  });
}
