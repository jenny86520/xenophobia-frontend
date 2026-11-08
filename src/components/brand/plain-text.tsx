import { parseLegalText } from "@/utils/legal-text";

type PlainTextProps = {
  text: string;
  /** The level of the "# " headings, below the heading of whatever holds the text. */
  headingLevel?: 2 | 3;
};

/**
 * An admin's plain text (legal documents, news) laid out as headings, paragraphs and lists, as
 * parseLegalText reads it: a blank line starts a block, "# " is a heading, "- " a list item. It is
 * never read as HTML.
 */
export function PlainText({ text, headingLevel = 3 }: PlainTextProps) {
  const HeadingTag = headingLevel === 2 ? "h2" : "h3";
  return (
    <div className="flex max-w-[65ch] flex-col gap-4 text-body text-ink-secondary">
      {parseLegalText(text).map((block, index) => {
        if (block.type === "heading") {
          return (
            <HeadingTag key={index} className="mt-4 font-heading text-h3 text-ink first:mt-0">
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
