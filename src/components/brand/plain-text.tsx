import { cn } from "@/lib/utils";
import { parseLegalText } from "@/utils/legal-text";

type PlainTextProps = {
  text: string;
  /** The level of the "# " headings, below the heading of whatever holds the text. */
  headingLevel?: 2 | 3 | 4;
  /** Merged onto the wrapper, e.g. to keep the type size or measure of the place it replaces. */
  className?: string;
};

const HEADING_TAGS = { 2: "h2", 3: "h3", 4: "h4" } as const;

/**
 * An admin's plain text (legal documents, news, guides, party and sub-party descriptions) laid out as headings, paragraphs and lists, as
 * parseLegalText reads it: a blank line starts a block, "# " is a heading, "- " a list item. It is
 * never read as HTML.
 */
export function PlainText({ text, headingLevel = 3, className }: PlainTextProps) {
  const HeadingTag = HEADING_TAGS[headingLevel];
  return (
    <div className={cn("flex max-w-[65ch] flex-col gap-4 text-body text-ink-secondary", className)}>
      {parseLegalText(text).map((block, index) => {
        if (block.type === "heading") {
          return (
            <HeadingTag
              key={index}
              // Under a sub-party's h3 title a smaller size keeps the title the larger of the two.
              className={cn("mt-4 font-heading text-h3 text-ink first:mt-0", headingLevel === 4 && "text-lead")}
            >
              {block.text}
            </HeadingTag>
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
