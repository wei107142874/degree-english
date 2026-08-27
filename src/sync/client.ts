import { useSrsStore } from '../store/useSrsStore';
import { useAttemptStore } from '../store/useAttemptStore';
import { usePlanStore } from '../store/usePlanStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { withCurrentUser, type DbUser } from '../db/db';
import { setClockOffset } from './clock';

export interface SyncStatus {
  supported: boolean | null;
  syncing: boolean;
  lastSync: number | null;
  message: string;
}

export interface ServerInfo {
  serverTime: number;
  dataCount: number;
  addresses: string[];
  storage?: string;
  userId?: string;
  users?: DbUser[];
}

let status: SyncStatus = { supported: null, syncing: false, lastSync: null, message: '正在连接服务器...' };
let serverInfo: ServerInfo | null = null;
const subscribers = new Set<(s: SyncStatus) => void>();
const deviceId = crypto.randomUUID ? crypto.randomUUID() : 'd' + Math.random().toString(36).slice(2);

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

export function getDeviceId(): string {
  return deviceId;
}

function setStatus(patch: Partial<SyncStatus>) {
  status = { ...status, ...patch };
  subscribers.forEach(cb => cb(status));
}

async function fetchJson<T>(url: string, opts?: RequestInit, timeoutMs = 5000): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...opts,
      cache: 'no-store',
      signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', ...(opts?.headers || {}) },
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json() as T;
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

async function reloadStores() {
  await Promise.all([
    useSrsStore.getState().load(),
    useAttemptStore.getState().load(),
    usePlanStore.getState().load(),
    useSettingsStore.getState().load(),
  ]);
}

export async function probeServer(): Promise<boolean> {
  try {
    const info = await fetchJson<{ ok: boolean } & ServerInfo>(withCurrentUser('/api/sync/info'), undefined, 3000);
    if (!info.ok) return false;
    serverInfo = info;
    setClockOffset(info.serverTime - Date.now());
    return true;
  } catch {
    return false;
  }
}

export async function syncNow(): Promise<boolean> {
  if (status.syncing) return false;
  syncingStatus('正在从服务器刷新...');
  try {
    await reloadStores();
    setStatus({ supported: true, syncing: false, lastSync: Date.now(), message: `已刷新 ${fmtTime(Date.now())}` });
    return true;
  } catch (e) {
    setStatus({ supported: false, syncing: false, message: '刷新失败：' + errMsg(e) });
    return false;
  }
}

export async function syncClearAll(): Promise<boolean> {
  try {
    await fetchJson(withCurrentUser('/api/sync/push'), {
      method: 'POST',
      body: JSON.stringify({ clearAll: true }),
    });
    setStatus({ supported: true, lastSync: Date.now(), message: '服务器数据已清空' });
    return true;
  } catch {
    return false;
  }
}

let inited = false;

export function initSync() {
  if (inited) return;
  inited = true;
  void (async () => {
    const ok = await probeServer();
    if (!ok) {
      setStatus({ supported: false, syncing: false, message: '未连接到学习服务器，数据无法读取或保存。' });
      return;
    }
    setStatus({ supported: true, syncing: false, message: '已连接服务器，数据存储在服务器 PostgreSQL 中。' });
  })();
}

function syncingStatus(message: string) {
  setStatus({ syncing: true, message });
}

export { fmtTime };
