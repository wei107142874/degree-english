// ============================================================
// 局域网同步客户端
// ------------------------------------------------------------
// 电脑端用「启动学习助手.bat」启动 server.mjs 后，手机打开
// http://电脑IP:4173 访问同一个应用，本模块负责让两端的学习
// 记录双向同步：
//   - 每 5 分钟自动同步一次，打开页面/恢复联网时也会同步
//   - 同步按「记录最后修改时间 updatedAt 最新者胜」合并
//   - 设置页可手动同步 / 单方向覆盖
// 数据经 IndexedDB 落盘，与浏览器本地存储一致。
// ============================================================

import { getDb } from '../db/db';
import { useSrsStore } from '../store/useSrsStore';
import { useAttemptStore } from '../store/useAttemptStore';
import { usePlanStore } from '../store/usePlanStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { setClockOffset, now } from './clock';

// 存储名必须与 IndexedDB objectStore 名一致（见 src/db/db.ts）与 server.mjs
const STORE_NAMES = ['srs', 'attempts', 'plan', 'settings'] as const;
type StoreName = (typeof STORE_NAMES)[number];

export interface SyncRecord {
  updatedAt?: number;
  [k: string]: unknown;
}
export interface SyncChanges {
  srs: SyncRecord[];
  attempts: SyncRecord[];
  plan: SyncRecord[];
  settings: SyncRecord[];
}
export type SyncPayload = SyncChanges;

export interface SyncStatus {
  /** null=检测中 true=已连接 false=不可用 */
  supported: boolean | null;
  syncing: boolean;
  lastSync: number | null;
  message: string;
}
export interface ServerInfo {
  serverTime: number;
  dataCount: number;
  addresses: string[];
}

// ---------- 状态（供设置页展示） ----------

let status: SyncStatus = { supported: null, syncing: false, lastSync: null, message: '检测同步服务器…' };
let serverInfo: ServerInfo | null = null;
const subscribers = new Set<(s: SyncStatus) => void>();

export function getSyncStatus(): SyncStatus {
  return status;
}
export function getServerInfo(): ServerInfo | null {
  return serverInfo;
}
export function onSyncStatus(cb: (s: SyncStatus) => void): () => void {
  subscribers.add(cb);
  return () => subscribers.delete(cb);
}
function setStatus(patch: Partial<SyncStatus>) {
  status = { ...status, ...patch };
  subscribers.forEach(cb => cb(status));
}

// ---------- 工具 ----------

const LS_DEVICE = 'degree-sync:deviceId';
const LS_LAST = 'degree-sync:lastSync';

export function getDeviceId(): string {
  let id = localStorage.getItem(LS_DEVICE);
  if (!id) {
    id = (crypto.randomUUID ? crypto.randomUUID() : 'd' + Math.random().toString(36).slice(2) + Date.now().toString(36));
    localStorage.setItem(LS_DEVICE, id);
  }
  return id;
}

export function getLastSync(): number {
  const v = Number(localStorage.getItem(LS_LAST) || 0);
  return Number.isFinite(v) ? v : 0;
}
function setLastSync(ts: number) {
  localStorage.setItem(LS_LAST, String(ts));
}

