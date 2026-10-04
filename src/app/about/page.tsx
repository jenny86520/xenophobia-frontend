import type { Metadata } from "next";
import { BrandName } from "@/components/brand/brand-name";
import { EditorialGrid } from "@/components/brand/editorial-grid";
import { Eyebrow } from "@/components/brand/eyebrow";
import { formatCount } from "@/components/brand/meta-label";
import { PageHeader } from "@/components/brand/page-header";
import { Placeholder } from "@/components/brand/placeholder";
import { Section } from "@/components/brand/section";
import { Heading } from "@/components/brand/typography";
import { ContactList } from "@/components/contact/contact-list";
import { fetchAboutContent } from "@/lib/public-content-client";
import { Archive } from "../_sections/archive";
import { Games } from "../_sections/games";

export const metadata: Metadata = {
  title: "關於",
  description: "XenoPhobiA 的品牌宣言、使命、遊戲項目與里程碑。",
  openGraph: { title: "關於 | XenoPhobiA", description: "XenoPhobiA 的品牌宣言、使命、遊戲項目與里程碑。" },
};

/** Brand and team: statement, mission, games, milestone archive, contact, highlights. */
export default async function AboutPage() {
  const { teamProfile, games, milestones, contactInfo, highlights } = await fetchAboutContent();
  const paragraphs = teamProfile.mission.split(/\n\s*\n/).filter(Boolean);

  return (
    <main id="main">
      <Section spacing="tight" labelledBy="page-title">
        <PageHeader
          eyebrow="TEAM / PROFILE"
          title={<BrandName name={teamProfile.name} />}
          description={
            teamProfile.brandStatement || <Placeholder name="brand.statement" label="品牌宣言" className="min-h-24" />
          }
        />
      </Section>

      <Section labelledBy="mission-title" ruled className="reveal">
        <EditorialGrid className="gap-y-8">
          <div className="col-span-4 flex flex-col gap-4 md:col-span-8 lg:col-span-4">
            <Eyebrow index={1}>Mission</Eyebrow>
            <Heading level={2} id="mission-title">
              使命
            </Heading>
          </div>
          <div className="col-span-4 flex flex-col gap-6 md:col-span-8 lg:col-span-6 lg:col-start-5">
            {paragraphs.length > 0 ? (
              paragraphs.map((text, i) => (
                <p key={i} className="max-w-[65ch] text-lead text-ink-secondary">
                  {text}
                </p>
              ))
            ) : (
              <Placeholder name="brand.mission" label="使命" className="min-h-32" />
            )}
          </div>
        </EditorialGrid>
      </Section>

      <Games games={games} index={2} />
      <Archive milestones={milestones} index={3} layout="stacked" />

      <Section labelledBy="contact-title" ruled className="reveal">
        <EditorialGrid className="gap-y-12">
          <div className="col-span-4 flex flex-col gap-4 md:col-span-8 lg:col-span-4">
            <Eyebrow index={4}>Contact</Eyebrow>
            <Heading level={2} id="contact-title">
              聯絡
            </Heading>
          </div>
          <div className="col-span-4 md:col-span-8 lg:col-span-8 lg:col-start-5">
            {contactInfo.length > 0 ? (
              <ContactList contacts={contactInfo} />
            ) : (
              <Placeholder name="contact.any" label="聯絡資訊" className="min-h-24" />
            )}
          </div>
        </EditorialGrid>
      </Section>

      <Section labelledBy="highlights-title" ruled className="reveal">
        <EditorialGrid className="gap-y-12">
          <div className="col-span-4 flex flex-col gap-4 md:col-span-8 lg:col-span-3 lg:col-start-10 lg:row-start-1 lg:items-end lg:text-right">
            <Eyebrow index={5}>Highlights</Eyebrow>
            <Heading level={2} id="highlights-title">
              網站特色
            </Heading>
          </div>
          <div className="col-span-4 md:col-span-8 lg:col-span-8 lg:col-start-1 lg:row-start-1">
            {highlights.length > 0 ? (
              <ol className="border-b border-line">
                {highlights.map((item, index) => (
                  <li key={item} className="flex gap-6 border-t border-line py-5">
                    <span className="font-mono text-meta text-signal">{formatCount(index + 1)}</span>
                    <span className="text-lead text-ink">{item}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <Placeholder name="highlights" label="網站特色" className="min-h-24" />
            )}
          </div>
        </EditorialGrid>
      </Section>
    </main>
  );
}
