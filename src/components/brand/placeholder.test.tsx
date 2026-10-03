import { render, screen } from "@testing-library/react";
import { Placeholder } from "./placeholder";
import { MediaFrame } from "./media-frame";

describe("Placeholder", () => {
  it("is clearly marked as missing content and carries a data-placeholder key", () => {
    const { container } = render(<Placeholder name="brand.tagline" label="品牌標語" />);

    const element = container.querySelector('[data-placeholder="brand.tagline"]');
    expect(element).not.toBeNull();
    expect(screen.getByText("Placeholder")).toBeInTheDocument();
    expect(screen.getByText("待提供：品牌標語")).toBeInTheDocument();
  });

  it("renders inline inside running text when asked", () => {
    const { container } = render(<Placeholder name="brand.founded-year" label="成立年份" inline />);
    expect(container.querySelector("span[data-placeholder]")).not.toBeNull();
  });
});

describe("MediaFrame", () => {
  it("shows a same-shape placeholder when there is no image", () => {
    const { container } = render(
      <MediaFrame ratio="4/5" alt="" placeholderName="gallery.photo-1" placeholderLabel="活動照片" />,
    );

    expect(container.querySelector('[data-placeholder="gallery.photo-1"]')).not.toBeNull();
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector(".aspect-\\[4\\/5\\]")).not.toBeNull();
  });
});
