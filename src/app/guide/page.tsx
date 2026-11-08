import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/brand/page-header";
import { Section } from "@/components/brand/section";
import { fetchGuides } from "@/lib/public-content-client";

export const metadata: Metadata = {
  title: "Guide",
  description: "XenoPhobiA 使用手冊：每日簽到、冰炫風等功能怎麼用。",
};

/** Every published guide: the features' own first, then the admins' articles. Open to everyone. */
export default async function GuidePage() {
  const guides = await fetchGuides();
  return (
    <main id="main">
      <Section spacing="tight" labelledBy="page-title">
        <PageHeader eyebrow="GUIDE / HOW TO" title="使用手冊" description="網站各項功能怎麼用，附教學影片。" />
      </Section>
      <Section spacing="tight">
        {guides.length === 0 ? (
          <p className="text-body text-ink-secondary">使用手冊還在準備中。</p>
        ) : (
          <ul aria-label="使用手冊">
            {guides.map((guide) => (
              <li key={guide.ref} className="list-row relative isolate overflow-hidden border-b border-line">
                <Link
                  href={`/guide/${guide.ref}`}
                  className="flex items-center justify-between gap-4 px-2 py-6 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  <h2 className="font-heading text-h3 text-ink">{guide.title}</h2>
                  <ArrowRight aria-hidden="true" className="list-row-arrow size-5 shrink-0 text-ink-muted" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </main>
  );
}
