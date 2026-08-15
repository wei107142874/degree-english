import { openDB, type IDBPDatabase } from 'idb';
import type { SrsState, Attempt, StudyPlan, Settings } from '../types';

const DB_NAME = 'degree-english-db';
const DB_VERSION = 1;

export interface DbSchema {
  srs: { key: string; value: SrsState };
  attempts: { key: string; value: Attempt };
  plan: { key: string; value: StudyPlan };
  settings: { key: string; value: Settings };
}

let dbPromise: Promise<IDBPDatabase<DbSchema>> | null = null;

export function getDb(): Promise<IDBPDatabase<DbSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<DbSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('srs')) {
          db.createObjectStore('srs', { keyPath: 'wordId' });
        }
        if (!db.objectStoreNames.contains('attempts')) {
          const s = db.createObjectStore('attempts', { keyPath: 'id' });
          s.createIndex('by-question', 'questionId');
          s.createIndex('by-ts', 'ts');
        }
        if (!db.objectStoreNames.contains('plan')) {
          db.createObjectStore('plan', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }
      }
    });
  }
  return dbPromise;
}

// 通用读写辅助
export async function putAll<T extends { id: string }>(store: string, items: T[]) {
  const db = await getDb();
  const tx = db.transaction(store, 'readwrite');
  await Promise.all(items.map(i => tx.store.put(i)));
  await tx.done;
}

export async function getAll<T>(store: string): Promise<T[]> {
  const db = await getDb();
  return (await db.getAll(store)) as T[];
}

export async function clearStore(store: string) {
  const db = await getDb();
  await db.clear(store);
}

// 导出全部用户数据（备份）
export async function exportAll() {
  const [srs, attempts, plans, settings] = await Promise.all([
    getAll<any>('srs'),
    getAll<any>('attempts'),
    getAll<any>('plan'),
    getAll<any>('settings'),
  ]);
  return { version: 1, exportedAt: Date.now(), srs, attempts, plans, settings };
}

// 导入备份（覆盖）
export async function importAll(data: Awaited<ReturnType<typeof exportAll>>) {
  const db = await getDb();
  const tx = db.transaction(['srs', 'attempts', 'plan', 'settings'], 'readwrite');
  await Promise.all([
    ...data.srs.map(i => tx.objectStore('srs').put(i)),
    ...data.attempts.map(i => tx.objectStore('attempts').put(i)),
    ...data.plans.map(i => tx.objectStore('plan').put(i)),
    ...data.settings.map(i => tx.objectStore('settings').put(i)),
  ]);
  await tx.done;
}
