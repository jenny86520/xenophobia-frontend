/** One block of a legal document as the site lays it out. */
export type LegalBlock =
  { type: "heading"; text: string } | { type: "paragraph"; lines: string[] } | { type: "list"; items: string[] };

/**
 * Lays out the plain text an admin wrote: blank lines separate blocks, a line starting with "# " is
 * a heading, consecutive lines starting with "- " form a list, and other lines are paragraphs (single
 * line breaks kept). Nothing is read as HTML: the blocks hold text only, which React escapes.
 */
export function parseLegalText(text: string): LegalBlock[] {
  const blocks: LegalBlock[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  const flush = () => {
    if (paragraph.length) blocks.push({ type: "paragraph", lines: paragraph });
    if (list.length) blocks.push({ type: "list", items: list });
    paragraph = [];
    list = [];
  };

  for (const raw of text.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flush();
    } else if (line.startsWith("# ")) {
      flush();
      blocks.push({ type: "heading", text: line.slice(2).trim() });
    } else if (line.startsWith("- ")) {
      if (paragraph.length) flush();
      list.push(line.slice(2).trim());
    } else {
      if (list.length) flush();
      paragraph.push(line);
    }
  }
  flush();
  return blocks;
}
