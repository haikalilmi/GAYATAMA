import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { chromium } from 'playwright-core';

const base = process.env.E2E_BASE ?? 'http://localhost:3185';
const executablePath = [process.env.BROWSER_PATH,
  'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
].find((path) => path && existsSync(path));
assert.ok(executablePath, 'Set BROWSER_PATH to an installed Chromium browser');
const browser = await chromium.launch({ executablePath, headless: true });
let passed = 0;
let failed = 0;
async function step(name, fn) {
  try { await fn(); passed++; console.log(`PASS ${name}`); }
  catch (e) { failed++; console.error(`FAIL ${name}: ${e.message.split('\n')[0]}`); }
}
async function pageFor() {
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  return page;
}
async function visit(page, path) {
  const response = await page.goto(`${base}${path}`);
  await page.waitForLoadState('networkidle');
  assert.ok(response.status() < 400, `HTTP ${response.status()}`);
  assert.doesNotMatch(await page.locator('body').innerText(), /Something failed to load|Application error/);
}
try {
  const guest = await pageFor();
  for (const path of ['/', '/missions', '/community', '/leaderboard', '/rewards', '/login', '/register', '/missions/clean-your-neighborhood', '/campaigns/green-city-challenge']) {
    await step(`guest ${path}`, () => visit(guest, path));
  }
  await step('guest protected dashboard redirects to login', async () => {
    await visit(guest, '/dashboard');
    await guest.waitForURL(/\/login(?:\?|$)/);
    assert.equal(new URL(guest.url()).pathname, '/login');
  });
  for (const [role, email, password, paths] of [
    ['USER', 'demo@impactquest.local', 'demo1234', ['/dashboard', '/my-missions', '/portfolio', '/notifications', '/rewards/history']],
    ['ADMIN', 'admin@impactquest.local', 'admin1234', ['/admin', '/admin/submissions', '/admin/missions', '/admin/rewards', '/admin/analytics']],
    ['ORGANIZATION', 'org@impactquest.local', 'org1234', ['/org']],
  ]) {
    const page = await pageFor();
    let loggedIn = false;
    await step(`${role} login`, async () => {
      await visit(page, '/login');
      await page.locator('#email').fill(email);
      await page.locator('#password').fill(password);
      await page.locator('button[type="submit"]').click();
      await page.waitForURL('**/dashboard');
      loggedIn = true;
    });
    if (!loggedIn) continue;
    for (const path of paths) await step(`${role} ${path}`, () => visit(page, path));
    if (role !== 'ADMIN') await step(`${role} admin access denied`, async () => {
      await visit(page, '/admin');
      assert.match(await page.locator('body').innerText(), /Access denied/);
    });
    if (role === 'USER') await step('USER organization access denied', async () => {
      await visit(page, '/org');
      assert.match(await page.locator('body').innerText(), /Access Restricted/);
    });
  }
  await guest.setViewportSize({ width: 390, height: 844 });
  for (const path of ['/', '/missions', '/community', '/leaderboard', '/login', '/rewards']) {
    await step(`mobile 390px ${path}`, async () => {
      await visit(guest, path);
      const overflow = await guest.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      assert.ok(overflow <= 1, `horizontal overflow ${overflow}px`);
    });
  }
} finally { await browser.close(); }
console.log(`${passed} passed, ${failed} failed (browser smoke; no mission or reward mutations)`);
process.exitCode = failed ? 1 : 0;
