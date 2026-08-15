import { create } from 'zustand';
import type { SrsState } from '../types';
import { getDb } from '../db/db';
import { getDueWords, getNewWords, todayStamp } from '../lib/srs';

interface SrsStore {
  states: Record<string, SrsState>;
  loaded: boolean;
  load: () => Promise<void>;
  getState: (wordId: string) => SrsState | undefined;
  /** 复习反馈：correct=true 升级，否则降级 */
  review: (wordId: string, correct: boolean) => Promise<void>;
  /** 标记单词已学（记一次"认识"） */
  markLearned: (wordId: string) => Promise<void>;
  /** 统计 */
  stats: () => { learned: number; due: number; newWords: number; levelCounts: number[] };
  resetAll: () => Promise<void>;
}

const EMPTY_STATE = (wordId: string): SrsState => ({
  wordId, level: 0, interval: 0, due: 0, wrongCount: 0, reviewCount: 0, lastReview: 0,
});

export const useSrsStore = create<SrsStore>((set, get) => ({
  states: {},
  loaded: false,

  load: async () => {
    const db = await getDb();
    const all = await db.getAll('srs');
    const map: Record<string, SrsState> = {};
    for (const s of all) map[s.wordId] = s;
    set({ states: map, loaded: true });
  },

  getState: (wordId) => get().states[wordId],

  review: async (wordId, correct) => {
    const prev = get().states[wordId] ?? EMPTY_STATE(wordId);
    const next: SrsState = {
      ...prev,
      level: correct ? Math.min(5, prev.level + 1) : Math.max(0, prev.level - 2),
      interval: correct
        ? srsInterval(prev.level + 1)
        : 0,
      due: correct
        ? Date.now() + srsInterval(prev.level + 1) * 86400000
        : Date.now() + 10 * 60000, // 模糊/错误 10 分钟后再见
      wrongCount: correct ? prev.wrongCount : prev.wrongCount + 1,
      reviewCount: prev.reviewCount + 1,
      lastReview: Date.now(),
    };
    const db = await getDb();
    await db.put('srs', next);
    set({ states: { ...get().states, [wordId]: next } });
  },

  markLearned: async (wordId) => {
    const prev = get().states[wordId] ?? EMPTY_STATE(wordId);
    if (prev.level >= 1) return;
    const next: SrsState = { ...prev, level: 1, interval: 1, due: Date.now() + 86400000, lastReview: Date.now() };
    const db = await getDb();
    await db.put('srs', next);
    set({ states: { ...get().states, [wordId]: next } });
  },

  stats: () => {
    const states = Object.values(get().states);
    const learned = states.filter(s => s.level >= 1).length;
    const due = getDueWords(states).length;
    const newWords = getNewWords(states, Object.keys(get().states).length, 999999).length;
    const levelCounts = [0, 1, 2, 3, 4, 5].map(lv => states.filter(s => s.level === lv).length);
    return { learned, due, newWords, levelCounts };
  },

  resetAll: async () => {
    const db = await getDb();
    await db.clear('srs');
    set({ states: {} });
  },
}));

// 复习间隔（天）：1, 2, 4, 7, 15, 30
function srsInterval(level: number): number {
  return [1, 2, 4, 7, 15, 30][Math.min(5, Math.max(1, level)) - 1] ?? 1;
}

export { todayStamp };
