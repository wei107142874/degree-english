// ============================================================
// 学位英语备考助手 - 局域网同步服务器
// ------------------------------------------------------------
// 功能：
//   1. 托管构建产物 dist/（电脑、手机都能通过浏览器访问）
//   2. 提供 /api/sync/* 接口，让手机与电脑的学习记录双向同步
//   3. 同步数据保存在 data/sync-data.json（本机磁盘，电脑关掉浏览器也还在）
//
// 启动：node server.mjs  （或 npm run serve）
// 默认监听 0.0.0.0:4173，可用环境变量 PORT / HOST 覆盖
// ============================================================

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, 'dist');
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'sync-data.json');

const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || '0.0.0.0';
const BASE = '/degree-english'; // 必须与 vite.config.ts 的 base 一致

// 存储名必须与浏览器 IndexedDB 的 objectStore 名一致（见 src/db/db.ts）
const STORES = ['srs', 'attempts', 'plan', 'settings'];

// ---------- 数据模型 ----------
// state = {
//   srs/attempts/plan/settings: { [key]: 记录(含 updatedAt) },  // 当前有效数据
//   tombstones: { [store]: { [key]: 删除时间戳 } },             // 删除标记（同步删除用）
//   devices: { [deviceId]: { lastSeen } },                      // 最近连接的设备
// }

function initialState() {
  return { srs: {}, attempts: {}, plan: {}, settings: {}, tombstones: { srs: {}, attempts: {}, plan: {}, settings: {} }, devices: {} };
}

let state = initialState();
try {
  state = { ...initialState(), ...JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) };
  for (const s of STORES) {
    state[s] ??= {};
    state.tombstones[s] ??= {};
  }
  state.devices ??= {};
} catch {
  /* 首次运行，数据文件还不存在 */
}

let saveTimer = null;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(DATA_FILE, JSON.stringify(state));
    } catch (e) {
      console.error('[同步] 保存数据失败:', e.message);
    }
  }, 200);
}

// ---------- 同步合并逻辑 ----------

const keyOf = {
  srs: (r) => r?.wordId,
  attempts: (r) => r?.id,
  plan: (r) => r?.id,
  settings: (r) => r?.id,
};

/** 合并一条客户端发来的记录（按 updatedAt 最新者胜） */
function mergeRecord(store, rec, now) {
  const key = keyOf[store](rec);
  if (!key) return;
  const recTs = rec.updatedAt ?? now;
  if (!rec.updatedAt) rec.updatedAt = recTs; // 服务器兜底盖时间戳
  // 若该 key 已被更晚的删除标记覆盖，则忽略这条旧记录
  const tombTs = state.tombstones[store][key];
  if (tombTs != null && tombTs >= recTs) return;
  const cur = state[store][key];
  if (cur && (cur.updatedAt ?? 0) >= recTs) return; // 服务器已有更新的版本
  state[store][key] = rec;
  delete state.tombstones[store][key];
}

/** 清空某个 store（本地点“清空全部数据”后调用）：把所有记录变成删除标记 */
function clearStore(store, now) {
  for (const [key, rec] of Object.entries(state[store])) {
    state.tombstones[store][key] = Math.max(state.tombstones[store][key] ?? 0, now, (rec.updatedAt ?? 0) + 1);
  }
  state[store] = {};
}

/** 用本机数据整体覆盖服务器某个 store（一键“本机覆盖电脑”用） */
function replaceStore(store, records, now) {
  const incoming = new Map();
  for (const r of records) {
    const key = keyOf[store](r);
    if (key) incoming.set(key, r);
  }
  for (const [key, rec] of Object.entries(state[store])) {
    if (!incoming.has(key)) {
      state.tombstones[store][key] = Math.max(state.tombstones[store][key] ?? 0, now, (rec.updatedAt ?? 0) + 1);
    }
  }
  state[store] = {};
  for (const [key, rec] of incoming) {
    rec.updatedAt ??= now;
    state[store][key] = rec;
    delete state.tombstones[store][key];
  }
}

/** 拉取 since 之后的所有变更（含删除标记） */
function pullChanges(since) {
  const changes = { srs: [], attempts: [], plan: [], settings: [] };
  for (const store of STORES) {
    for (const rec of Object.values(state[store])) {
      if ((rec.updatedAt ?? 0) > since) changes[store].push(rec);
    }
    for (const [key, ts] of Object.entries(state.tombstones[store])) {
      if (ts > since) {
        changes[store].push(store === 'srs' ? { wordId: key, deleted: true, updatedAt: ts } : { id: key, deleted: true, updatedAt: ts });
      }
    }
  }
  return changes;
}

