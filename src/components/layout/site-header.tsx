import Image from "next/image";
import Link from "next/link";

/** Brand mark + primary navigation, extracted from the root layout for reuse/testability. */
export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="brand-block">
        <Image
          src="/brand/xpa-logo.png"
          alt="XPA"
          width={40}
          height={40}
          className="brand-mark"
          priority
        />
        <div>
          <strong>Xenophobia</strong>
          <span>Official Team</span>
        </div>
      </div>
      <nav className="top-nav" aria-label="Main navigation">
        <Link href="/">Home</Link>
        <Link href="/party">Party</Link>
        <Link href="/about">About</Link>
      </nav>
    </header>
  );
}
