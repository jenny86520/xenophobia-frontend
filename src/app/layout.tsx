import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Serif_TC } from "next/font/google";
import { BackToTop } from "@/components/layout/back-to-top";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { fetchAboutContent } from "@/lib/public-content-client";
// Read on the server only (this layout is a Server Component), so package.json never reaches the client bundle.
import { version } from "../../package.json";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Chinese editorial headings. No CJK subset exists to preload, so Google Fonts
// serves unicode-range slices on demand; only the two weights in use are loaded.
const notoSerifTc = Noto_Serif_TC({
  variable: "--font-noto-serif-tc",
  weight: ["600", "900"],
  preload: false,
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "XenoPhobiA | Official Site", template: "%s | XenoPhobiA" },
  description: "XenoPhobiA 遊戲社群官方網站：活動、里程碑與團隊介紹。",
  openGraph: {
    type: "website",
    siteName: "XenoPhobiA",
    locale: "zh_TW",
    title: "XenoPhobiA | Official Site",
    description: "XenoPhobiA 遊戲社群官方網站：活動、里程碑與團隊介紹。",
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Header and footer must not take the whole site down with the backend; pages that
  // need this data fetch it themselves (React.cache de-duplicates) and surface errors.
  const about = await fetchAboutContent().catch(() => null);
  const profile = about?.teamProfile;
  const brandName = profile?.name || "XenoPhobiA";
  const cta = profile?.primaryCtaLabel && profile.primaryCtaUrl ? { label: profile.primaryCtaLabel, href: profile.primaryCtaUrl } : null;

  return (
    <html
      lang="zh-Hant-TW"
      className={`dark ${geistSans.variable} ${geistMono.variable} ${notoSerifTc.variable}`}
      suppressHydrationWarning
    >
      {/* Browser extensions (e.g. ColorZilla's cz-shortcut-listen) add attributes to <html>/<body>
         before hydration; suppressHydrationWarning ignores only these elements' own attributes. */}
      <body className="flex min-h-screen flex-col antialiased" suppressHydrationWarning>
        <span id="top" />
        <a
          href="#main"
          className="sr-only z-50 bg-cta px-4 py-2 text-cta-ink focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
        >
          跳到主要內容
        </a>
        <SiteHeader brandName={brandName} cta={cta} />
        <div className="flex flex-1 flex-col">{children}</div>
        <SiteFooter brandName={brandName} about={about} version={version} />
        <BackToTop />
      </body>
    </html>
  );
}
