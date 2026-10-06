# Xenophobia Frontend

XenoPhobiA（XPA）團隊官網的公開前台，提供派對（活動）目錄、團隊介紹，以及會員專區與活動報名。

前台只負責呈現畫面：所有資料都在伺服器端向 [xenophobia-backend](../xenophobia-backend) 的 REST API 取得，前台不保存任何業務資料或規則。

## 技術棧

| 項目 | 使用 |
| --- | --- |
| 框架 | Next.js 16.3.6（App Router，頁面以 Server Component 為主） |
| UI | React 19.2.8、Tailwind CSS 4、shadcn/ui（已 eject，原始碼在 `src/components/ui/`）、lucide 圖示 |
| 字型 | Geist、Geist Mono、Noto Serif TC（標題） |
| 語言 | TypeScript 5 |
| 測試 | Jest 30 + React Testing Library |

> Next.js 16 和多數教學或 AI 訓練資料描述的版本不同。使用不熟悉的 API 前，請先讀 `node_modules/next/dist/docs/` 裡的說明（見 [AGENTS.md](AGENTS.md)）。

## 快速開始

需要 Node.js 20 以上（開發環境使用 24）和 npm，並先啟動後端（預設 `http://localhost:3001`，步驟見[後端 README](../xenophobia-backend/README.md)）。

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
| `/` | 首頁：主視覺、團隊宣言、遊戲項目（highlight 影片）、下一場派對倒數與近期派對、里程碑、相簿（尚待提供）、聯絡方式 |
| `/about` | 品牌宣言、使命、遊戲項目、里程碑、聯絡方式、網站特色、未來規劃 |
| `/party` | 派對列表，可依狀態、形式、分類篩選（篩選條件放在網址上） |
| `/party/[id]` | 派對詳情：封面、子派對、報名區塊（會員可報名並看到參加者名單） |
| `/member` | 會員專區：個人資料、參加的活動、修改暱稱；未登入時只說明如何成為會員 |
| `/member/login` | 會員登入、申請重設密碼 |
| `/member/register` | 會員註冊（註冊後需由管理員開通） |
| `/member/password` | 透過信件中的一次性連結設定密碼 |

## 專案結構

```
src/
├── app/                  # 路由：頁面組成與資料抓取
│   ├── _sections/        # 首頁各區塊（部分與 /about 共用）
│   ├── party/  about/  member/
│   └── member/actions.ts # 會員相關的 Server Actions
├── components/
│   ├── brand/            # 設計系統元件（Section、Heading、BrandName、Placeholder…）
│   ├── ui/               # shadcn/ui 元件（button、badge 有客製，不要用 CLI 覆蓋）
│   ├── layout/           # Header、Footer、行動版選單、導覽項目（nav-items.ts）
│   └── about/  contact/  games/  member/  party/
├── hooks/                # 自訂 hook（use-countdown）
├── lib/                  # 後端存取：public-content-client.ts、member-session.ts
├── types/                # API 回應型別
└── utils/                # 純函式（含測試）
scripts/check-content.mjs # check:content 的實作
public/brand/             # 網站 logo
```

## 資料抓取

- 所有公開內容都透過 `src/lib/public-content-client.ts` 取得。
  - 每個請求只呼叫後端一次（`React.cache`），也不會預先產生頁面，所以後台改的內容會立刻生效。
  - 後端回 404 時頁面顯示「找不到」，其他錯誤則交給 `error.tsx`。
- 專案刻意不放 `loading.tsx`：串流的載入畫面要靠 JavaScript 才會換成內容，關閉 JavaScript 的訪客會一直停在載入畫面。

## 會員 session

- 會員的 JWT 只存在 httpOnly cookie `xpa_member`，瀏覽器的 JavaScript 讀不到，也不會直接呼叫會員 API，所以後端的 CORS 不需要額外設定。
- 登入、登出、註冊、設定密碼、修改暱稱、報名和取消報名都是 Server Action（`src/app/member/actions.ts`），只負責把請求轉給後端，再回傳後端的訊息。
- 表單都用 `<form action>` 搭配 `useActionState`，**不開 JavaScript 也能運作**。
- 後端回 401 時會清掉 cookie，並導回 `/member/login`。

## 設計系統

完整規格見 [openspec/specs/visual-design-system](../../openspec/specs/visual-design-system/spec.md)。開發時最常用到的規則：

- **顏色**：一律使用 `src/app/globals.css` 定義的 token（`ink`、`surface`、`line`、`signal`、`cta`…），不寫死色碼。網站只有深色模式。
- **版面**：用 `Section`、`Container`、`EditorialGrid` 排版，標題用 `Heading`，團隊名稱一律用 `BrandName`。
- **缺內容**：還沒有內容的地方放 `Placeholder`，不要自己編寫文案，並登記到 `placeholder-registry.ts` 或 `check-content.mjs`。
- **動態**：只用 CSS，全部包在 `prefers-reduced-motion: no-preference` 裡；保留清楚的焦點框。
- **狀態標示**：狀態、形式、分類不能只靠顏色區分，一定要有文字標籤與圖示。

## 部署注意

- `NEXT_PUBLIC_BACKEND_URL` 必須是訪客瀏覽器連得到的公開位址；圖片和影片由瀏覽器直接向後端讀取。它在 `npm run build` 時就會寫進程式，改了之後要重新建置。
- 正式環境要使用 HTTPS，會員 cookie 才能帶上 `Secure`。

## 相關文件

- [根目錄 README](../../README.md)：整套系統的啟動方式與文件索引
- [後端 README](../xenophobia-backend/README.md)：API 與環境設定
- [openspec/specs/](../../openspec/specs/)：系統行為規格（以此為準）
- [CLAUDE.md](../../CLAUDE.md)：給開發者的實作細節與慣例
