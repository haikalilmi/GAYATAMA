import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import config from '../next.config.mjs';

const require = createRequire(import.meta.url);
function load(file, mocks) {
  const source = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const exports = {};
  runInNewContext(outputText, {
    exports, require: (id) => mocks[id] ?? require(id),
    crypto: globalThis.crypto, Date, Buffer, process,
  });
  return exports;
}
let passed = 0;
let failed = 0;
async function test(name, fn) {
  try { await fn(); passed++; console.log(`PASS ${name}`); }
  catch (e) { failed++; console.error(`FAIL ${name}: ${e.message}`); }
}

await test('session expiration compares instants across timezone offsets', async () => {
  const future = new Date(Date.now() + 60000);
  const local = new Date(future.getTime() - 12 * 3600000).toISOString().slice(0, -1) + '-12:00';
  const auth = load('lib/auth.ts', {
    'next/headers': { cookies: async () => ({ get: () => ({ value: 'test' }) }) },
    'next/navigation': { redirect: () => {} },
    './db': { sql: () => ({ get: async () => ({ id: 'user', expires_at: local }), run: async () => {} }) },
  });
  assert.equal((await auth.getCurrentUser())?.id, 'user');
});

await test('malformed session expiration is rejected', async () => {
  const auth = load('lib/auth.ts', {
    'next/headers': { cookies: async () => ({ get: () => ({ value: 'test' }) }) },
    'next/navigation': { redirect: () => {} },
    './db': { sql: () => ({ get: async () => ({ id: 'user', expires_at: 'invalid' }), run: async () => {} }) },
  });
  assert.equal(await auth.getCurrentUser(), null);
});

await test('expired joined participation allows direct rejoin', async () => {
  let expired = false;
  const participation = load('lib/participation.ts', {
    './db': { sql: (query) => ({
      get: async () => query.includes('FROM missions')
        ? { id: 'mission', status: 'ACTIVE', repeat_type: 'REPEATABLE', participation_expiry_hours: 48 }
        : query.includes('status IN') && !expired ? { found: 1 } : undefined,
      run: async () => { if (query.includes("status = 'EXPIRED'")) expired = true; },
    }) },
  });
  assert.equal((await participation.joinMission('user', 'USER', 'mission')).status, 'JOINED');
});

await test('identical before and after files raise duplicate risk', async () => {
  const risk = load('lib/risk.ts', {
    './db': { sql: () => ({ get: async () => undefined }) },
  });
  const result = await risk.calculateSubmissionRisk({ userId: 'user', proofInvalid: false, fileHashes: ['same', 'same'] });
  assert.ok(result.flags.some((flag) => flag.type === 'EXACT_DUPLICATE'));
});

await test('two maximum-size photos fit with multipart overhead', async () => {
  const body = new FormData();
  const photo = new Blob([new Uint8Array(5 * 1024 * 1024)], { type: 'image/png' });
  body.append('before_photo', photo, 'before.png');
  body.append('after_photo', photo, 'after.png');
  body.append('description', 'Evidence');
  const request = new Request('http://localhost', { method: 'POST', body });
  const bytes = (await request.arrayBuffer()).byteLength;
  const limit = parseFloat(config.experimental.serverActions.bodySizeLimit) * 1024 * 1024;
  assert.ok(bytes <= limit, `${bytes} bytes exceeds ${limit}`);
});
async function withDatabaseEnv(key, fn) {
  const previous = { ...process.env };
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = key;
  try { await fn(); } finally { process.env = previous; }
}
await test('server rejects an anonymous key mislabeled as service_role', () => withDatabaseEnv(
  `header.${Buffer.from(JSON.stringify({ role: 'anon' })).toString('base64url')}.signature`,
  async () => {
    const db = load('lib/db.ts', {
      '@supabase/supabase-js': { createClient: () => ({}) },
      './mode': { isSupabaseMode: () => true },
      'node:sqlite': {},
    });
    assert.throws(() => db.getSupabase(), /server|service_role/i);
  },
));
await test('SQL failures returned inside RPC data reject writes', () => withDatabaseEnv('sb_secret_test', async () => {
  const db = load('lib/db.ts', {
    '@supabase/supabase-js': { createClient: () => ({ rpc: async () => ({ data: [{ error: 'constraint failed', modified_sql: 'private query', params_received: ['private'] }], error: null }) }) },
    './mode': { isSupabaseMode: () => true },
    'node:sqlite': {},
  });
  await assert.rejects(db.sql('INSERT INTO example VALUES (?)', 'private').run(), /SQL execution failed/);
}));
await test('local mode converts $N placeholders to ?', async () => {
  let seen = null;
  class FakeDb {
    prepare(q) { seen = q; return { all: async () => [], run: () => {} }; }
    exec() {}
  }
  const db = load('lib/db.ts', {
    '@supabase/supabase-js': { createClient: () => ({}) },
    './mode': { isSupabaseMode: () => false },
    'node:sqlite': { DatabaseSync: FakeDb },
  });
  await db.sql('SELECT 1 WHERE a = $1 AND b = ?', 'x', 'y').all();
  assert.equal(seen, 'SELECT 1 WHERE a = ? AND b = ?');
});
console.log(`${passed} passed, ${failed} failed (isolated regression tests; database mocked)`);
process.exitCode = failed ? 1 : 0;