async function fetchJson(url: string, opts?: RequestInit, timeoutMs = 5000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...opts,
      signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', ...(opts?.headers || {}) },
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

function errMsg(e: unknown): string {
  if (e instanceof DOMException && e.name === 'AbortError') return '连接超时';
  return e instanceof Error ? e.message : String(e);
}

function fmtTime(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getMonth() + 1}月${d.getDate()}日 ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const keyOfRecord = (store: StoreName, rec: SyncRecord): string =>
  (store === 'srs' ? rec.wordId : rec.id) as string;

// ---------- 探测服务器 ----------

export async function probeServer(): Promise<boolean> {
  try {
    const info = await fetchJson(location.origin + '/api/sync/info', undefined, 3000);
    if (info && info.ok) {
      serverInfo = info as ServerInfo;
      setClockOffset(info.serverTime - Date.now()); // 校准时钟，保证两端比较公平
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// ---------- 应用拉取到的变更（含删除标记） ----------

async function applyChanges(changes: SyncChanges) {
  const db = await getDb();
  for (const store of STORE_NAMES) {
    const list = changes[store];
    if (!list || list.length === 0) continue;
    for (const rec of list) {
      if (rec.deleted) {
        await db.delete(store, keyOfRecord(store, rec));
        continue;
      }
      const key = keyOfRecord(store, rec);
      if (!key) continue;
      const cur = (await db.get(store, key)) as SyncRecord | undefined;
      if (cur && (cur.updatedAt ?? 0) > (rec.updatedAt ?? 0)) continue; // 本地更新，保留
      await db.put(store, rec);
    }
  }
  // 重新加载内存状态
  await Promise.all([
    useSrsStore.getState().load(),
    useAttemptStore.getState().load(),
    usePlanStore.getState().load(),
    useSettingsStore.getState().load(),
  ]);
}

// ---------- 收集本机 since 之后改动过的记录 ----------

async function gatherLocal(since: number, skip: Set<string>): Promise<SyncPayload> {
  const out: SyncPayload = { srs: [], attempts: [], plan: [], settings: [] };
  const db = await getDb();
  for (const store of STORE_NAMES) {
    const all = (await db.getAll(store)) as SyncRecord[];
    for (const rec of all) {
      const key = keyOfRecord(store, rec);
      if (!key || skip.has(store + ':' + key)) continue;
      if (rec.updatedAt == null || rec.updatedAt > since) {
        if (rec.updatedAt == null) {
          rec.updatedAt = now(); // 老数据补盖时间戳（校准后的服务器时间）
          await db.put(store, rec);
        }
        out[store].push(rec);
      }
    }
  }
  return out;
}

let syncing = false;

// ---------- 双向同步（默认合并模式） ----------

export async function syncNow(): Promise<boolean> {
  if (!status.supported || syncing) return false;
  syncing = true;
  setStatus({ syncing: true, message: '正在同步…' });
  try {
    const deviceId = getDeviceId();
    const since = getLastSync();

    const pull = await fetchJson(location.origin + '/api/sync/pull', {
      method: 'POST',
      body: JSON.stringify({ deviceId, since }),
    });
    if (!pull || !pull.ok) throw new Error('拉取失败');

    // 跳过刚拉下来的记录，避免原样回传（回传也无害，但省流量）
    const skip = new Set<string>();
    for (const store of STORE_NAMES) {
      for (const rec of pull.changes?.[store] ?? []) {
        skip.add(store + ':' + keyOfRecord(store, rec));
      }
    }

    await applyChanges(pull.changes);

    const local = await gatherLocal(since, skip);
    const hasLocal = STORE_NAMES.some(s => local[s].length > 0);
    let serverNow = pull.serverNow;

    if (hasLocal) {
      const push = await fetchJson(location.origin + '/api/sync/push', {
        method: 'POST',
        body: JSON.stringify({ deviceId, records: local }),
      });
      if (!push || !push.ok) throw new Error('推送失败');
      serverNow = push.serverNow;
    }

    setLastSync(serverNow);
    setStatus({ syncing: false, lastSync: Date.now(), message: `已同步 ✅ 上次：${fmtTime(Date.now())}` });
    return true;
  } catch (e) {
    setStatus({ syncing: false, message: '同步失败：' + errMsg(e) });
    return false;
  } finally {
    syncing = false;
  }
}

// ---------- 单方向覆盖 ----------

/** 用电脑(服务器)数据覆盖本机 */
export async function syncPullOverwrite(): Promise<boolean> {
  if (!status.supported || syncing) return false;
  syncing = true;
  setStatus({ syncing: true, message: '正在用服务器数据覆盖本机…' });
  try {
    const deviceId = getDeviceId();
    const pull = await fetchJson(location.origin + '/api/sync/pull', {
      method: 'POST',
      body: JSON.stringify({ deviceId, since: 0 }),
    });
    if (!pull || !pull.ok) throw new Error('拉取失败');
    const db = await getDb();
    for (const store of STORE_NAMES) await db.clear(store);
    await applyChanges(pull.changes);
    setLastSync(pull.serverNow);
    setStatus({ syncing: false, lastSync: Date.now(), message: '已用服务器数据覆盖本机 ✅' });
    return true;
  } catch (e) {
    setStatus({ syncing: false, message: '覆盖失败：' + errMsg(e) });
    return false;
  } finally {
    syncing = false;
  }
}

/** 用本机数据覆盖服务器（其他设备下次同步会变成本机数据） */
export async function syncPushOverwrite(): Promise<boolean> {
  if (!status.supported || syncing) return false;
  syncing = true;
  setStatus({ syncing: true, message: '正在用本机数据覆盖服务器…' });
  try {
    const deviceId = getDeviceId();
    const records = await gatherLocal(0, new Set());
    const push = await fetchJson(location.origin + '/api/sync/push', {
      method: 'POST',
      body: JSON.stringify({ deviceId, records, replace: true }),
    });
    if (!push || !push.ok) throw new Error('推送失败');
    setLastSync(push.serverNow);
    setStatus({ syncing: false, lastSync: Date.now(), message: '已用本机数据覆盖服务器 ✅' });
    return true;
  } catch (e) {
    setStatus({ syncing: false, message: '覆盖失败：' + errMsg(e) });
    return false;
  } finally {
    syncing = false;
  }
}

/** 清空服务器上的全部数据（配合本机「清空全部学习数据」使用） */
export async function syncClearAll(): Promise<boolean> {
  try {
    if (!status.supported) return false;
    const deviceId = getDeviceId();
    const push = await fetchJson(location.origin + '/api/sync/push', {
      method: 'POST',
      body: JSON.stringify({ deviceId, clearAll: true }),
    });
    if (!push || !push.ok) throw new Error('清空失败');
    setLastSync(push.serverNow);
    setStatus({ lastSync: Date.now(), message: '服务器数据已清空 ✅' });
    return true;
  } catch {
    return false;
  }
}

// ---------- 初始化与自动同步 ----------

let inited = false;

export function initSync() {
  if (inited) return;
  inited = true;
  void (async () => {
    const ok = await probeServer();
    if (!ok) {
      setStatus({
        supported: false,
        message: '未检测到局域网同步服务器：当前页面不是由电脑端服务器提供的（GitHub Pages 等静态部署仅支持手动备份）',
      });
      return;
    }
    setStatus({ supported: true, message: '已连接局域网同步服务器' });
    await syncNow();
    setInterval(() => { void syncNow(); }, 5 * 60 * 1000);
    window.addEventListener('online', () => { void syncNow(); });
  })();
}

export { fmtTime };
