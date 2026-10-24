"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState, useSyncExternalStore, type ChangeEvent, type FormEvent } from "react";
import { submitYoutubeVideoAction } from "@/app/member/actions";
import type { MemberActionState } from "@/types/member";
import { OTHER_GAME, submissionGame, VIDEO_ACCEPT, videoFileProblem } from "@/utils/video-upload";
import { FormField, FormMessage, SelectField, SubmitButton } from "./form-controls";

type GameOption = { id: string; name: string };

const EMPTY: MemberActionState = {};
const UPLOAD_PATH = "/member/videos/upload";

const noSubscription = () => () => {};

/**
 * The two ways to submit a video. The source radios switch the forms with CSS alone (:has), so the
 * YouTube form, a plain Server Action form, works without JavaScript; the upload form needs it to
 * show progress and says so until the page is hydrated.
 */
export function VideoSubmissionForms({ games, uploadsLeftToday }: { games: GameOption[]; uploadsLeftToday: number }) {
  return (
    <div className="group/source flex max-w-xl flex-col gap-8">
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-body text-ink">影片來源</legend>
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          <label className="flex items-center gap-2 text-body text-ink">
            <input
              type="radio"
              name="video-source"
              id="source-youtube"
              value="youtube"
              defaultChecked
              className="size-4 accent-signal"
            />
            YouTube 連結
          </label>
          <label className="flex items-center gap-2 text-body text-ink">
            <input
              type="radio"
              name="video-source"
              id="source-upload"
              value="upload"
              className="size-4 accent-signal"
            />
            上傳影片檔
          </label>
        </div>
      </fieldset>
      <div className="group-has-[#source-upload:checked]/source:hidden">
        <YoutubeSubmissionForm games={games} />
      </div>
      <div className="hidden group-has-[#source-upload:checked]/source:block">
        <VideoUploadForm games={games} uploadsLeftToday={uploadsLeftToday} />
      </div>
    </div>
  );
}

/** Game, title and optional date: the same in both forms, with ids kept apart by `prefix`. */
function DetailsFields({ prefix, games, state }: { prefix: string; games: GameOption[]; state: MemberActionState }) {
  const value = (name: string) => state.values?.[name] ?? "";
  return (
    <>
      {/* The name field shows only while 其他 is chosen, by CSS (:has), so it works without JavaScript. */}
      <div className="group/game flex flex-col gap-6">
        <SelectField
          // React resets a form after its action, and a <select> then falls back to the option selected when it
          // mounted; keyed by the returned choice, it remounts with that choice (e.g. 其他 after an error).
          key={value("gameId")}
          id={`${prefix}-game`}
          name="gameId"
          label="遊戲"
          placeholder="請選擇遊戲"
          options={[
            ...games.map((game) => ({ value: game.id, label: game.name })),
            { value: OTHER_GAME, label: "其他（自行輸入）" },
          ]}
          required
          defaultValue={value("gameId")}
          error={state.fields?.gameId}
        />
        <div className="hidden group-has-[option[value=other]:checked]/game:block">
          <FormField
            id={`${prefix}-other-game`}
            name="otherGameName"
            label="遊戲名稱"
            markRequired
            maxLength={50}
            defaultValue={value("otherGameName")}
            error={state.fields?.otherGameName}
            hint="清單裡沒有的遊戲，管理員審核時會把它歸到對應的遊戲項目。"
          />
        </div>
      </div>
      <FormField
        id={`${prefix}-title`}
        name="title"
        label="影片標題"
        required
        maxLength={100}
        defaultValue={value("title")}
        error={state.fields?.title}
      />
      <FormField
        id={`${prefix}-date`}
        name="recordedOn"
        label="影片日期"
        type="date"
        defaultValue={value("recordedOn")}
        error={state.fields?.recordedOn}
        hint="不填就是今天。"
      />
    </>
  );
}

function YoutubeSubmissionForm({ games }: { games: GameOption[] }) {
  const [state, action, pending] = useActionState(submitYoutubeVideoAction, EMPTY);
  return (
    <form action={action} className="flex flex-col gap-6" aria-label="以 YouTube 連結投稿">
      <DetailsFields prefix="youtube" games={games} state={state} />
      <FormField
        id="youtube-url"
        name="youtubeUrl"
        label="YouTube 網址"
        type="url"
        required
        defaultValue={state.values?.youtubeUrl ?? ""}
        error={state.fields?.youtubeUrl}
        hint="例如 https://youtu.be/… 或 https://www.youtube.com/watch?v=…，也可以貼 Shorts 網址。"
      />
      <FormMessage state={state} />
      <SubmitButton pending={pending} className="self-start">
        送出投稿
      </SubmitButton>
    </form>
  );
}

type BackendError = { message?: string | string[]; fields?: Record<string, string> };

function errorMessage(body: BackendError): string | undefined {
  return Array.isArray(body.message) ? body.message.join("；") : body.message;
}

