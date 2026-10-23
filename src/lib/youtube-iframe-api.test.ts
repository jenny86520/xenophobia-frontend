import { YOUTUBE_IFRAME_API_URL, loadYouTubeApi, resetYouTubeApiForTests, type YouTubeApi } from "./youtube-iframe-api";

const fakeApi = { Player: jest.fn(), PlayerState: { ENDED: 0 } } as unknown as YouTubeApi;
const apiScripts = () => document.querySelectorAll(`script[src="${YOUTUBE_IFRAME_API_URL}"]`);

describe("loadYouTubeApi", () => {
  beforeEach(() => {
    resetYouTubeApiForTests();
    delete window.YT;
    delete window.onYouTubeIframeAPIReady;
    apiScripts().forEach((script) => script.remove());
  });

  it("adds the script once and resolves when YouTube reports ready", async () => {
    const first = loadYouTubeApi();
    const second = loadYouTubeApi();
    expect(apiScripts()).toHaveLength(1);
    expect(second).toBe(first);

    window.YT = fakeApi;
    window.onYouTubeIframeAPIReady?.();

    await expect(first).resolves.toBe(fakeApi);
  });

  it("resolves at once when the API is already on the page", async () => {
    window.YT = fakeApi;
    await expect(loadYouTubeApi()).resolves.toBe(fakeApi);
    expect(apiScripts()).toHaveLength(0);
  });

  it("rejects when the script is blocked, and can try again later", async () => {
    const attempt = loadYouTubeApi();
    apiScripts()[0].dispatchEvent(new Event("error"));
    await expect(attempt).rejects.toThrow("failed to load");

    loadYouTubeApi().catch(() => {});
    expect(apiScripts()).toHaveLength(2);
  });
});
