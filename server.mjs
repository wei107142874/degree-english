import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import pg from 'pg';

const { Pool } = pg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, 'dist');
const DATA_DIR = path.join(__dirname, 'data');
const SQLITE_FILE = path.join(DATA_DIR, 'degree-english.sqlite');
const OLD_JSON_FILE = path.join(DATA_DIR, 'sync-data.json');

const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || '0.0.0.0';
const BASE = '/degree-english';
const STORES = ['srs', 'attempts', 'plan', 'settings'];
const DEFAULT_USER_ID = '魏勇';
const LEGACY_USER_ID = 'main';

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE || 'postgres',
});

const keyOf = {
  srs: (r) => r?.wordId,
  attempts: (r) => r?.id,
  plan: (r) => r?.id,
  settings: (r) => r?.id,
};

function cleanUserId(value) {
  const id = String(value || '').trim();
  return id && id.length <= 40 ? id : DEFAULT_USER_ID;
}

function validStore(store) {
  return STORES.includes(store);
}

function recordKey(store, rec) {
  const key = keyOf[store]?.(rec);
  return key == null ? '' : String(key);
}

async function initStorage() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      created_at BIGINT NOT NULL,
      updated_at BIGINT NOT NULL
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS records (
      user_id TEXT NOT NULL DEFAULT '魏勇',
      store TEXT NOT NULL,
      record_key TEXT NOT NULL,
      json JSONB NOT NULL,
      updated_at BIGINT NOT NULL,
      PRIMARY KEY (user_id, store, record_key)
    )
  `);
  const { rows: columns } = await pool.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'records' AND column_name = 'user_id'
  `);
  if (columns.length === 0) {
    await pool.query(`ALTER TABLE records ADD COLUMN user_id TEXT NOT NULL DEFAULT '魏勇'`);
  }
  await pool.query(`ALTER TABLE records ALTER COLUMN user_id SET DEFAULT '魏勇'`);
  const { rows: pk } = await pool.query(`
    SELECT array_agg(a.attname ORDER BY k.ord) AS columns
    FROM pg_index i
    JOIN pg_class t ON t.oid = i.indrelid
    JOIN LATERAL unnest(i.indkey) WITH ORDINALITY AS k(attnum, ord) ON true
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = k.attnum
    WHERE t.relname = 'records' AND i.indisprimary
    GROUP BY i.indexrelid
  `);
  const pkColumns = Array.isArray(pk[0]?.columns)
    ? pk[0].columns
    : String(pk[0]?.columns || '').replace(/[{}"]/g, '').split(',').filter(Boolean);
  if (pkColumns.join(',') !== 'user_id,store,record_key') {
    await pool.query('ALTER TABLE records DROP CONSTRAINT IF EXISTS records_pkey');
    await pool.query('ALTER TABLE records ADD PRIMARY KEY (user_id, store, record_key)');
  }
  await pool.query('CREATE INDEX IF NOT EXISTS records_user_store_updated_idx ON records (user_id, store, updated_at)');
  await migrateLegacyDefaultUser();
  await pool.query(`
    INSERT INTO users (id, created_at, updated_at)
    SELECT user_id, min(updated_at), max(updated_at)
    FROM records
    GROUP BY user_id
    ON CONFLICT (id) DO NOTHING
  `);
  const now = Date.now();
  await pool.query(
    'INSERT INTO users (id, created_at, updated_at) VALUES ($1, $2, $2) ON CONFLICT (id) DO NOTHING',
    [DEFAULT_USER_ID, now],
  );

  if ((await dataCount()) > 0) return;
  if (await migrateSqlite()) return;
  await migrateOldJson();
}

async function migrateLegacyDefaultUser() {
  if (DEFAULT_USER_ID === LEGACY_USER_ID) return;
  const now = Date.now();
  await pool.query(
    `INSERT INTO users (id, created_at, updated_at)
     VALUES ($1, $2, $2)
     ON CONFLICT (id) DO NOTHING`,
    [DEFAULT_USER_ID, now],
  );
  await pool.query(
    `INSERT INTO records (user_id, store, record_key, json, updated_at)
     SELECT $1, store, record_key, json, updated_at
     FROM records
     WHERE user_id = $2
     ON CONFLICT (user_id, store, record_key) DO NOTHING`,
    [DEFAULT_USER_ID, LEGACY_USER_ID],
  );
  await pool.query('DELETE FROM records WHERE user_id = $1', [LEGACY_USER_ID]);
  await pool.query('DELETE FROM users WHERE id = $1', [LEGACY_USER_ID]);
}

async function ensureUser(userId, db = pool) {
  const id = cleanUserId(userId);
  const now = Date.now();
  await db.query(
    `INSERT INTO users (id, created_at, updated_at)
     VALUES ($1, $2, $2)
     ON CONFLICT (id) DO UPDATE SET updated_at = EXCLUDED.updated_at`,
    [id, now],
  );
  return id;
}

async function createUser(userId) {
  const id = String(userId || '').trim();
  if (!id || id.length > 40) return null;
  const now = Date.now();
  const { rowCount } = await pool.query(
    `INSERT INTO users (id, created_at, updated_at)
     VALUES ($1, $2, $2)
     ON CONFLICT (id) DO NOTHING`,
    [id, now],
  );
  return rowCount > 0 ? id : null;
}

async function upsertRecord(userId, store, rec, fallbackTs = Date.now(), db = pool) {
  const cleanId = await ensureUser(userId, db);
  const key = recordKey(store, rec);
  if (!key || typeof rec !== 'object' || Array.isArray(rec)) return false;
  const updatedAt = Number.isFinite(Number(rec.updatedAt)) ? Number(rec.updatedAt) : fallbackTs;
  const next = { ...rec, updatedAt };
  await db.query(
    `
      INSERT INTO records (user_id, store, record_key, json, updated_at)
      VALUES ($1, $2, $3, $4::jsonb, $5)
      ON CONFLICT (user_id, store, record_key) DO UPDATE SET
        json = EXCLUDED.json,
        updated_at = EXCLUDED.updated_at
      WHERE EXCLUDED.updated_at >= records.updated_at
    `,
    [cleanId, store, key, JSON.stringify(next), updatedAt],
  );
  return true;
}

async function listRecords(userId, store) {
  const { rows } = await pool.query(
    'SELECT json FROM records WHERE user_id = $1 AND store = $2 ORDER BY updated_at, record_key',
    [cleanUserId(userId), store],
  );
  return rows.map(row => row.json);
}

async function replaceAll(userId, recordsByStore) {
  const cleanId = cleanUserId(userId);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await ensureUser(cleanId, client);
    await client.query('DELETE FROM records WHERE user_id = $1', [cleanId]);
    const now = Date.now();
    for (const store of STORES) {
      for (const rec of recordsByStore?.[store] || []) await upsertRecord(cleanId, store, rec, now, client);
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

async function dataCount() {
  const { rows } = await pool.query('SELECT count(*) AS n FROM records');
  return Number(rows[0]?.n || 0);
}

async function listUsers() {
  const { rows } = await pool.query(`
    SELECT u.id, count(r.record_key) AS records, greatest(u.updated_at, coalesce(max(r.updated_at), 0)) AS updated_at
    FROM users u
    LEFT JOIN records r ON r.user_id = u.id
    GROUP BY u.id, u.updated_at
    ORDER BY u.id
  `);
  return rows.map(row => ({
    id: row.id,
    records: Number(row.records || 0),
    updatedAt: Number(row.updated_at || 0),
  }));
}

async function copyUserData(fromUserId, toUserId) {
  const from = cleanUserId(fromUserId);
  const to = cleanUserId(toUserId);
  if (from === to) return 0;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await ensureUser(to, client);
    await client.query('DELETE FROM records WHERE user_id = $1', [to]);
    const { rows } = await client.query(
      'SELECT store, record_key, json, updated_at FROM records WHERE user_id = $1 ORDER BY store, record_key',
      [from],
    );
    for (const row of rows) {
      await client.query(
        `INSERT INTO records (user_id, store, record_key, json, updated_at)
         VALUES ($1, $2, $3, $4::jsonb, $5)`,
        [to, row.store, row.record_key, JSON.stringify(row.json), row.updated_at],
      );
    }
    await client.query('UPDATE users SET updated_at = $2 WHERE id = $1', [to, Date.now()]);
    await client.query('COMMIT');
    return rows.length;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

async function migrateSqlite() {
  if (!fs.existsSync(SQLITE_FILE)) return false;
  try {
    const sqlite = new DatabaseSync(SQLITE_FILE);
    const rows = sqlite.prepare('SELECT store, json, updated_at FROM records ORDER BY updated_at, key').all();
    if (rows.length === 0) return false;
    const byStore = Object.fromEntries(STORES.map(store => [store, []]));
    for (const row of rows) byStore[row.store]?.push(JSON.parse(row.json));
    await replaceAll(DEFAULT_USER_ID, byStore);
    console.log(`[data] migrated ${rows.length} records from ${SQLITE_FILE} to PostgreSQL`);
    return true;
  } catch (e) {
    console.error('[data] SQLite migration failed:', e.message);
    return false;
  }
}

async function migrateOldJson() {
  if (!fs.existsSync(OLD_JSON_FILE)) return false;
  try {
    const old = JSON.parse(fs.readFileSync(OLD_JSON_FILE, 'utf8'));
    const byStore = Object.fromEntries(STORES.map(store => [store, Object.values(old[store] || {})]));
    const total = Object.values(byStore).reduce((n, rows) => n + rows.length, 0);
    if (total === 0) return false;
    await replaceAll(DEFAULT_USER_ID, byStore);
    console.log(`[data] migrated ${total} records from ${OLD_JSON_FILE} to PostgreSQL`);
    return true;
  } catch (e) {
    console.error('[data] old JSON migration failed:', e.message);
    return false;
  }
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

function sendJson(res, status, obj) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(obj));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 50 * 1024 * 1024) reject(new Error('body too large'));
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

async function readJson(req) {
  return JSON.parse((await readBody(req)) || '{}');
}

function serveStatic(req, res, rawPath) {
  let p = rawPath;
  try {
    p = decodeURIComponent(p);
  } catch {
    p = rawPath;
  }
  if (p === BASE || p === BASE + '/') p = '/';
  if (p.startsWith(BASE + '/')) p = p.slice(BASE.length);
  if (p === '/' || p === '') p = '/index.html';

  const rel = p.replace(/^[/\\]+/, '');
  const filePath = path.resolve(DIST_DIR, rel);
  if (filePath !== DIST_DIR && !filePath.startsWith(DIST_DIR + path.sep)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.stat(filePath, (err, st) => {
    if (!err && st.isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, {
        'Content-Type': MIME[ext] || 'application/octet-stream',
        'Content-Length': st.size,
        'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600',
      });
      fs.createReadStream(filePath).pipe(res);
      return;
    }
    if (req.headers.accept?.includes('text/html')) {
      fs.readFile(path.join(DIST_DIR, 'index.html'), (e2, buf) => {
        if (e2) {
          res.writeHead(404);
          return res.end('Not Found');
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(buf);
      });
      return;
    }
    res.writeHead(404);
    res.end('Not Found');
  });
}

const controlClients = new Set();

function broadcastControl(msg) {
  const data = JSON.stringify(msg);
  for (const res of controlClients) {
    try {
      res.write(`data: ${data}\n\n`);
    } catch {
      // Closed client.
    }
  }
}

async function handleDbApi(req, res, pathname) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const userId = cleanUserId(url.searchParams.get('user') || req.headers['x-user-id']);

  if (pathname === '/api/db/users' && req.method === 'GET') {
    return sendJson(res, 200, { ok: true, users: await listUsers() });
  }

  if (pathname === '/api/db/users' && req.method === 'POST') {
    let body;
    try {
      body = await readJson(req);
    } catch {
      return sendJson(res, 400, { ok: false, error: 'invalid json' });
    }
    if (!String(body.userId || '').trim()) return sendJson(res, 400, { ok: false, error: 'empty user' });
    const id = await createUser(body.userId);
    if (!id) return sendJson(res, 409, { ok: false, error: 'user exists' });
    return sendJson(res, 200, { ok: true, user: { id, records: 0, updatedAt: Date.now() } });
  }

  if (pathname === '/api/db/copy-user' && req.method === 'POST') {
    let body;
    try {
      body = await readJson(req);
    } catch {
      return sendJson(res, 400, { ok: false, error: 'invalid json' });
    }
    const fromUser = cleanUserId(body.fromUserId);
    const toUser = cleanUserId(body.toUserId || userId);
    if (fromUser === toUser) return sendJson(res, 400, { ok: false, error: 'same user' });
    const copied = await copyUserData(fromUser, toUser);
    return sendJson(res, 200, { ok: true, copied, serverNow: Date.now() });
  }

  if (pathname === '/api/db/import' && req.method === 'POST') {
    let body;
    try {
      body = await readJson(req);
    } catch {
      return sendJson(res, 400, { ok: false, error: 'invalid json' });
    }
    await replaceAll(userId, body.records);
    return sendJson(res, 200, { ok: true, serverNow: Date.now() });
  }

  const parts = pathname.split('/').filter(Boolean);
  const store = parts[2];
  if (!validStore(store)) return sendJson(res, 404, { ok: false, error: 'unknown store' });

  if (req.method === 'GET') {
    return sendJson(res, 200, { ok: true, records: await listRecords(userId, store) });
  }

  if (req.method === 'PUT' || req.method === 'POST') {
    let body;
    try {
      body = await readJson(req);
    } catch {
      return sendJson(res, 400, { ok: false, error: 'invalid json' });
    }
    const records = Array.isArray(body.records) ? body.records : [body.record ?? body];
    let saved = 0;
    for (const rec of records) if (await upsertRecord(userId, store, rec)) saved++;
    return sendJson(res, 200, { ok: true, saved, serverNow: Date.now() });
  }

  if (req.method === 'DELETE') {
    const key = parts[3] ? decodeURIComponent(parts[3]) : '';
    if (key) await pool.query('DELETE FROM records WHERE user_id = $1 AND store = $2 AND record_key = $3', [userId, store, key]);
    else await pool.query('DELETE FROM records WHERE user_id = $1 AND store = $2', [userId, store]);
    return sendJson(res, 200, { ok: true, serverNow: Date.now() });
  }

  return sendJson(res, 405, { ok: false, error: 'method not allowed' });
}

async function handleSyncCompat(req, res, pathname) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const userId = cleanUserId(url.searchParams.get('user') || req.headers['x-user-id']);

  if (pathname === '/api/sync/info' && req.method === 'GET') {
    return sendJson(res, 200, {
      ok: true,
      serverTime: Date.now(),
      app: 'degree-english',
      dataCount: await dataCount(),
      addresses: lanAddresses(),
      storage: 'postgresql',
      userId,
      users: await listUsers(),
    });
  }

  if ((pathname === '/api/sync/pull' || pathname === '/api/sync/push') && req.method === 'POST') {
    let body;
    try {
      body = await readJson(req);
    } catch {
      return sendJson(res, 400, { ok: false, error: 'invalid json' });
    }

    const now = Date.now();
    if (pathname === '/api/sync/pull') {
      const changes = Object.fromEntries(await Promise.all(STORES.map(async store => [store, await listRecords(userId, store)])));
      return sendJson(res, 200, { ok: true, serverNow: now, changes });
    }

    if (body.clearAll) {
      await pool.query('DELETE FROM records WHERE user_id = $1', [userId]);
    } else if (body.replace) {
      await replaceAll(userId, body.records);
    } else {
      for (const store of STORES) {
        for (const rec of body.records?.[store] || []) await upsertRecord(userId, store, rec, now);
      }
    }
    return sendJson(res, 200, { ok: true, serverNow: now });
  }

  return sendJson(res, 404, { ok: false, error: 'not found' });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  try {
    if (pathname.startsWith('/api/db/')) return await handleDbApi(req, res, pathname);
    if (pathname.startsWith('/api/sync/')) return await handleSyncCompat(req, res, pathname);

    if (pathname === '/api/control/send' && req.method === 'POST') {
      let body;
      try {
        body = await readJson(req);
      } catch {
        return sendJson(res, 400, { ok: false, error: 'invalid json' });
      }
      broadcastControl(body);
      return sendJson(res, 200, { ok: true, relayed: controlClients.size });
    }

    if (pathname === '/api/control/events' && req.method === 'GET') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      });
      res.write(': connected\n\n');
      controlClients.add(res);
      const ping = setInterval(() => {
        try {
          res.write(': ping\n\n');
        } catch {
          // Closed client.
        }
      }, 25000);
      req.on('close', () => {
        clearInterval(ping);
        controlClients.delete(res);
      });
      return;
    }
  } catch (e) {
    console.error('[server] request failed:', e);
    return sendJson(res, 500, { ok: false, error: 'server error' });
  }

  if (req.method === 'GET' || req.method === 'HEAD') return serveStatic(req, res, pathname);
  res.writeHead(405);
  res.end('Method Not Allowed');
});

function lanAddresses() {
  const out = [];
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal && !net.address.startsWith('169.254.')) out.push(net.address);
    }
  }
  return out;
}

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is already in use. Use http://localhost:${PORT} or stop the old server first.`);
    process.exit(0);
  }
  throw e;
});

await initStorage();

server.listen(PORT, HOST, () => {
  console.log('==========================================');
  console.log('  Degree English server started');
  console.log(`  URL:      http://localhost:${PORT}`);
  for (const ip of lanAddresses()) console.log(`  LAN URL:  http://${ip}:${PORT}`);
  console.log(`  PostgreSQL: ${process.env.PGHOST}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE || 'postgres'}`);
  console.log('==========================================');
});
