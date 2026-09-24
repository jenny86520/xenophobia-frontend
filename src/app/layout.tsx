import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Xenophobia Team | Official Site",
  description: "Official team website for events, community updates, and team profile information.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <div className="site-shell">
          <header className="site-header">
            <div className="brand-block">
              <span className="brand-mark">X</span>
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
          {children}
          <footer className="site-footer">
            <p>© 2026 Xenophobia Team</p>
            <div>
              <Link href="/party">Events</Link>
              <Link href="/about">About</Link>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
