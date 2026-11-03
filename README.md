# Xenophobia Frontend

XenoPhobiA（XPA）團隊官網的公開前台，提供派對（活動）目錄、團隊介紹、傳奇榜，以及會員專區（活動報名、好友、影片投稿）、Steam 登入與 CS2 內戰場次。

前台只負責呈現畫面：所有資料都在伺服器端向 [xenophobia-backend](https://github.com/jenny86520/xenophobia-backend) 的 REST API 取得，前台不保存任何業務資料或規則。

## 技術棧

| 項目 | 使用 |
| --- | --- |
| 框架 | Next.js 16.4.2（App Router，頁面以 Server Component 為主） |
| UI | React 19.2.8、Tailwind CSS 4、shadcn/ui（已 eject，原始碼在 `src/components/ui/`）、lucide 圖示 |
| 字型 | Geist、Geist Mono、Noto Serif TC（標題） |
| 語言 | TypeScript 5 |
| 測試 | Jest 30 + React Testing Library |

> Next.js 16 和多數教學或 AI 訓練資料描述的版本不同。使用不熟悉的 API 前，請先讀 `node_modules/next/dist/docs/` 裡的說明（見 [AGENTS.md](AGENTS.md)）。

## 快速開始

需要 Node.js 20 以上（開發環境使用 24）和 npm，並先啟動後端（預設 `http://localhost:3001`，步驟見[後端 README](https://github.com/jenny86520/xenophobia-backend/blob/main/README.md)）。

```bash
npm install
cp .env.example .env.local   # 後端在預設位址時可省略
npm run dev                  # http://localhost:3000
```

## 環境變數

在 `.env.local` 設定（範本為 [.env.example](.env.example)）。

| 變數 | 必填 | 預設值 | 說明 |
| --- | --- | --- | --- |
| `BACKEND_URL` | 否 | `NEXT_PUBLIC_BACKEND_URL` | 頁面在伺服器端呼叫後端用的位址。可以是只有伺服器連得到的內部位址，例如容器網路裡的 `http://backend:3001` |
| `NEXT_PUBLIC_BACKEND_URL` | 正式環境必填 | `http://localhost:3001` | **訪客瀏覽器**連得到的後端公開位址。`BACKEND_URL` 沒設定時用它呼叫 API；上傳的封面圖與影片（`/media/...`）的網址一律用它組成 |

另外，`NODE_ENV=production`（`npm run build` / `npm run start`）時，會員登入的 cookie 會加上 `Secure`，所以正式環境必須使用 HTTPS。

## 常用指令

| 指令 | 說明 |
| --- | --- |
| `npm run dev` | 開發伺服器（3000 埠） |
| `npm run build` | 建置正式版本 |
| `npm run start` | 執行建置好的正式版本 |
| `npm run lint` | ESLint |
| `npm test` | 單元與元件測試，例如 `npm test -- countdown` 只跑單一檔案 |
| `npm run test:watch` | 測試（監看模式） |
| `npm run check:content` | 依頁面列出還沒提供內容的位置（placeholder），只要還有一處就以非 0 結束，可當作上線前檢查 |
| `npm audit --omit=dev` | 檢查正式依賴的漏洞，必須維持 0 |

## 頁面

| 路徑 | 內容 |
| --- | --- |
| `/` | 首頁：主視覺、團隊宣言、遊戲項目（highlight 影片）、傳奇榜（總排行前三名的金銀銅獎盃頒獎台，由左到右第 2、1、3 名，捲入時依名次彈出；連到 `/legends`）、下一場派對倒數與近期派對、里程碑、聯絡方式 |
| `/about` | 品牌宣言、使命、遊戲項目、里程碑、聯絡方式、網站特色、未來規劃 |
| `/legends` | 傳奇榜：總排行，再依後台排定的順序列出各排行榜（標題由後台設定，下方標示固定的計算項目；每榜前 10 名（前三名有金銀銅獎盃）、同分並列、單位、是否計入總排行；每榜一句給訪客的介紹，計算方式收在 ⓘ 說明視窗）。名次全由後端 `GET /api/legends` 算好，前台只負責排版；後端新增的排行榜會自動出現，沒有對應圖示時用獎盃 |
| `/party` | 派對列表，可依狀態（預設全部，只看進行中為 `?status=active`）、形式、分類篩選，並以「Sort」切換依開始日期由新到舊（預設）或由舊到新（`?order=asc`）；篩選與排序都放在網址上，排序由後端處理。會員登入後也會看到標示「會員限定」的線下派對 |
| `/party/[id]` | 派對詳情：封面、標題旁第三欄的報名（會員可報名並展開「N 人參加」看名單；後台暫停報名時顯示「活動報名目前暫停」，已報名的會員仍可取消）、子派對（每列「時間｜內容｜報名」，需先報名主派對）；派對有內戰場次時另列「內戰場次」。時間待定顯示「待定」或「時間待定」；會員限定派對對訪客只顯示「此活動僅限會員查看」 |
| `/matches` | CS2 內戰場次列表（報名中、已鎖定與分隊中的在前；每列顯示建立者與建立時間，後台建立的顯示「管理員」）；角色有「可建立內戰場次」且未暫停的會員看到「建立場次」 |
| `/matches/new` | 建立場次（標題、選填的進行中遊戲類派對；遊戲固定是 Counter-Strike 2）；沒有權限、暫停或網站沒有 Counter-Strike 2 遊戲項目時（後端的 `canCreateMatch` 為否）只顯示說明 |
| `/matches/[id]` | 場次頁：報名（單人、建立小隊、以邀請碼加入、退出）、報名中時會員可「邀請好友」（邀進自己的小隊或邀請報名，列出每位好友的狀態）、名單（依小隊分組；隊伍確認後顯示兩隊、隊長、總分與分差）；建立的會員另有管理區，見[內戰場次](#內戰場次) |
| `/member` | 會員專區：上方是暱稱、登出與 Steam 帳號列（可建立內戰場次的會員右側有「建立內戰場次」），下方以分頁切換「個人資料」（預設：個人資料與修改暱稱表單）、「參加的活動」（`?tab=parties`）、「內戰場次」（`?tab=matches`：評分在左欄，右側是參加過的場次與隊伍，以及到全部場次的連結；未綁定 Steam 時說明需先綁定）、「好友」（`?tab=friends`：寬螢幕分左右兩欄，左側是好友清單（暱稱連到好友資料頁，旁邊顯示自己寫的備註），右側是自己的會員編號與加好友表單、內戰場次邀請、收到與送出的好友邀請；分頁名稱旁顯示待處理數量）與「投稿影片」（`?tab=videos`：左側是一段說明與表單（先選來源並填 YouTube 網址或影片檔，再填遊戲、標題、日期；來源旁有「從 Leetify 找片段」按鈕），右側是投稿紀錄）；條款改版需要重新同意時，頁首下方只顯示「條款已更新」同意區塊（每份文件下方列出與自己上次同意版本相比改了哪裡，並可開啟最新全文）、不顯示分頁；未登入時只說明如何成為會員 |
| `/member/login` | 會員登入、申請重設密碼 |
| `/member/friends/[memberId]` | 好友資料頁：暱稱、會員編號、Discord ID、Steam 名稱（連到 Steam 個人頁）、內戰分數，以及自己的備註表單（只有自己看得到，最多 50 字）；不是好友時顯示「找不到這位好友」 |
| `/member/register` | 會員註冊（需勾選同意使用條款與隱私權政策；「稱呼」只讓管理員辨識，不必填真名；註冊後需由管理員開通） |
| `/member/password` | 透過信件中的一次性連結設定密碼；要輸入兩次，不一致時直接提示、不送出（不會用掉連結） |
| `/player` | 訪客玩家頁（以 Steam 登入、沒有會員帳號）：第一次登入先設定暱稱，之後顯示暱稱、Steam 帳號與登出；未登入時提供「以 Steam 登入」 |
| `/steam/login`、`/steam/callback` | Steam 登入的 Route Handler（只接受 GET），見[Steam 登入](#steam-登入) |
| `/member/videos/upload` | 上傳影片檔的 Route Handler（只接受 POST），見[會員投稿影片](#會員投稿影片) |

隱私權政策與使用條款沒有獨立頁面，是每頁都有的彈出視窗，見[法律條款](#法律條款)。

## 專案結構

```
src/
├── app/                  # 路由：頁面組成與資料抓取
│   ├── _sections/        # 首頁各區塊（部分與 /about 共用）
│   ├── party/  about/  legends/  member/  matches/  player/
│   ├── member/actions.ts # 會員相關的 Server Actions
│   ├── matches/actions.ts# 內戰場次的 Server Actions
│   ├── player/actions.ts # 訪客玩家的 Server Actions
│   ├── steam/            # Steam 登入的 Route Handler（login、callback）
│   └── member/videos/upload/route.ts # 投稿影片上傳的轉送（Route Handler）
├── components/
│   ├── brand/            # 設計系統元件（Section、Heading、BrandName、Placeholder…）
│   ├── ui/               # shadcn/ui 元件（button、badge 有客製，不要用 CLI 覆蓋）
│   ├── layout/           # Header、Footer、行動版選單、導覽項目（nav-items.ts）
│   └── about/  contact/  games/  legal/  legends/  match/  member/  party/  player/
├── hooks/                # 自訂 hook（use-countdown）
├── lib/                  # 後端存取：public-content-client.ts（公開內容）、member-session.ts（會員）、
│                         # player-session.ts 與 player-actor.ts（訪客與內戰身分）、steam-login.ts、
│                         # forwarded-for.ts（轉送訪客 IP）、youtube-iframe-api.ts
├── types/                # API 回應型別
└── utils/                # 純函式（含測試）
scripts/check-content.mjs # check:content 的實作
public/brand/             # 網站 logo
```

## 資料抓取

- 所有公開內容都透過 `src/lib/public-content-client.ts` 取得。
  - 每個請求只呼叫後端一次（`React.cache`），也不會預先產生頁面，所以後台改的內容會立刻生效。
  - 後端回 404 時頁面顯示「找不到」，其他錯誤則交給 `error.tsx`。
- **轉送訪客 IP**：後端以訪客 IP 限制請求次數，但頁面與會員表單都是由前台伺服器代為呼叫後端。所以 `public-content-client.ts` 和 `member-session.ts` 的 `memberFetch` 都會把收到的 `X-Forwarded-For` 轉給後端（`src/lib/forwarded-for.ts`）。前台本身不做任何限流判斷。
- 專案刻意不放 `loading.tsx`：串流的載入畫面要靠 JavaScript 才會換成內容，關閉 JavaScript 的訪客會一直停在載入畫面。

## 會員 session

- 會員的 JWT 只存在 httpOnly cookie `xpa_member`，瀏覽器的 JavaScript 讀不到，也不會直接呼叫會員 API，所以後端的 CORS 不需要額外設定。
- 登入、登出、註冊、設定密碼、修改暱稱、同意新版條款、報名和取消報名、以 YouTube 網址投稿影片、好友（送出、接受、拒絕、收回、刪除、好友備註）與內戰場次邀請（接受小隊邀請後導向場次頁、略過）都是 Server Action（`src/app/member/actions.ts`），只負責把請求轉給後端，再回傳後端的訊息。
- 密碼欄位（`PasswordField`，登入與設定密碼）右側有「顯示密碼」切換按鈕（`aria-pressed`），頁面 hydration 後才出現；不開 JavaScript 時是一般的隱藏密碼欄位。送出表單後恢復隱藏。
- 頁首與行動版選單的 Member 旁顯示待處理數量（收到的好友邀請加上有效的場次邀請）：根 layout 在有會員 cookie 時呼叫 `fetchMemberFriendSummary()`，失敗或未登入時當作 0；數字對輔助科技隱藏，另有「N 件待處理」的文字。數量在換頁或重新整理時更新，好友相關的 Server Action 會重新整理整個 layout。
- 表單都用 `<form action>` 搭配 `useActionState`，**不開 JavaScript 也能運作**。
- 後端回 401 時會清掉 cookie，並導回 `/member/login`。
- 後端因請求太頻繁回 429 時，表單直接顯示後端的訊息（例如「請求太頻繁，請在 15 分鐘後再試」）；頁面讀取時遇到 429 則交給 `error.tsx`。

## Steam 登入

- 參加內戰需要經 Steam 驗證的 SteamID。會員在會員頁「綁定 Steam」；沒有帳號的朋友在 `/member/login` 或 `/player` 按「以 Steam 登入」成為**訪客玩家**。已綁定 Steam 的會員可以在 `/member/login` 按「以 Steam 登入會員」（`intent=member`）直接登入會員，結果與帳號密碼登入相同（設定 `xpa_member` 並前往 `/member`）；Steam 帳號沒綁定會員、會員未開通或停用、帳號鎖定時，導回 `/member/login?steam=<代碼>&via=member`，錯誤顯示在會員登入區（`not-linked`、`member-refused`、`locked`…）。
- 流程（`src/lib/steam-login.ts`）：連結指向 `GET /steam/login?intent=guest|member|link`，它產生隨機 state、寫進 10 分鐘的 httpOnly cookie `xpa_steam_state`，再導向 Steam；Steam 導回 `GET /steam/callback`，state 必須和 cookie 相同才把 `openid.*` 參數轉給後端（訪客 `/api/player-auth/steam`、會員登入 `/api/member/auth/steam`、會員綁定 `/api/member/steam`），**由後端向 Steam 驗證**。前台不判斷是誰，也不接受任何直接傳來的 SteamID。
- 網址：送給 Steam 的回傳網址以 `X-Forwarded-Proto`／`X-Forwarded-Host`（nginx 會帶）組成，沒有時用請求本身的網址；它必須等於後端的 `MEMBER_PORTAL_URL`，否則後端拒絕。
- 連結用一般 `<a>`（`SteamLoginLink`），不能用 `next/link`：用戶端導覽無法跟著導向到其他網站。全部是連結、導向與表單，不開 JavaScript 也能完成。
- 訪客的權杖存在另一個 httpOnly cookie `xpa_player`（`src/lib/player-session.ts`），和會員的 `xpa_member` 分開；訪客只能用玩家功能。失敗時導回原頁並帶 `?steam=<代碼>`，頁面依代碼顯示說明（`STEAM_ERROR_TEXT`），不會顯示網址帶來的任意文字。

## 內戰場次

- 頁面都是伺服器元件，所有操作是 Server Action（`src/app/matches/actions.ts`），只把請求轉給後端並顯示後端的訊息；誰能做什麼由後端決定。全部是 `<form action>`，不開 JavaScript 也能完成。
- **身分**（`src/lib/player-actor.ts`）：有會員 cookie 時以會員身分（綁定的 Steam 帳號就是他的玩家），否則以 Steam 訪客的 `xpa_player`。後端回 401 時清掉那個 cookie：訪客導回 `/player`，會員導回 `/member/login`。
- **看得到什麼**：未登入只看到名單與玩家名稱（公開 API 沒有評分與邀請碼），提示「以 Steam 登入」。已登入（會員即使還沒綁定 Steam，或訪客）改讀 `/api/matches/:id/viewer`，看到每位玩家的評分、自己的報名與自己小隊的邀請碼；還沒綁定 Steam 的會員看到綁定說明。
- **管理區**（建立這場的會員，`/api/matches/:id/manage`）：依狀態顯示鎖定名單、從派對帶入（顯示加入與略過人數）、移出玩家、產生分隊候選、解除鎖定與取消。分隊中時並排顯示最多三組候選（每位玩家評分、各隊總分、平均與分差），點整張卡片就選用該方案（卡片標題是連到 `?candidate=N#team-candidates` 的連結並延伸蓋住整張卡片，不開 JavaScript 也能用；使用中的卡片加紅框並標示「使用中」），下方的分隊表單（每人一組 A 隊／B 隊切換按鈕，實際是樣式化的 radio、兩隊隊長預選建議、允許拆開小隊）依選定的方案預填。移出、解除鎖定與取消要先勾選確認（沒有 JavaScript 就沒有對話框）。
- **入口**：派對頁的「內戰場次」區塊、`/player` 的「內戰場次」連結，以及會員頁的「內戰場次」分頁；主導覽不變。場次管理區最下方，左邊是「移出玩家」（報名中）或「解除鎖定」（已鎖定、分隊中），右邊是「取消場次」，上方以分隔線隔開。

### Ban 圖

- 隊伍確認後，場次頁多一個「Ban 圖」區塊（`components/match/veto-panel.tsx`），所有人都看得到：先手隊伍與原因、目前輪到哪一隊與剩餘時間（倒數到 0 或後端回報 `overdue` 時顯示「時間到，即將隨機 Ban」：後端幾秒內會替那隊隨機 Ban，紀錄標示「時間到，系統隨機 Ban」）、每張地圖的狀態（以文字標示「A 隊 Ban（第 n 步）」，不只靠顏色）、步驟紀錄與最終地圖。
- **地圖卡片**：每張地圖是一張 16:9 卡片，地圖名稱懸浮在圖片下方。圖片是裝飾（`<img alt="">`，來自後端的 `mediaUrl()`），上面一層 `.map-card-scrim` 深色漸層讓名稱在純白圖片上也維持 AA；被 Ban 的圖片轉灰變暗，狀態與 Ban 按鈕放在圖片下方的卡片底部。沒有圖片時用品牌紅斜向漸層（`.map-card-fallback`）。比賽地圖的卡片外框為訊號紅。
- **隊長**：輪到自己隊伍時，每張還能 Ban 的地圖旁有一個「Ban」按鈕（一張地圖一個表單），送出時帶上頁面上的步驟序號，畫面過期時後端會拒絕並請你重新整理。
- **場次建立者**（管理區）：隊伍確認後可「開始 Ban 圖」（左邊是先手規則：隨機／總分高的隊伍先手／總分低的隊伍先手，以三段式切換按鈕呈現（底下是真正的 radio，不開 JavaScript 也能選）；右邊是每步期限 10～300 秒，手機上改為上下排列）；Ban 圖中可替輪到的隊伍「代為 Ban」指定地圖或「隨機 Ban」；最下方左側是撤銷最近一步與重設 Ban 圖（都要勾選確認），右側是取消場次。隊伍已確認、還沒開始 Ban 圖時，最下方左側是「退回分隊」（勾選確認）：清除兩隊、隊長與評分快照，回到分隊中重新選擇候選（`unconfirmTeamsAction`）。
- **自動更新**：Ban 圖中由客戶端元件 `VetoAutoRefresh` 每 3 秒呼叫 `router.refresh()`（分頁不在前景時暫停），剩餘秒數由 `StepCountdown` 每秒更新；不開 JavaScript 時顯示期限的時間點，所有操作仍能完成，重新整理即可看到對方的進度。

## 會員投稿影片

- 位置：會員頁的「投稿影片」分頁（`/member?tab=videos`）。分頁是一般連結（`components/member/member-tabs.tsx`，`<nav>` 加 `aria-current`），由伺服器依網址渲染，不開 JavaScript 也能切換；只有打開的分頁才會向後端讀資料。角色沒有「可投稿影片」權限時只顯示說明與投稿紀錄。
- Leetify 引導：「影片來源」同一列右側有「從 Leetify 找片段」按鈕，按下後以彈出視窗（`InfoDialog`，不需 JavaScript）分三個步驟說明到 Leetify 找片段、下載或分享到 YouTube、回到投稿表單上傳或貼連結。已綁定 Steam 時連到 `https://leetify.com/app/profile/<SteamID64>`，否則連到 `https://leetify.com` 並提示綁定 Steam。只是連結：Leetify 公開 API 沒有影片、片段存放在沒有公開 API 的 Allstar，所以網站不呼叫它們，也不傳送資料。
- **YouTube 連結**：和其他會員表單一樣是 Server Action（`submitYoutubeVideoAction`），不開 JavaScript 也能送出。
- **上傳影片檔**：Server Action 無法顯示上傳進度，所以表單（`components/member/video-submission-forms.tsx`）用 `XMLHttpRequest` 送到同網域的 Route Handler `POST /member/videos/upload`，再由它轉送給後端。這個表單需要 JavaScript，頁面上有說明。
  - Route Handler 沒有 Server Action 內建的來源檢查，所以自己比對 `Origin` 與 `Host`（或 nginx 帶的 `X-Forwarded-Host`），不同就回 403。
  - 轉送用 `node:http` 加 `stream.pipeline`，後端讀得慢時會暫停讀取，記憶體不會隨檔案變大。**不要改用 `fetch(..., { duplex: 'half' })`**：實測它不等後端，300 MB 的上傳會讓前台伺服器多占約 330 MB 記憶體。
  - **不要新增 `proxy.ts`**（舊稱 middleware）：有它時 Next 會把請求內容整個緩衝在記憶體，而且上限 10 MB，上傳會失敗。
  - 後端的回應（含每日上限的 429）原樣回傳；後端回 401 時清掉會員 cookie，表單導回登入頁。
- 送出前會先檢查副檔名（MP4／WebM）與大小（500 MB），並依後端回傳的 `uploadsLeftToday` 停用上傳；最後一律以後端判斷為準。
- **其他遊戲**：遊戲選單最後一項是「其他（自行輸入）」，選了才會顯示「遊戲名稱」欄位（用 CSS `:has` 控制，不開 JavaScript 也能用）。送出時前台把「其他」轉成 `otherGameName`（`utils/video-upload.ts` 的 `submissionGame`），名稱是否必填由後端判斷；投稿紀錄顯示「其他：名稱」。
- 能不能投稿（`canSubmit`）由後端依角色權限決定，前台只照著顯示。後台在「權限設定」暫停投稿時，後端回傳 `paused`，分頁改顯示「影片投稿目前暫停，恢復後即可投稿。」，不顯示表單，仍顯示投稿紀錄；暫停的說明優先於「角色不能投稿」。
- **權利確認**：兩種投稿表單都有必勾的「我擁有這部影片的權利，並同意公開與上傳」（`RightsField`）。YouTube 由 Server Action 只在勾選時送 `rightsConfirmed: true`；上傳表單在送出前先檢查，未勾選不會開始上傳。後端仍會擋下未確認的投稿，錯誤顯示在勾選框下方。

## 法律條款

- 隱私權政策與使用條款由後台編輯（`GET /api/legal/privacy|terms`），**沒有 `/privacy`、`/terms` 頁面**。根版型（`src/app/layout.tsx`）和 about 一起抓這兩份文件（失敗時當作 `null`），在頁尾之後放兩個 `LegalDialog`（`components/legal/`）。
- 視窗用 HTML Popover API：`<div popover="auto" role="dialog">`，開啟按鈕是 `<button popoverTarget>`，所以**不開 JavaScript 也能開關**；Esc、點視窗外面、右上角「關閉」都能關閉，開啟時焦點在關閉按鈕，關閉後回到原本的按鈕，網址不變。
- 開啟的地方：頁尾最底列的 `LegalLinks`（等寬小字、紅色斜線分隔），以及註冊與投稿勾選框文字裡的 `LegalDialogButton`。在註冊頁開啟視窗不會清空已填的表單。
- 內文是純文字，由 `utils/legal-text.ts` 的 `parseLegalText` 轉成段落：空行分隔段落，`# ` 開頭是小標，連續的 `- ` 開頭成為清單，段內換行保留；內容只當文字顯示，不解析 HTML。還沒發布（內容為空）時顯示 `Placeholder`（`legal.privacy`／`legal.terms`），`check:content` 會列出；讀取失敗時顯示「目前無法載入，請稍後再試。」。
- 樣式在 `globals.css` 的 `.legal-dialog`：最寬 720px、最高 85dvh、內文捲動，背景遮罩用 `--xpa-background`；淡入只在 `prefers-reduced-motion: no-preference` 下用 `@starting-style`。
- 註冊表單的同意勾選框是 `CheckboxField`（`form-controls.tsx`），Server Action 只在勾選時送 `acceptTerms: true`，其餘由後端驗證並記錄同意的時間與條款版本。
- **重新同意**：管理員發布條款時要求會員重新同意後，`GET /api/member/me` 的 `legalConsent.required` 為真。會員頁在頁首下方以 `LegalConsentPanel`（`components/member/legal-consent-panel.tsx`）取代分頁，列出需要同意的文件與 `LegalConsentForm`（隱藏欄位帶目前兩份文件的版本，必勾後送 `acceptLegalAction`）。同意期間條款又改版時，後端回 `409`，表單顯示說明，頁面以新版重新顯示。
  - 每份文件一列：名稱（`LegalDialogButton`，開啟根版型已渲染的最新全文視窗，不需 JavaScript）與版本，下方是 `LegalChanges`（`components/member/legal-changes.tsx`）：`fetchMemberLegalChanges()`（`GET /api/member/legal-consent`，只在需要同意時讀取，失敗回 `null` 不擋同意）取得後端算好的差異，刪除以 `<del>` 加刪除線、新增以 `<ins>` 加底線，行首可見 −／+ 與 sr-only「刪除：／新增：／修改前：／修改後：」，收合處顯示「省略 N 行未變動」；差異區塊有最大高度、可用鍵盤捲動。沒有可比對的版本時請會員閱讀全文，內容相同時說明相同。前台不做任何比對。
- 同意前，後端對會員的所有寫入回 `428`。`app/member/actions.ts` 與 `app/matches/actions.ts` 的 `errorState()` 遇到 `428` 就導向 `/member`；綁定 Steam 的回呼導向 `/member?steam=consent-required`。

## 設計系統

完整規格見 [openspec/specs/visual-design-system](https://github.com/jenny86520/xenophobia-portal/blob/main/openspec/specs/visual-design-system/spec.md)。開發時最常用到的規則：

- **合併 class**：一律用 `@/lib/utils` 的 `cn()`。它用 `createCn` 把自訂字級（`text-display`、`text-h1`…`text-label`）登記為字級，否則 tailwind-merge 會把它們當成顏色，和 `text-ink` 這類顏色 class 合併時把字級丟掉。新增字級 token 時要一起加到 `TEXT_SIZES`。
- **顏色**：一律使用 `src/app/globals.css` 定義的 token（`ink`、`surface`、`line`、`signal`、`cta`…），不寫死色碼。網站只有深色模式。
- **版面**：用 `Section`、`Container`、`EditorialGrid` 排版，標題用 `Heading`，團隊名稱一律用 `BrandName`。
- **缺內容**：還沒有內容的地方放 `Placeholder`，不要自己編寫文案，並登記到 `placeholder-registry.ts` 或 `check-content.mjs`。
- **動態**：只用 CSS，全部包在 `prefers-reduced-motion: no-preference` 裡；保留清楚的焦點框。
- **首頁 Header**（`globals.css` 的 `.site-header` 區塊）：在 Hero 上隱藏，Hero 捲出時固定在頂端以透明度淡入；鍵盤焦點進入時立即顯示。用滑鼠或觸控板（`hover: hover` 且 `pointer: fine`）時，隱藏的 Header 仍接收指標，滑鼠移到頂端就由上往下展開（`clip-path`，200ms，結尾回到 `none`，不留裁切），移開立即隱藏；Hero 開始離開後另一個動畫保持不裁切，已顯示的 Header 懸停不會重播。觸控裝置維持在 Hero 上點不到。
- **品牌特效**（`globals.css` 最後的「Brand effects」一節，效果取自 KittenJam Motion Library，只取效果、不用 GSAP）：
  - 捲動橫移大字：首頁 Hero 之後的 `BrandMarquee`（`_sections/marquee.tsx`），三行 `BrandName` 大字（中間空心）隨捲動反向橫移，整段 `aria-hidden`。
  - 捲動逐字點亮：品牌宣言用 `LitText`（`components/brand/lit-text.tsx`），`Intl.Segmenter` 拆字，每個字帶位置 `--p`，跟著 `--lit` 時間軸依序點亮；輔助科技讀不可選取的 `sr-only` 完整句子。
  - 圖片遮罩揭示：`.media-reveal`（派對詳情封面、Ban 圖地圖卡片），由下往上揭開並從 1.1 倍縮回。
  - 清單列滑入填滿：`.list-row::before` 的底色從左刷入、離開往右收；有封面的派對列，底色在封面之下。
  - 游標聚光邊框：客戶端元件 `Spotlight` 只在精確指標時把游標位置寫到 `[data-spotlight]` 卡片的 `--spot-x/--spot-y`（首頁下一場派對、地圖卡片、分隊候選）。
  - 光澤掃過按鈕：`.cta-primary::after` 滑過或聚焦時掃過一次。
  - 亂碼解讀標籤：`Eyebrow` 的各段文字用 `ScrambleText`，第一次進入畫面時 600ms 內解碼一次；正確文字一直是唯一的文字節點，解碼時只是變透明、上面疊一層 `aria-hidden` 亂碼。
  - 底片顆粒：Hero 的 `.hero-grain`（內嵌 SVG 雜訊，靜態）。
  - 偏好減少動態效果、不支援捲動驅動動畫或沒有 JavaScript 時，全部退回靜態的最終樣子。
- **遊戲輪播的影片**（`GameCarousel`）：展開的遊戲依後端回傳的順序播放 `videos`（後台挑選的最多 5 部），播完自動切到下一部、最後一部之後回到第一部；只有一部時播完就停。播放器下方的「上一部／下一部」與編號按鈕可手動切換（只有手動切換會朗讀）。偏好減少動態效果時不自動播放。YouTube 用自己的 `youtube-nocookie.com` iframe，透過 YouTube IFrame Player API（`lib/youtube-iframe-api.ts`，只在畫面上有 YouTube 影片時載入 `https://www.youtube.com/iframe_api`）偵測播放結束；API 被擋時影片照常播放，只是不會自動切換。日後若加上 CSP，`script-src` 需要允許 `https://www.youtube.com`。
- **里程碑時間軸**（`ArchiveTimeline`）：照後端回傳的順序顯示（依日期，方向由後台設定），相鄰相同日期的里程碑合併成同一列，日期只顯示一次。滑過一列的任何位置都會整列反白、日期變紅（`.archive-row`），捲動時逐列淡入（`.archive-row-reveal`）；列沒有可操作的元素，所以不讓它取得焦點。
- **狀態標示**：狀態、形式、分類不能只靠顏色區分，一定要有文字標籤與圖示。
- **圖示**：一律使用 lucide 的細線條圖示，品牌標誌例外（社群連結、Steam，取自 Simple Icons）。
  - 圖示跟著文字的顏色，搭配文字時加上 `aria-hidden`，名稱以文字為準。
  - 有圖示的地方：
    - Header 與手機選單：`NAV_ITEMS.icon`，經由 `TextLink` 的 `icon`，這時底線只畫在文字下方，靠 `.link-with-icon`。
    - 會員分頁：`MEMBER_TABS.icon`。
    - 密碼登入按鈕與所有 Steam 登入連結（`SteamIcon`）。
    - 派對詳情資訊表與子活動的時間、地點。
    - 聯絡資訊依類型。
    - 內戰場次列的人數。
  - 新增位置時沿用同樣做法。
- **網站特色**（`HighlightList`）：每列以後台挑選的圖示為主體，放在 64px 的細線方格裡，標題與內容是較小的輔助文字。
  - 圖示代碼對應在 `components/about/highlight-icon.tsx`，要和後端的 `HIGHLIGHT_ICONS`、後台的對照表一致。
  - 不認得的代碼顯示 `sparkles`。

## 部署注意

- `NEXT_PUBLIC_BACKEND_URL` 必須是訪客瀏覽器連得到的公開位址；圖片和影片由瀏覽器直接向後端讀取。它在 `npm run build` 時就會寫進程式，改了之後要重新建置。
- 正式環境要使用 HTTPS，會員 cookie 才能帶上 `Secure`。
- nginx 要讓 `/member/videos/upload` 收 500 MB 的請求並關閉請求緩衝（[deploy/](https://github.com/jenny86520/xenophobia-portal/blob/main/deploy/README.md) 的設定已包含），其他路徑維持預設的 1 MB。
- **前台只能經由 nginx 對外**：Next 會保留訪客自己帶來的 `X-Forwarded-For`，只有 nginx 設定的位址可信。前台伺服器的位址也要列在後端的 `TRUST_PROXY` 中。用根目錄 [deploy/](https://github.com/jenny86520/xenophobia-portal/blob/main/deploy/README.md) 的 Docker compose 部署時已設定好；其他部署方式見 [docs/deploy](https://github.com/jenny86520/xenophobia-portal/blob/main/docs/deploy/README.md)。

## 以容器執行

正式環境用根目錄 [deploy/](https://github.com/jenny86520/xenophobia-portal/blob/main/deploy/README.md) 的 Docker compose 執行整套服務，這裡只說明前台映像。

- **standalone**：`next.config.ts` 設定了 `output: "standalone"`。`Dockerfile` 只把 `.next/standalone`、`.next/static` 與 `public` 放進映像，以 `node` 使用者執行 `node server.js`（3000 埠）。本機的 `npm run dev` 不受影響。
- **建置參數 `NEXT_PUBLIC_BACKEND_URL`（必填）**：瀏覽器連得到的後端網址，用來組出圖片與影片網址，在建置時寫入。改了要重新建置。
- **建置參數 `DEPLOYMENT_ID`（選填）**：部署代號，設定成 `next.config.ts` 的 `deploymentId`。換版腳本（`deploy/scripts/update.sh`）會帶入前台的 commit。換版後，使用者在舊版開著的頁面點連結或送出表單時，會整頁重新載入新版，不會出現找不到舊程式檔或 Server Action 的錯誤。不設定時（本機建置）沒有這個保護，其他行為不變。
- **執行時的 `BACKEND_URL`**：前台伺服器呼叫後端的內部網址，例如 `http://backend:3001`。
- **`.env*` 不會進入映像**（見 `.dockerignore`）。
- **單獨建置**：`docker build --build-arg NEXT_PUBLIC_BACKEND_URL=https://api.example.com -t xpa-frontend .`

## 相關文件

- [根目錄 README](https://github.com/jenny86520/xenophobia-portal/blob/main/README.md)：整套系統的啟動方式與文件索引
- [後端 README](https://github.com/jenny86520/xenophobia-backend/blob/main/README.md)：API 與環境設定
- [openspec/specs/](https://github.com/jenny86520/xenophobia-portal/tree/main/openspec/specs/)：系統行為規格（以此為準）
- [CLAUDE.md](https://github.com/jenny86520/xenophobia-portal/blob/main/CLAUDE.md)：給開發者的實作細節與慣例