// ---------- HTTP ----------

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
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => {
      data += c;
      if (data.length > 50 * 1024 * 1024) reject(new Error('body too large'));
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
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
    res.writeHead(403); return res.end('Forbidden');
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
    // SPA 兜底：未知路径回 index.html（应用使用 HashRouter，正常不会走到）
    if (req.headers.accept?.includes('text/html')) {
      fs.readFile(path.join(DIST_DIR, 'index.html'), (e2, buf) => {
        if (e2) { res.writeHead(404); return res.end('Not Found'); }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(buf);
      });
      return;
    }
    res.writeHead(404); res.end('Not Found');
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  // CORS 预检
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  // ---- 同步 API ----
  if (pathname.startsWith('/api/sync/')) {
    try {
      if (pathname === '/api/sync/info' && req.method === 'GET') {
        const total = STORES.reduce((n, s) => n + Object.keys(state[s]).length, 0);
        console.log(`[同步] ${new Date().toLocaleTimeString()} 状态查询 (数据 ${total} 条)`);
        return sendJson(res, 200, {
          ok: true,
          serverTime: Date.now(),
          app: 'degree-english',
          dataCount: total,
          addresses: lanAddresses(),
        });
      }

      if ((pathname === '/api/sync/pull' || pathname === '/api/sync/push') && req.method === 'POST') {
        let body;
        try {
          body = JSON.parse((await readBody(req)) || '{}');
        } catch {
          return sendJson(res, 400, { ok: false, error: '请求格式错误' });
        }

        const deviceId = String(body.deviceId || 'unknown');
        state.devices[deviceId] = { lastSeen: Date.now() };
        const keys = Object.keys(state.devices);
        if (keys.length > 50) {
          for (const k of keys.slice(0, keys.length - 50)) delete state.devices[k];
        }
        const now = Date.now();

        if (pathname === '/api/sync/pull') {
          const since = Number.isFinite(body.since) ? Number(body.since) : 0;
          const changes = pullChanges(since);
          console.log(`[同步] ${new Date().toLocaleTimeString()} 拉取 ${deviceId.slice(0, 8)} since=${since} 变更 ${Object.values(changes).reduce((n, a) => n + a.length, 0)} 条`);
          save();
          return sendJson(res, 200, { ok: true, serverNow: now, changes });
        }

        // push
        const records = body.records || {};
        if (body.clearAll) {
          for (const s of STORES) clearStore(s, now);
          console.log(`[同步] ${new Date().toLocaleTimeString()} ${deviceId.slice(0, 8)} 清空全部数据`);
        } else if (body.replace) {
          for (const s of STORES) {
            if (Array.isArray(records[s])) replaceStore(s, records[s], now);
          }
          console.log(`[同步] ${new Date().toLocaleTimeString()} ${deviceId.slice(0, 8)} 用本机数据覆盖服务器`);
        } else {
          for (const s of STORES) {
            if (Array.isArray(records[s])) {
              for (const rec of records[s]) mergeRecord(s, rec, now);
            }
          }
          const pushed = Object.values(records).reduce((n, a) => n + (Array.isArray(a) ? a.length : 0), 0);
          console.log(`[同步] ${new Date().toLocaleTimeString()} ${deviceId.slice(0, 8)} 推送 ${pushed} 条`);
        }
        save();
        return sendJson(res, 200, { ok: true, serverNow: now });
      }

      return sendJson(res, 404, { ok: false, error: '接口不存在' });
    } catch (e) {
      console.error('[同步] 处理失败:', e);
      return sendJson(res, 500, { ok: false, error: '服务器内部错误' });
    }
  }

  // ---- 静态文件（应用本体）----
  if (req.method === 'GET' || req.method === 'HEAD') {
    return serveStatic(req, res, pathname);
  }
  res.writeHead(405); res.end('Method Not Allowed');
});

function lanAddresses() {
  const out = [];
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal && !net.address.startsWith('169.254.')) {
        out.push(net.address);
      }
    }
  }
  return out;
}

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.log('==========================================');
    console.log('  端口 4173 已被占用：服务器似乎已经在运行了。');
    console.log('  请直接使用（浏览器访问 http://localhost:4173），');
    console.log('  或先关闭旧的《启动学习助手》窗口再重新启动。');
    console.log('==========================================');
    process.exit(0);
  }
  throw e;
});

server.listen(PORT, HOST, () => {
  console.log('==========================================');
  console.log('  学位英语备考助手 - 局域网服务器已启动');
  console.log(`  电脑访问:   http://localhost:${PORT}`);
  const ips = lanAddresses();
  for (const ip of ips) {
    console.log(`  手机访问:   http://${ip}:${PORT}  (手机需连同一 Wi-Fi)`);
  }
  if (ips.length === 0) console.log('  (未检测到局域网地址，请检查网络连接)');
  console.log(`  同步数据:   ${DATA_FILE}`);
  console.log('  按 Ctrl+C 停止服务器（学习数据已自动保存）');
  console.log('==========================================');
});
