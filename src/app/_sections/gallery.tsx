import { Container } from "@/components/brand/container";
import { EditorialGrid } from "@/components/brand/editorial-grid";
import { Eyebrow } from "@/components/brand/eyebrow";
import { MediaFrame } from "@/components/brand/media-frame";
import { Section } from "@/components/brand/section";
import { Heading } from "@/components/brand/typography";

/** 6 · Gallery: what it looks like on the night. No photos exist yet, so every frame is a placeholder. */
export function Gallery() {
  return (
    <Section labelledBy="gallery-title" ruled bleed className="reveal" id="gallery">
      <Container>
        <div className="flex flex-col gap-4">
          <Eyebrow index={5}>Gallery</Eyebrow>
          <Heading level={2} id="gallery-title">
            活動現場
          </Heading>
        </div>
        <EditorialGrid className="mt-12 gap-y-6">
          <MediaFrame
            ratio="16/9"
            alt=""
            placeholderName="gallery.photo-1"
            placeholderLabel="活動照片"
            className="col-span-4 md:col-span-8 lg:col-span-7"
          />
          <MediaFrame
            ratio="4/5"
            alt=""
            placeholderName="gallery.photo-2"
            placeholderLabel="活動照片"
            className="col-span-4 md:col-span-4 lg:col-span-5"
          />
          <MediaFrame
            ratio="1/1"
            alt=""
            placeholderName="gallery.photo-3"
            placeholderLabel="活動照片"
            className="col-span-4 md:col-span-4 lg:col-span-4 lg:col-start-3"
          />
          <MediaFrame
            ratio="3/2"
            alt=""
            placeholderName="gallery.photo-4"
            placeholderLabel="活動照片"
            className="col-span-4 md:col-span-8 lg:col-span-6 lg:col-start-7"
          />
        </EditorialGrid>
      </Container>
    </Section>
  );
}