function VideoUploadForm({ games, uploadsLeftToday }: { games: GameOption[]; uploadsLeftToday: number }) {
  const router = useRouter();
  const hydrated = useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  );
  const [state, setState] = useState<MemberActionState>(EMPTY);
  const [progress, setProgress] = useState<number | null>(null);
  const uploading = progress !== null;
  const exhausted = uploadsLeftToday <= 0;

  function checkFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    const problem = file ? videoFileProblem(file) : null;
    setState(problem ? { ok: false, message: problem, fields: { file: problem } } : EMPTY);
  }

  function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const file = (form.elements.namedItem("file") as HTMLInputElement).files?.[0];
    const problem = file ? videoFileProblem(file) : "請選擇影片檔";
    if (problem || !file) {
      const message = problem ?? "請選擇影片檔";
      setState({ ok: false, message, fields: { file: message } });
      return;
    }

    // Text fields first, the file last; an empty date is left out so the backend uses today.
    const body = new FormData();
    const text = (name: string) => String(data.get(name) ?? "");
    for (const [name, value] of Object.entries(submissionGame(text("gameId"), text("otherGameName")))) {
      body.set(name, value);
    }
    for (const name of ["title", "recordedOn"]) {
      if (text(name)) body.set(name, text(name));
    }
    body.set("file", file);

    const request = new XMLHttpRequest();
    request.open("POST", UPLOAD_PATH);
    request.upload.onprogress = (progressEvent) => {
      if (progressEvent.lengthComputable) setProgress(Math.floor((progressEvent.loaded / progressEvent.total) * 100));
    };
    request.onload = () => {
      setProgress(null);
      if (request.status === 401) {
        router.push("/member/login");
        return;
      }
      let answer: BackendError = {};
      try {
        answer = JSON.parse(request.responseText) as BackendError;
      } catch {
        // Not JSON (e.g. a proxy error page): fall back to the generic message.
      }
      if (request.status >= 200 && request.status < 300) {
        form.reset();
        setState({ ok: true, message: "影片已上傳並送出投稿，請等待管理員審核。" });
        router.refresh();
      } else {
        setState({ ok: false, message: errorMessage(answer) || "上傳失敗，請稍後再試", fields: answer.fields });
      }
    };
    request.onerror = () => {
      setProgress(null);
      setState({ ok: false, message: "上傳中斷，請檢查網路後再試" });
    };
    setState(EMPTY);
    setProgress(0);
    request.send(body);
  }

  const fileHintId = "upload-file-hint";
  const fileErrorId = state.fields?.file ? "upload-file-error" : undefined;
  return (
    <form onSubmit={upload} className="flex flex-col gap-6" aria-label="上傳影片檔投稿">
      {!hydrated && (
        <p className="text-body text-ink-secondary">上傳影片檔需要啟用 JavaScript；也可以改用 YouTube 連結投稿。</p>
      )}
      {exhausted && (
        <p className="border-l-2 border-signal pl-3 text-body text-ink">
          今天的上傳次數已用完，明天可以再上傳；YouTube 連結不受限制。
        </p>
      )}
      <fieldset disabled={!hydrated || exhausted || uploading} className="flex flex-col gap-6 disabled:opacity-60">
        <DetailsFields prefix="upload" games={games} state={state} />
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline gap-2">
            <label htmlFor="upload-file" className="text-body text-ink">
              影片檔
            </label>
            <span aria-hidden="true" className="font-mono text-meta text-signal">
              必填
            </span>
          </div>
          <input
            id="upload-file"
            name="file"
            type="file"
            accept={VIDEO_ACCEPT}
            required
            onChange={checkFile}
            aria-invalid={fileErrorId ? true : undefined}
            aria-describedby={[fileHintId, fileErrorId].filter(Boolean).join(" ")}
            className="text-body text-ink file:mr-4 file:rounded-sm file:border file:border-line-strong file:bg-surface-elevated file:px-3 file:py-2 file:text-ink"
          />
          <p id={fileHintId} className="text-caption text-ink-muted">
            MP4 或 WebM，500 MB 以內。今天還能上傳 {uploadsLeftToday} 部。
          </p>
          {fileErrorId && (
            <p id={fileErrorId} className="text-caption text-destructive">
              {state.fields?.file}
            </p>
          )}
        </div>
        {uploading && (
          <div className="flex flex-col gap-2">
            <progress
              value={progress}
              max={100}
              aria-label="上傳進度"
              className="h-2 w-full overflow-hidden rounded-sm [&::-moz-progress-bar]:bg-signal [&::-webkit-progress-bar]:bg-surface-elevated [&::-webkit-progress-value]:bg-signal"
            />
            <p className="font-mono text-meta text-ink-secondary">上傳中 {progress}%，請不要關閉這個頁面</p>
          </div>
        )}
        {/* A file problem is shown under the file input, so it is not repeated here. */}
        <FormMessage state={state.fields?.file ? { ...state, message: undefined } : state} />
        <SubmitButton pending={uploading} className="self-start">
          上傳並投稿
        </SubmitButton>
      </fieldset>
    </form>
  );
}
