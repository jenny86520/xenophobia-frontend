"use client";

import { useRef, useState, type MouseEvent } from "react";
import { XIcon } from "lucide-react";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CtaLink } from "@/components/brand/cta-link";
import { MetaLabel } from "@/components/brand/meta-label";
import { NavLinks } from "./nav-links";

type MobileMenuProps = {
  cta: { label: string; href: string } | null;
};

/**
 * Full-screen menu below 1024px (design §6). Radix Dialog traps focus, closes on Esc
 * and returns focus to the trigger; we move initial focus to the first link and
 * close when any link is chosen.
 */
export function MobileMenu({ cta }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const closeOnLink = (event: MouseEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest("a")) setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="inline-flex min-h-11 min-w-11 items-center justify-center px-2 font-mono text-meta tracking-[0.08em] text-ink uppercase focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none lg:hidden">
        Menu
      </SheetTrigger>
      <SheetContent
        side="top"
        showCloseButton={false}
        aria-describedby={undefined}
        className="h-dvh gap-0 border-0 bg-background px-gutter py-4 shadow-none data-open:duration-240 data-closed:duration-240 data-[side=top]:data-open:slide-in-from-top-2 data-[side=top]:data-closed:slide-out-to-top-2"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          navRef.current?.querySelector("a")?.focus();
        }}
      >
        <div className="flex items-center justify-between">
          <SheetTitle asChild>
            <MetaLabel>Menu</MetaLabel>
          </SheetTitle>
          <SheetClose className="inline-flex size-11 items-center justify-center text-ink focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
            <XIcon aria-hidden="true" className="size-5" />
            <span className="sr-only">關閉選單</span>
          </SheetClose>
        </div>
        <nav ref={navRef} aria-label="主要導覽" onClick={closeOnLink} className="mt-12 flex flex-col gap-10">
          <NavLinks className="flex-col gap-4" linkClassName="font-heading text-h1 text-ink" />
          {cta && (
            <div>
              <CtaLink href={cta.href} label={cta.label} size="large" />
            </div>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
