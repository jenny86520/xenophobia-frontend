import { cn } from "@/lib/utils";
import type { CosmeticLook } from "@/types/cosmetic";
import { skinVars } from "@/utils/cosmetics";
import { TITLE_ICONS } from "./title-icons";

/**
 * A member's equipped title beside their nickname (spec member-cosmetics). Always text, the icon is
 * decoration; colours come in as CSS variables only. `title.basic` is one colour, `title.gradient`
 * runs from its first colour to its second; an unknown template shows the text in the default ink.
 */
export function MemberTitleTag({ look, className }: { look: CosmeticLook | null | undefined; className?: string }) {
  const text = typeof look?.params.text === "string" ? look.params.text : "";
  if (!look || !text) return null;
  const Icon = typeof look.params.icon === "string" ? TITLE_ICONS[look.params.icon] : undefined;
  const gradient = look.template === "title.gradient";
  const known = gradient || look.template === "title.basic";
  const style = gradient
    ? skinVars(look.params, { "--skin-text": "fromColor", "--skin-to": "toColor" })
    : skinVars(look.params, { "--skin-text": "textColor" });
  return (
    <span
      data-member-title={look.template}
      style={known ? style : undefined}
      className={cn(
        "inline-flex max-w-full shrink-0 items-center gap-1 rounded-sm border px-1.5 py-0.5 align-middle text-caption leading-none",
        known
          ? "border-[color-mix(in_oklch,var(--skin-text)_45%,transparent)] text-(--skin-text)"
          : "border-line-strong text-ink-secondary",
        className,
      )}
    >
      {Icon && <Icon aria-hidden="true" className="size-3.5 shrink-0" />}
      <span className="sr-only">稱號：</span>
      <span
        className={cn(
          "truncate",
          gradient &&
            known &&
            "bg-[linear-gradient(90deg,var(--skin-text),var(--skin-to,var(--skin-text)))] bg-clip-text text-transparent",
        )}
      >
        {text}
      </span>
    </span>
  );
}
