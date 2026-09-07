import { create } from 'zustand';
import type { ReviewGrade, SrsState } from '../types';
import { getDb, putRecord } from '../db/db';
import { getDueWords, getNewWords, srsNextState, todayStamp } from '../lib/srs';

interface SrsStore {
  states: Record<string, SrsState>;
  loaded: boolean;
  load: () => Promise<void>;
  getState: (wordId: string) => SrsState | undefined;
  /** 复习反馈：again=不认识；hard/good/easy 由认识反应时间推断 */
  review: (wordId: string, grade: ReviewGrade, responseMs?: number) => Promise<void>;
  /** 标记单词已学（记一次"认识"） */
  markLearned: (wordId: string) => Promise<void>;
  /** 切换「重点记忆」标记（没记住、需重点复习的单词） */
  toggleMark: (wordId: string) => Promise<void>;
  /** 统计 */
  stats: () => { learned: number; due: number; newWords: number; levelCounts: number[] };
  resetAll: () => Promise<void>;
}

const EMPTY_STATE = (wordId: string): SrsState => ({
  wordId, level: 0, interval: 0, due: 0, wrongCount: 0, reviewCount: 0, lastReview: 0, marked: false,
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

  review: async (wordId, grade, responseMs) => {
    const prev = get().states[wordId] ?? EMPTY_STATE(wordId);
    const next = srsNextState(prev, grade, Date.now(), responseMs);
    await putRecord('srs', next);
    set({ states: { ...get().states, [wordId]: next } });
  },

  markLearned: async (wordId) => {
    const prev = get().states[wordId] ?? EMPTY_STATE(wordId);
    if (prev.level >= 1) return;
    const next: SrsState = { ...prev, level: 1, interval: 1, due: Date.now() + 86400000, lastReview: Date.now(), learnedAt: prev.learnedAt ?? Date.now() };
    await putRecord('srs', next);
    set({ states: { ...get().states, [wordId]: next } });
  },

  toggleMark: async (wordId) => {
    const prev = get().states[wordId] ?? EMPTY_STATE(wordId);
    const next: SrsState = { ...prev, marked: !prev.marked };
    await putRecord('srs', next);
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

export { todayStamp };
