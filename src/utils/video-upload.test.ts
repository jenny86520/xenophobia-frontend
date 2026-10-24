import { MAX_VIDEO_UPLOAD_BYTES, submissionGame, submissionGameLabel, videoFileProblem } from "./video-upload";

describe("videoFileProblem", () => {
  it("accepts an MP4 or WebM up to 500 MB, whatever the extension's case", () => {
    expect(videoFileProblem({ name: "clip.mp4", size: 50 * 1024 * 1024 })).toBeNull();
    expect(videoFileProblem({ name: "CLIP.WEBM", size: MAX_VIDEO_UPLOAD_BYTES })).toBeNull();
  });

  it("refuses other types, files over 500 MB and empty files", () => {
    expect(videoFileProblem({ name: "clip.mov", size: 10 })).toBe("只能上傳 MP4 或 WebM 影片");
    expect(videoFileProblem({ name: "clip.mp4", size: 600 * 1024 * 1024 })).toBe("檔案不可超過 500 MB");
    expect(videoFileProblem({ name: "clip.mp4", size: 0 })).toBe("這個檔案是空的");
  });
});

describe("submissionGame", () => {
  it("sends the listed game, or the typed name for 其他", () => {
    expect(submissionGame("g1", "ignored")).toEqual({ gameId: "g1" });
    expect(submissionGame("other", "Rainbow Six")).toEqual({ otherGameName: "Rainbow Six" });
    expect(submissionGame("other", "")).toEqual({ otherGameName: "" });
  });
});

describe("submissionGameLabel", () => {
  it("reads the game, or 其他 with the typed name", () => {
    expect(submissionGameLabel({ name: "CS2" }, "")).toBe("CS2");
    expect(submissionGameLabel(null, "Rainbow Six")).toBe("其他：Rainbow Six");
  });
});
