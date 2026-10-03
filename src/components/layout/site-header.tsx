import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/party", label: "Party" },
  { href: "/about", label: "About" },
];

/** Brand mark + primary navigation; stacks vertically below the `sm` breakpoint. */
export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex items-center gap-3 rounded-lg focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
          <Image
            src="/brand/xpa-logo.png"
            alt="XPA"
            width={40}
            height={40}
            className="rounded-md"
            priority
          />
          <div className="flex flex-col leading-tight">
            <strong className="text-base font-semibold">Xenophobia</strong>
            <span className="text-xs text-muted-foreground">Official Team</span>
          </div>
        </Link>
        <nav aria-label="Main navigation" className="flex flex-wrap gap-1">
          {NAV_ITEMS.map((item) => (
            <Button key={item.href} variant="ghost" asChild>
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>
      </div>
    </header>
  );
}
