import type { SrsState, Attempt, StudyPlan, Settings } from '../types';
import { now } from '../sync/clock';

export interface DbSchema {
  srs: { key: string; value: SrsState };
  attempts: { key: string; value: Attempt };
  plan: { key: string; value: StudyPlan };
  settings: { key: string; value: Settings };
}

type StoreName = keyof DbSchema;
const DEFAULT_USER_ID = '魏勇';
const LEGACY_USER_ID = 'main';
const USER_STORAGE_KEY = 'degree-english-user-id';

type RemoteDb = {
  getAll: (store: StoreName | string) => Promise<any[]>;
  put: <T extends { updatedAt?: number }>(store: StoreName | string, record: T) => Promise<void>;
  clear: (store: StoreName | string) => Promise<void>;
  delete: (store: StoreName | string, key: string) => Promise<void>;
};

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export function cleanUserId(value: string | null | undefined): string {
  const id = String(value || '').trim();
  return id && id.length <= 40 ? id : DEFAULT_USER_ID;
}

export function getCurrentUserId(): string {
  try {
    const id = cleanUserId(localStorage.getItem(USER_STORAGE_KEY));
    if (id === LEGACY_USER_ID) {
      localStorage.setItem(USER_STORAGE_KEY, DEFAULT_USER_ID);
      return DEFAULT_USER_ID;
    }
    return id;
  } catch {
    return DEFAULT_USER_ID;
  }
}

export function setCurrentUserId(userId: string) {
  const next = cleanUserId(userId);
  localStorage.setItem(USER_STORAGE_KEY, next);
  window.dispatchEvent(new CustomEvent('degree-english-user-change', { detail: next }));
}

export function withCurrentUser(url: string): string {
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}user=${encodeURIComponent(getCurrentUserId())}`;
}

function storeUrl(store: StoreName | string, key?: string) {
  return withCurrentUser(`/api/db/${encodeURIComponent(store)}${key ? '/' + encodeURIComponent(key) : ''}`);
}

const remoteDb: RemoteDb = {
  async getAll(store) {
    const data = await fetchJson<{ ok: boolean; records: any[] }>(storeUrl(store));
    return data.records;
  },
  async put(store, record) {
    await fetchJson(storeUrl(store), {
      method: 'PUT',
      body: JSON.stringify({ record }),
    });
  },
  async clear(store) {
    await fetchJson(storeUrl(store), { method: 'DELETE' });
  },
  async delete(store, key) {
    await fetchJson(storeUrl(store, key), { method: 'DELETE' });
  },
};

export function getDb(): Promise<RemoteDb> {
  return Promise.resolve(remoteDb);
}

export async function putAll<T extends { id: string; updatedAt?: number }>(store: StoreName | string, items: T[]) {
  await fetchJson(storeUrl(store), {
    method: 'PUT',
    body: JSON.stringify({ records: items.map(stamp) }),
  });
}

export async function getAll<T>(store: StoreName | string): Promise<T[]> {
  const db = await getDb();
  return db.getAll(store) as Promise<T[]>;
}

export async function clearStore(store: StoreName | string) {
  const db = await getDb();
  await db.clear(store);
}

export async function deleteRecord(store: StoreName | string, key: string) {
  const db = await getDb();
  await db.delete(store, key);
}

export function stamp<T extends { updatedAt?: number }>(record: T): T {
  return { ...record, updatedAt: now() };
}

export async function putRecord<T extends { updatedAt?: number }>(store: StoreName | string, record: T) {
  const db = await getDb();
  await db.put(store, stamp(record));
}

export async function exportAll() {
  const [srs, attempts, plans, settings] = await Promise.all([
    getAll<any>('srs'),
    getAll<any>('attempts'),
    getAll<any>('plan'),
    getAll<any>('settings'),
  ]);
  return { version: 2, exportedAt: Date.now(), srs, attempts, plans, settings };
}

export async function importAll(data: Awaited<ReturnType<typeof exportAll>>) {
  await fetchJson(withCurrentUser('/api/db/import'), {
    method: 'POST',
    body: JSON.stringify({
      records: {
        srs: data.srs || [],
        attempts: data.attempts || [],
        plan: data.plans || [],
        settings: data.settings || [],
      },
    }),
  });
}

export interface DbUser {
  id: string;
  records: number;
  updatedAt: number;
}

export async function listUsers(): Promise<DbUser[]> {
  const data = await fetchJson<{ ok: boolean; users: DbUser[] }>(withCurrentUser('/api/db/users'));
  return data.users;
}

export async function createUser(userId: string): Promise<DbUser> {
  const res = await fetch(withCurrentUser('/api/db/users'), {
    method: 'POST',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (res.status === 409) throw new Error('user exists');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json() as { ok: boolean; user: DbUser };
  return data.user;
}

export async function copyUserData(fromUserId: string, toUserId = getCurrentUserId()) {
  await fetchJson(withCurrentUser('/api/db/copy-user'), {
    method: 'POST',
    body: JSON.stringify({ fromUserId, toUserId }),
  });
}
