import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { VideoSubmissionForms } from "./video-submission-forms";

const mockRefresh = jest.fn();
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ refresh: mockRefresh, push: mockPush }) }));
jest.mock("@/app/member/actions", () => ({ submitYoutubeVideoAction: jest.fn() }));

/** A stand-in XMLHttpRequest the test drives: progress, then the backend's answer. */
class FakeXhr {
  static last: FakeXhr | undefined;
  method = "";
  url = "";
  body: FormData | null = null;
  status = 0;
  responseText = "";
  upload: { onprogress: ((event: { lengthComputable: boolean; loaded: number; total: number }) => void) | null } = {
    onprogress: null,
  };
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor() {
    FakeXhr.last = this;
  }
  open(method: string, url: string) {
    this.method = method;
    this.url = url;
  }
  send(body: FormData) {
    this.body = body;
  }
  respond(status: number, body: unknown) {
    this.status = status;
    this.responseText = JSON.stringify(body);
    this.onload?.();
  }
}

const games = [
  { id: "g1", name: "CS2" },
  { id: "g2", name: "APEX" },
];

function videoFile(name = "clip.mp4", size = 50 * 1024 * 1024) {
  const file = new File(["data"], name, { type: "video/mp4" });
  Object.defineProperty(file, "size", { value: size });
  return file;
}

function fillUpload(file: File) {
  fireEvent.change(screen.getByLabelText("遊戲", { selector: "#upload-game" }), { target: { value: "g1" } });
  fireEvent.change(screen.getByLabelText("影片標題", { selector: "#upload-title" }), {
    target: { value: "Squad wipe" },
  });
  fireEvent.change(screen.getByLabelText("影片檔"), { target: { files: [file] } });
}

beforeEach(() => {
  jest.clearAllMocks();
  FakeXhr.last = undefined;
  window.XMLHttpRequest = FakeXhr as unknown as typeof XMLHttpRequest;
});

describe("VideoSubmissionForms", () => {
  it("offers both sources, with YouTube first and the games from the site", () => {
    render(<VideoSubmissionForms games={games} uploadsLeftToday={5} />);

    expect(screen.getByRole("radio", { name: "YouTube 連結" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "上傳影片檔" })).not.toBeChecked();
    const youtube = screen.getByRole("form", { name: "以 YouTube 連結投稿" });
    expect(youtube).toContainElement(screen.getByLabelText("YouTube 網址"));
    expect(screen.getByLabelText("遊戲", { selector: "#youtube-game" })).toBeRequired();
    expect(screen.getAllByRole("option", { name: "CS2" })).toHaveLength(2);
    expect(screen.getByLabelText("影片日期", { selector: "#youtube-date" })).not.toBeRequired();
  });

  it("refuses a file over 500 MB or of another type before uploading", () => {
    render(<VideoSubmissionForms games={games} uploadsLeftToday={5} />);
    const fileInput = screen.getByLabelText("影片檔");

    fireEvent.change(fileInput, { target: { files: [videoFile("clip.mp4", 600 * 1024 * 1024)] } });
    expect(fileInput).toHaveAccessibleDescription(expect.stringContaining("檔案不可超過 500 MB"));

    fillUpload(videoFile("clip.mov"));
    fireEvent.submit(screen.getByRole("form", { name: "上傳影片檔投稿" }));
    expect(screen.getByText("只能上傳 MP4 或 WebM 影片")).toBeInTheDocument();
    expect(FakeXhr.last).toBeUndefined();
  });

  it("offers 其他 with a name field that the menu reveals", () => {
    render(<VideoSubmissionForms games={games} uploadsLeftToday={5} />);

    const select = screen.getByLabelText("遊戲", { selector: "#youtube-game" });
    expect(within(select).getByRole("option", { name: "其他（自行輸入）" })).toHaveValue("other");
    const name = document.querySelector("#youtube-other-game") as HTMLInputElement;
    expect(name).toHaveAttribute("name", "otherGameName");
    expect(name).not.toBeRequired();
    // Shown by CSS only while 其他 is selected (jsdom does not apply it, so check the rule's hook).
    expect(name.closest("div.hidden")?.className).toContain("group-has-[option[value=other]:checked]/game:block");
  });

  it("uploads 其他 as the typed game name", () => {
    render(<VideoSubmissionForms games={games} uploadsLeftToday={5} />);
    fillUpload(videoFile());
    fireEvent.change(screen.getByLabelText("遊戲", { selector: "#upload-game" }), { target: { value: "other" } });
    fireEvent.change(document.querySelector("#upload-other-game") as HTMLInputElement, {
      target: { value: "Rainbow Six" },
    });

    fireEvent.submit(screen.getByRole("form", { name: "上傳影片檔投稿" }));

    const body = FakeXhr.last!.body!;
    expect(body.has("gameId")).toBe(false);
    expect(body.get("otherGameName")).toBe("Rainbow Six");
  });

  it("uploads with progress, then confirms and refreshes the list", () => {
    render(<VideoSubmissionForms games={games} uploadsLeftToday={3} />);
    expect(screen.getByText(/今天還能上傳 3 部/)).toBeInTheDocument();
    fillUpload(videoFile());

    fireEvent.submit(screen.getByRole("form", { name: "上傳影片檔投稿" }));
    const request = FakeXhr.last!;
    expect(request.method).toBe("POST");
    expect(request.url).toBe("/member/videos/upload");
    expect(request.body?.get("gameId")).toBe("g1");
    expect(request.body?.get("title")).toBe("Squad wipe");
    expect(request.body?.has("recordedOn")).toBe(false);
    expect((request.body?.get("file") as File).name).toBe("clip.mp4");

    act(() => request.upload.onprogress?.({ lengthComputable: true, loaded: 40, total: 100 }));
    expect(screen.getByRole("progressbar", { name: "上傳進度" })).toHaveAttribute("value", "40");
    expect(screen.getByText(/上傳中 40%/)).toBeInTheDocument();

    act(() => request.respond(201, { id: "s1", status: "pending" }));
    expect(screen.getByRole("status")).toHaveTextContent("影片已上傳並送出投稿，請等待管理員審核。");
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("shows the backend's refusal, such as the daily limit", () => {
    render(<VideoSubmissionForms games={games} uploadsLeftToday={1} />);
    fillUpload(videoFile());
    fireEvent.submit(screen.getByRole("form", { name: "上傳影片檔投稿" }));

    act(() => FakeXhr.last!.respond(429, { statusCode: 429, message: "今天的上傳次數已用完" }));

    expect(screen.getByRole("alert")).toHaveTextContent("今天的上傳次數已用完");
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it("goes to the login page when the session is gone", () => {
    render(<VideoSubmissionForms games={games} uploadsLeftToday={1} />);
    fillUpload(videoFile());
    fireEvent.submit(screen.getByRole("form", { name: "上傳影片檔投稿" }));

    act(() => FakeXhr.last!.respond(401, { message: "Unauthorized" }));

    expect(mockPush).toHaveBeenCalledWith("/member/login");
  });

  it("turns the upload off once today's uploads are used up, leaving YouTube links", () => {
    render(<VideoSubmissionForms games={games} uploadsLeftToday={0} />);

    expect(screen.getByText(/今天的上傳次數已用完/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "上傳並投稿" })).toBeDisabled();
    expect(screen.getByLabelText("影片檔")).toBeDisabled();
    expect(screen.getByRole("button", { name: "送出投稿" })).toBeEnabled();
  });
});
