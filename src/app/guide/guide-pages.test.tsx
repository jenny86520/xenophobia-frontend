import { render, screen, within } from "@testing-library/react";
import { fetchGuide, fetchGuides } from "@/lib/public-content-client";
import type { Guide } from "@/types/guide";
import GuideItemPage from "./[ref]/page";
import GuidePage from "./page";

jest.mock("@/lib/public-content-client", () => ({ fetchGuides: jest.fn(), fetchGuide: jest.fn() }));
const mockNotFound = jest.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});
jest.mock("next/navigation", () => ({ notFound: () => mockNotFound() }));

const guide = (overrides: Partial<Guide> = {}): Guide => ({
  ref: "checkin",
  title: "每日簽到",
  content: "# 怎麼簽到\n\n- 到點數分頁\n- 按「簽到」",
  imageUrl: null,
  imageAlt: "每日簽到",
  video: null,
  ...overrides,
});

const itemProps = (ref: string) =>
  ({ params: Promise.resolve({ ref }), searchParams: Promise.resolve({}) }) as unknown as PageProps<"/guide/[ref]">;

describe("/guide", () => {
  it("lists the published guides in the backend's order, each linking to its page", async () => {
    (fetchGuides as jest.Mock).mockResolvedValue([
      { ref: "checkin", title: "每日簽到", kind: "fixed" },
      { ref: "f1", title: "新手入門", kind: "free" },
    ]);
    render(await GuidePage());

    const links = within(screen.getByRole("list", { name: "使用手冊" })).getAllByRole("link");
    expect(links.map((a) => [a.textContent, a.getAttribute("href")])).toEqual([
      ["每日簽到", "/guide/checkin"],
      ["新手入門", "/guide/f1"],
    ]);
  });

  it("says when nothing is published yet", async () => {
    (fetchGuides as jest.Mock).mockResolvedValue([]);
    render(await GuidePage());
    expect(screen.getByText("使用手冊還在準備中。")).toBeInTheDocument();
  });
});

describe("/guide/[ref]", () => {
  it("shows the title, the video and the laid-out text", async () => {
    (fetchGuide as jest.Mock).mockResolvedValue(
      guide({
        video: { source: "youtube", youtubeId: "dQw4w9WgXcQ" },
        imageUrl: "/media/images/a.png",
        imageAlt: "簽到按鈕",
      }),
    );
    render(await GuideItemPage(itemProps("checkin")));

    expect(screen.getByRole("heading", { level: 1, name: "每日簽到" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "怎麼簽到" })).toBeInTheDocument();
    expect(screen.getByTitle("每日簽到教學影片")).toHaveAttribute(
      "src",
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?playsinline=1&rel=0",
    );
    expect(screen.getByRole("img", { name: "簽到按鈕" })).toHaveAttribute(
      "src",
      expect.stringMatching(/\/media\/images\/a\.png$/),
    );
  });

  it("plays an uploaded video with controls and no autoplay", async () => {
    (fetchGuide as jest.Mock).mockResolvedValue(
      guide({ video: { source: "upload", url: "/media/videos/v.mp4", mimeType: "video/mp4" } }),
    );
    const { container } = render(await GuideItemPage(itemProps("checkin")));

    const video = container.querySelector("video");
    expect(video).toHaveAttribute("controls");
    expect(video).not.toHaveAttribute("autoplay");
  });

  it("is a real 404 for a guide that is not published", async () => {
    (fetchGuide as jest.Mock).mockResolvedValue(null);
    await expect(GuideItemPage(itemProps("ice-cream"))).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
