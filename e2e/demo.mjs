// E2E ImpactQuest via Brave sistem. Jalan: npm run test:e2e (server prod otomatis).
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright-core";
import assert from "node:assert";

const BASE = process.env.E2E_BASE ?? "http://localhost:3185";
const BRAVE = [
  process.env.BROWSER_PATH,
  "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
].find((p) => p && existsSync(p)) ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

let pass = 0;
async function step(name, fn) {
  try {
    await fn();
    pass++;
    console.log("PASS", name);
  } catch (e) {
    console.error("FAIL", name, "-", e.message.split("\n")[0]);
    process.exitCode = 1;
    throw e;
  }
}

const browser = await chromium.launch({ executablePath: BRAVE, args: ["--no-sandbox"] });
async function ctx() {
  const c = await browser.newContext();
  const p = await c.newPage();
  p.on("dialog", (d) => d.accept());
  return { c, p };
}

// aset foto
const dir = join(tmpdir(), "iq-e2e");
mkdirSync(dir, { recursive: true });
const before = join(dir, "before.png");
const after = join(dir, "after.png");
writeFileSync(before, PNG);
writeFileSync(after, PNG);

// --- USER demo bawaan ---
const { p: u } = await ctx();
await step("login demo", async () => {
  await u.goto(`${BASE}/login`);
  await u.fill("#email", "demo@impactquest.local");
  await u.fill("#password", "demo1234");
  await u.click('button[type="submit"]');
  await u.waitForURL("**/dashboard");
  assert.match(await u.content(), /Haikal/);
});

let proof = "";
await step("join clean", async () => {
  await u.goto(`${BASE}/missions/clean-your-neighborhood`);
  await u.click('button:has-text("Ikut misi ini")');
  await u.waitForURL(/joined=1/);
  await u.getByText("Kode bukti:").waitFor({ timeout: 15000 });
  const t = await u.textContent("body");
  const m = t.match(/IQ-[A-Z0-9]{6}/);
  assert.ok(m, "kode bukti tampil");
  proof = m[0];
  console.log("  proof:", proof);
});

await step("join ganda ditolak", async () => {
  await u.goto(`${BASE}/missions/clean-your-neighborhood`);
  assert.match(await u.content(), /sudah ikut misi ini/);
});

let subUrl = "";
await step("submit bukti", async () => {
  await u.goto(`${BASE}/my-missions`);
  const cleanCard = u.locator(`[data-mission-slug="clean-your-neighborhood"], div:has-text("${proof}")`).filter({ has: u.locator('a:has-text("Submit bukti")') });
  if (await cleanCard.count() > 0) {
    await cleanCard.last().locator('a:has-text("Submit bukti")').click();
  } else {
    await u.click('a:has-text("Submit bukti")');
  }
  await u.waitForURL(/\/submit/);
  await u.setInputFiles("#before_photo", before);
  await u.setInputFiles("#after_photo", after);
  await u.fill("#description", "Bersih-bersih RT 05 sampai bank sampah.");
  await u.fill("#proof_code_input", proof);
  await u.fill('input[name="metric_mm-waste"]', "3");
  await u.check('input[type="checkbox"]');
  await u.click('button:has-text("Kirim bukti")');
  await u.waitForURL(/\/submissions\//);
  subUrl = u.url();
  await u.getByText("PENDING").first().waitFor({ timeout: 15000 });
});

await step("user tak bisa buka admin", async () => {
  await u.goto(`${BASE}/admin`);
  assert.match(await u.content(), /Akses ditolak/);
});

// --- ADMIN ---
const { p: a } = await ctx();
await step("login admin + antrian", async () => {
  await a.goto(`${BASE}/login`);
  await a.fill("#email", "admin@impactquest.local");
  await a.fill("#password", "admin1234");
  await a.click('button[type="submit"]');
  await a.waitForURL("**/dashboard");
  await a.goto(`${BASE}/admin/submissions?tab=pending`);
  assert.match(await a.content(), /Clean Your Neighborhood/);
});

await step("review + approve", async () => {
  await a.click('a:has-text("Clean Your Neighborhood")');
  await a.waitForURL(/\/admin\/submissions\//);
  assert.match(await a.content(), /Bersih-bersih RT 05/);
  await a.click('button:has-text("Mulai review")');
  await a.getByText("UNDER_REVIEW").first().waitFor({ timeout: 15000 });
  await a.fill('input[name="verified_mm-waste"]', "3");
  await a.click('button:has-text("Approve")');
  await a.waitForURL(/msg=/);
  await a.getByText("Disetujui!").waitFor({ timeout: 15000 });
  {
    const t = await a.textContent("body");
    assert.match(t, /Disetujui!/);
    assert.match(t, /Changemaker/);
    assert.match(t, /Eco Starter/);
  }
});

// --- cek hasil demo ---
await step("dashboard naik level", async () => {
  await u.goto(`${BASE}/dashboard`);
  const t = await u.content();
  assert.match(t, /Changemaker/);
  assert.match(t, /2000/);
});
await step("portfolio + notif", async () => {
  await u.goto(`${BASE}/portfolio`);
  assert.match(await u.content(), /Eco Starter/);
  await u.goto(`${BASE}/notifications`);
  const t = await u.content();
  assert.match(t, /MISSION_VERIFIED/);
  assert.match(t, /LEVEL_UP/);
  assert.match(t, /BADGE_UNLOCKED/);
});
await step("komunitas +3kg", async () => {
  await u.goto(`${BASE}/community`);
  assert.match(await u.content(), /12\.003/);
});
await step("redeem coffee", async () => {
  await u.goto(`${BASE}/rewards`);
  await u.click('li:has-text("Coffee Voucher") button');
  await u.waitForURL(/\/rewards\/history\?code=/);
  await u.getByText("Kode demo kamu").waitFor({ timeout: 15000 });
  await u.goto(`${BASE}/rewards`);
  assert.match(await u.content(), /Poin belum cukup/);
});

// --- user2: bukti orang lain 403 ---
const { p: u2 } = await ctx();
await step("register user2 + evidence 403", async () => {
  await u2.goto(`${BASE}/register`);
  await u2.fill("#full_name", "E2E Kedua");
  await u2.fill("#email", "e2e2@impactquest.local");
  await u2.fill("#password", "e2e12345");
  await u2.click('button[type="submit"]');
  await u2.waitForURL("**/dashboard");
  const evId = subUrl.match(/submissions\/(.+)/)[1];
  const r = await u2.request.get(`${BASE}/api/evidence/${evId}`);
  assert.equal(r.status(), 404); // id submission bukan id evidence
  // ambil id evidence asli dari halaman owner
  const html = await u.textContent("body");
  assert.ok(html.length > 0);
});

// bukti 403 beneran: ambil evidence id via halaman submission owner
await step("evidence milik orang 403", async () => {
  await u.goto(subUrl);
  const src = await u.getAttribute("figure img", "src");
  assert.ok(src && src.startsWith("/api/evidence/"));
  const r = await u2.request.get(`${BASE}${src}`);
  assert.equal(r.status(), 403);
  const r2 = await u.request.get(`${BASE}${src}`);
  assert.equal(r2.status(), 200);
});

await browser.close();
console.log(`\n${pass} langkah lolos.`);
