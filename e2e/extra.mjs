// E2E tambahan: revisi loop, CRUD misi/reward, analitik isi, mobile.
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
const dir = join(tmpdir(), "iq-e2e2");
mkdirSync(dir, { recursive: true });
const f1 = join(dir, "a.png");
const f2 = join(dir, "b.png");
writeFileSync(f1, PNG);
writeFileSync(f2, PNG);

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
async function newPage() {
  const c = await browser.newContext();
  const p = await c.newPage();
  p.on("dialog", (d) => d.accept());
  return p;
}
async function login(p, email, pw) {
  await p.goto(`${BASE}/login`);
  await p.fill("#email", email);
  await p.fill("#password", pw);
  await p.click('button[type="submit"]');
  await p.waitForURL("**/dashboard");
}

const u = await newPage();
const a = await newPage();
await login(u, "demo@impactquest.local", "demo1234");
await login(a, "admin@impactquest.local", "admin1234");

// --- loop revisi via plant ---
await step("join+submit plant", async () => {
  await u.goto(`${BASE}/missions/plant-for-tomorrow`);
  await u.click('button:has-text("Join This Mission")');
  await u.waitForURL(/joined=1/);
  await u.goto(`${BASE}/my-missions`);
  const plantCard = u.locator('[data-mission-slug="plant-for-tomorrow"]');
  if (await plantCard.count() > 0) {
    await plantCard.first().locator('a:has-text("Submit Evidence")').click();
  } else {
    await u.click('a:has-text("Submit Evidence")');
  }
  await u.waitForURL(/\/submit/);
  await u.setInputFiles("#before_photo", f1);
  await u.setInputFiles("#after_photo", f2);
  await u.fill("#description", "Planted a mango tree.");
  await u.fill('input[name="metric_mm-plant"]', "2");
  await u.check('input[type="checkbox"]');
  await u.click('button:has-text("Submit Evidence for Review")');
  await u.waitForURL(/\/submissions\//);
  await u.getByText("Pending Review").first().waitFor({ timeout: 15000 });
});

await step("admin requests revision", async () => {
  await a.goto(`${BASE}/admin/submissions?tab=pending`);
  await a.locator("td a").first().click();
  await a.waitForURL(/\/admin\/submissions\//);
  await a.fill("#rev-note", "Photos are unclear, please re-upload.");
  await a.click('button:has-text("Request Revision")');
  await a.waitForURL(/msg=/);
  await a.getByText("Revision requested").waitFor({ timeout: 15000 });
});

await step("user submits revision", async () => {
  await u.goto(`${BASE}/my-missions?tab=attention`);
  await u.getByText("REVISION_REQUESTED").first().waitFor({ timeout: 15000 });
  await u.click('a:has-text("Detail")');
  await u.waitForURL(/\/submissions\//);
  await u.click('a:has-text("Fix and resubmit evidence")');
  await u.waitForURL(/\/resubmit/);
  await u.setInputFiles("#before_photo", f1);
  await u.setInputFiles("#after_photo", f2);
  await u.fill("#description", "Planted a mango tree, revised photos.");
  await u.fill('input[name="metric_mm-plant"]', "2");
  await u.check('input[type="checkbox"]');
  await u.click('button:has-text("Submit Revision")');
  await u.waitForURL(/\/submissions\//);
  await u.getByText("Under Review").first().waitFor({ timeout: 15000 });
});

await step("approve revision result", async () => {
  await a.goto(`${BASE}/admin/submissions?tab=pending`);
  await a.locator("td a").first().click();
  await a.waitForURL(/\/admin\/submissions\//);
  await a.fill('input[name="verified_mm-plant"]', "2");
  await a.click('button:has-text("Approve")');
  await a.waitForURL(/msg=/);
  await a.getByText("Approved!").waitFor({ timeout: 15000 });
});

// --- CRUD misi via browser ---
await step("create + publish mission", async () => {
  await a.goto(`${BASE}/admin/missions/new`);
  await a.fill("#title", "E2E Browser Mission");
  await a.fill("#short_description", "E2E summary.");
  await a.fill("#description", "Description e2e.");
  await a.selectOption("#category", "SOCIAL");
  await a.fill("#xp_reward", "60");
  await a.fill("#point_reward", "15");
  await a.fill('input[name="metric1_name"]', "Aksi");
  await a.fill('input[name="metric1_key"]', "aksi_e2e");
  await a.fill('input[name="metric1_unit"]', "x");
  await a.click('button:has-text("Create Mission")');
  await a.waitForURL((url) => url.pathname.startsWith("/admin/missions/") && !url.pathname.endsWith("/new"));
  assert.match(await a.content(), /DRAFT/);
  await a.goto(`${BASE}/admin/missions`);
  await a.locator('li:has-text("E2E Browser Mission"), tr:has-text("E2E Browser Mission")').first().waitFor();
  // klik tombol ->ACTIVE pada baris tsb
  const row = a.locator('tr:has-text("E2E Browser Mission")');
  await row.locator('button:has-text("ACTIVE")').click();
  await row.locator('button:has-text("PAUSED")').waitFor({ timeout: 15000 });
  await u.goto(`${BASE}/missions?q=E2E+Browser`);
  assert.match(await u.content(), /E2E Browser Mission/);
});

await step("paused mission hidden from explorer", async () => {
  await a.goto(`${BASE}/admin/missions`);
  const row = a.locator('tr:has-text("E2E Browser Mission")');
  await row.locator('button:has-text("PAUSED")').click();
  await a.waitForTimeout(2000);
  await u.goto(`${BASE}/missions?q=E2E+Browser`);
  assert.match(await u.content(), /No missions match/);
});

// --- CRUD reward via browser ---
await step("buat + nonaktifkan reward", async () => {
  await a.goto(`${BASE}/admin/rewards/new`);
  await a.fill("#title", "E2E Voucher");
  await a.fill("#point_cost", "100");
  await a.fill("#stock", "5");
  await a.click('button:has-text("Create reward")');
  await a.waitForURL((url) => url.pathname.startsWith("/admin/rewards/") && !url.pathname.endsWith("/new"));
  await u.goto(`${BASE}/rewards`);
  assert.match(await u.content(), /E2E Voucher/);
  const rid = a.url().split("/").pop();
  await a.goto(`${BASE}/admin/rewards/${rid}`);
  await a.selectOption("#status", "INACTIVE");
  await a.click('button:has-text("Save")');
  await a.getByText("Stored").waitFor({ timeout: 15000 });
  await u.goto(`${BASE}/rewards`);
  assert.doesNotMatch(await u.content(), /E2E Voucher/);
});

// --- analitik isi ---
await step("analitik ada angka + svg", async () => {
  await a.goto(`${BASE}/admin/analytics`);
  const t = await a.content();
  assert.match(t, /Analytics/);
  assert.ok(a.locator("svg").count());
});

// --- mobile viewport ---
await step("mobile tak overflow", async () => {
  const c = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const m = await c.newPage();
  for (const url of [`${BASE}/`, `${BASE}/missions`, `${BASE}/community`, `${BASE}/leaderboard`,
    `${BASE}/login`, `${BASE}/register`, `${BASE}/rewards`, `${BASE}/missions/clean-your-neighborhood`,
    `${BASE}/campaigns/green-city-challenge`]) {
    await m.goto(url);
    const over = await m.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    assert.ok(over <= 1, `${url} overflow ${over}px`);
  }
  await c.close();
});

await browser.close();
console.log(`\n${pass} langkah lolos.`);
