#!/usr/bin/env node
/**
 * Pre-launch content gate (design §8): lists every placeholder the site would render,
 * per page, and exits non-zero while any remain.
 *
 *  - Data-driven placeholders come from GET /api/about (empty brand fields, games
 *    without summary/description, missing social links, ...). The rules mirror the
 *    <Placeholder> conditions in src/app and src/components/layout.
 *  - Fixed placeholders come from src/components/brand/placeholder-registry.ts.
 *
 * Usage: npm run check:content   (BACKEND_URL / NEXT_PUBLIC_BACKEND_URL as in the app)
 */
import { STATIC_PLACEHOLDERS } from "../src/components/brand/placeholder-registry.ts";

const PAGES = ["/", "/party", "/party/[id]", "/about"];
const backend = process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

let about;
try {
  const response = await fetch(`${backend}/api/about`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  about = await response.json();
} catch (error) {
  console.error(`無法取得 ${backend}/api/about：${error.message}`);
  process.exit(2);
}

const { teamProfile: p, games, milestones, contactInfo, highlights } = about;
const found = new Map(PAGES.map((page) => [page, new Map()]));
const add = (pages, name, label) => {
  for (const page of pages[0] === "*" ? PAGES : pages) found.get(page).set(name, label);
};

// Footer, on every page.
if (!p.tagline) add(["*"], "brand.tagline", "品牌標語");
if (!contactInfo.some((c) => c.type !== "social")) add(["*"], "contact.any", "聯絡資訊");
if (!contactInfo.some((c) => c.type === "social")) add(["*"], "contact.social", "社群連結");

// Home and about.
if (!p.brandStatement) add(["/", "/about"], "brand.statement", "品牌宣言");
if (p.foundedYear == null) add(["/"], "brand.founded-year", "成立年份");
if (!(p.primaryCtaLabel && p.primaryCtaUrl)) add(["/"], "brand.primary-cta", "主要 CTA");
if (!(p.secondaryCtaLabel && p.secondaryCtaUrl)) add(["/"], "brand.secondary-cta", "次要 CTA");
if (!p.closingStatement) add(["/"], "brand.closing-statement", "結尾宣言");
if (!p.mission.trim()) add(["/about"], "brand.mission", "使命");
if (games.length === 0) add(["/", "/about"], "games", "遊戲項目");
for (const game of games) {
  if (!game.summary) add(["/", "/about"], `game.${game.id}.summary`, `遊戲短述（${game.name}）`);
  if (!game.description) add(["/", "/about"], `game.${game.id}.description`, `遊戲說明（${game.name}）`);
}
if (milestones.length === 0) add(["/", "/about"], "milestones", "里程碑");
if (highlights.length === 0) add(["/about"], "highlights", "網站特色");

for (const entry of STATIC_PLACEHOLDERS) add(entry.pages, entry.name, entry.label);

let total = 0;
for (const [page, items] of found) {
  console.log(`\n${page}  (${items.size})`);
  for (const [name, label] of items) console.log(`  ${name.padEnd(48)} 待提供：${label}`);
  total += items.size;
}
console.log(`\n共 ${total} 個 placeholder（後端：${backend}）`);
process.exit(total > 0 ? 1 : 0);
