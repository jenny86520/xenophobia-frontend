import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import type { CosmeticLook } from "@/types/cosmetic";
import { skinVars } from "@/utils/cosmetics";
import { TITLE_ICONS } from "./title-icons";

type TitleSkin = { style: CSSProperties; tag: string; text?: string };

/** The tag's border in a mix of its text colour (single, gradient and shine titles). */
const OUTLINED = "border-[color-mix(in_oklch,var(--skin-text)_45%,transparent)] text-(--skin-text)";

/** Classes and CSS variables per known template; null for a template the site does not know. */
function titleSkin(look: CosmeticLook): TitleSkin | null {
  switch (look.template) {
    case "title.basic":
      return { style: skinVars(look.params, { "--skin-text": "textColor" }), tag: OUTLINED };
    case "title.gradient":
      return {
        style: skinVars(look.params, { "--skin-text": "fromColor", "--skin-to": "toColor" }),
        tag: OUTLINED,
        text: "bg-[linear-gradient(90deg,var(--skin-text),var(--skin-to,var(--skin-text)))] bg-clip-text text-transparent",
      };
    case "title.tag":
      // A solid tag: the text was checked against its own fill, not against the site.
      return {
        style: skinVars(look.params, { "--skin-text": "textColor", "--skin-fill": "fillColor" }),
        tag: "border-(--skin-fill) bg-(--skin-fill) text-(--skin-text)",
      };
    case "title.shine":
      // The sweep itself is .title-shine in globals.css (motion only without reduced motion).
      return {
        style: skinVars(look.params, { "--skin-text": "textColor", "--skin-shine": "shineColor" }),
        tag: OUTLINED,
        text: "title-shine",
      };
    default:
      return null;
  }
}

/**
 * A member's equipped title beside their nickname (spec member-cosmetics). Always text, the icon is
 * decoration; colours come in as CSS variables only. `title.basic` is one colour, `title.gradient`
 * runs from its first colour to its second, `title.tag` is a solid tag in its fill colour and
 * `title.shine` has a sweep of its shine colour across the text; an unknown template shows the text
 * in the default ink.
 */
export function MemberTitleTag({ look, className }: { look: CosmeticLook | null | undefined; className?: string }) {
  const text = typeof look?.params.text === "string" ? look.params.text : "";
  if (!look || !text) return null;
  const Icon = typeof look.params.icon === "string" ? TITLE_ICONS[look.params.icon] : undefined;
  const skin = titleSkin(look);
  return (
    <span
      data-member-title={look.template}
      style={skin?.style}
      className={cn(
        "inline-flex max-w-full shrink-0 items-center gap-1 rounded-sm border px-1.5 py-0.5 align-middle text-caption leading-none",
        skin ? skin.tag : "border-line-strong text-ink-secondary",
        className,
      )}
    >
      {Icon && <Icon aria-hidden="true" className="size-3.5 shrink-0" />}
      <span className="sr-only">稱號：</span>
      <span className={cn("truncate", skin?.text)}>{text}</span>
    </span>
  );
}
