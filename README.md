# Xenophobia Frontend

反排外團隊官網的前端專案，使用 [Next.js](https://nextjs.org)（App Router）開發，負責呈現公開內容頁面（活動、關於我們等），資料來源為 [xenophobia-backend](../xenophobia-backend) 提供的 REST API。

## 專案結構

`src/` 下依職責分層，遵循 Next.js App Router 慣例：

- `src/app/` — 路由層：僅負責頁面組成與資料抓取（`page.tsx`、`layout.tsx`）
- `src/components/` — 可重用 UI 元件（`components/party/`、`components/layout/`）
- `src/hooks/` — 封裝狀態／副作用的自訂 hook（例如 `use-countdown.ts`）
- `src/lib/` — 呼叫後端 REST API 的請求函式（`public-content-client.ts`）
- `src/types/` — API 請求／回應的型別定義
- `src/utils/` — 與 UI 無關的純函式（例如 `countdown.ts`、`party-lifecycle.ts`）

## 環境需求

- Node.js 20+
- 已啟動的後端服務（預設 `http://localhost:3001`），參考 [apps/xenophobia-backend/README.md](../xenophobia-backend/README.md)

## 環境變數

複製 `.env.example` 為 `.env.local`：

```bash
BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

- 頁面在伺服器端（Server Component）向後端取資料，優先使用 `BACKEND_URL`；可以設成只有伺服器連得到的內部位址（例如容器網路中的 `http://backend:3001`）。
- `BACKEND_URL` 未設定時改用 `NEXT_PUBLIC_BACKEND_URL`，兩者都未設定時預設為 `http://localhost:3001`。
- 上傳的 highlight 影片由瀏覽器直接向後端讀取（`/media/videos/...`），網址一律以 `NEXT_PUBLIC_BACKEND_URL` 組成，所以它必須是**訪客瀏覽器能連到**的公開位址，不能是內部位址。

## 開始使用

安裝依賴：

```bash
npm install
```

啟動開發伺服器：

```bash
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000) 即可看到畫面。頁面會隨檔案修改自動熱更新。

## 常用指令

| 指令 | 說明 |
| --- | --- |
| `npm run dev` | 啟動開發伺服器 |
| `npm run build` | 建置正式環境版本 |
| `npm run start` | 以正式環境模式啟動（需先 `build`） |
| `npm run lint` | 執行 ESLint 檢查 |
| `npm run test` | 執行單元測試 |
| `npm run test:watch` | 以 watch 模式執行單元測試 |
| `npm run check:content` | 依頁面列出尚待提供的內容（placeholder），有任何一項時以非 0 狀態結束，可作為上線前檢查 |

## 測試

單元與元件測試使用 Jest + React Testing Library，並透過 Next.js 官方的 `next/jest` 整合進行設定：

```bash
npm run test
npm run test:watch
```

## 技術棧

- [Next.js](https://nextjs.org) 16（App Router）
- [React](https://react.dev) 19
- TypeScript
- Jest + React Testing Library

## 延伸閱讀

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
