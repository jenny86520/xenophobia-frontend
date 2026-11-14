import { mediaUrl, youtubeEmbedUrl, youtubeThumbnailUrl } from "./media";

describe("mediaUrl", () => {
  const original = process.env.NEXT_PUBLIC_BACKEND_URL;
  afterEach(() => {
    process.env.NEXT_PUBLIC_BACKEND_URL = original;
  });

  it("prefixes the public backend address", () => {
    process.env.NEXT_PUBLIC_BACKEND_URL = "https://api.xenophobia.team/";
    expect(mediaUrl("/media/videos/a.mp4")).toBe("https://api.xenophobia.team/media/videos/a.mp4");
  });

  it("defaults to the local backend", () => {
    delete process.env.NEXT_PUBLIC_BACKEND_URL;
    expect(mediaUrl("/media/videos/a.mp4")).toBe("http://localhost:3001/media/videos/a.mp4");
  });
});

describe("youtubeEmbedUrl", () => {
  it("builds a muted autoplay youtube-nocookie URL", () => {
    expect(youtubeEmbedUrl("dQw4w9WgXcQ", true)).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?playsinline=1&rel=0&autoplay=1&mute=1",
    );
  });

  it("omits autoplay when not wanted", () => {
    expect(youtubeEmbedUrl("dQw4w9WgXcQ", false)).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?playsinline=1&rel=0",
    );
  });

  it("enables the IFrame API for the page's origin when given", () => {
    expect(youtubeEmbedUrl("dQw4w9WgXcQ", false, "https://xpa.example.com")).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?playsinline=1&rel=0&enablejsapi=1&origin=https%3A%2F%2Fxpa.example.com",
    );
  });

  it("autoplays with sound when not muted (after the visitor pressed play)", () => {
    expect(youtubeEmbedUrl("dQw4w9WgXcQ", true, undefined, false)).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?playsinline=1&rel=0&autoplay=1",
    );
  });

  it("rejects anything but a video id", () => {
    expect(youtubeEmbedUrl("dQw4w9WgXcQ?x=1", true)).toBeNull();
    expect(youtubeEmbedUrl("../evil", true)).toBeNull();
  });
});

describe("youtubeThumbnailUrl", () => {
  it("points at the video's 480x360 thumbnail", () => {
    expect(youtubeThumbnailUrl("dQw4w9WgXcQ")).toBe("https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg");
  });

  it("rejects anything but a video id", () => {
    expect(youtubeThumbnailUrl("../evil")).toBeNull();
    expect(youtubeThumbnailUrl("dQw4w9WgXcQ/x")).toBeNull();
  });
});
