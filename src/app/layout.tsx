import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/layout/site-header";
import { MetaLabel } from "@/components/layout/meta-label";
// Read on the server only (this layout is a Server Component), so package.json never reaches the client bundle.
import { version } from "../../package.json";
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
  description:
    "Official team website for events, community updates, and team profile information.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`dark ${geistSans.variable} ${geistMono.variable}`}>
      <body className="flex min-h-screen flex-col antialiased">
        <SiteHeader />
        <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:py-16">{children}</div>
        <footer className="border-t">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 Xenophobia Team</p>
            <MetaLabel>Build {version}</MetaLabel>
          </div>
        </footer>
      </body>
    </html>
  );
}

