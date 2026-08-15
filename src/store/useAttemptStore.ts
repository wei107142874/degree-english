import { create } from 'zustand';
import type { Attempt, QuestionSection } from '../types';
import { getDb } from '../db/db';

interface AttemptStore {
  attempts: Attempt[];
  loaded: boolean;
  load: () => Promise<void>;
  add: (a: Omit<Attempt, 'id' | 'ts'>) => Promise<void>;
  /** 某题的历史作答 */
  historyOf: (questionId: string) => Attempt[];
  /** 错误率最高的题型（薄弱点） */
  weakSections: () => { section: QuestionSection; rate: number }[];
  wrongQuestionIds: () => string[]; // 最近答错过、未连续答对的题
  wrongCount: () => number;
  correctRate: () => number;
  totalAnswered: () => number;
  todayAnswered: () => number;
  resetAll: () => Promise<void>;
}

export const useAttemptStore = create<AttemptStore>((set, get) => ({
  attempts: [],
  loaded: false,

  load: async () => {
    const db = await getDb();
    const all = await db.getAll('attempts');
    all.sort((a, b) => a.ts - b.ts);
    set({ attempts: all, loaded: true });
  },

  add: async (a) => {
    const attempt: Attempt = { ...a, id: crypto.randomUUID(), ts: Date.now() };
    const db = await getDb();
    await db.put('attempts', attempt);
    set({ attempts: [...get().attempts, attempt] });
  },

  historyOf: (questionId) => get().attempts.filter(a => a.questionId === questionId),

  weakSections: () => {
    const map: Record<string, { total: number; wrong: number }> = {};
    for (const a of get().attempts) {
      map[a.section] ??= { total: 0, wrong: 0 };
      map[a.section].total++;
      if (!a.correct) map[a.section].wrong++;
    }
    return Object.entries(map)
      .filter(([, v]) => v.total >= 3)
      .map(([section, v]) => ({ section: section as QuestionSection, rate: v.wrong / v.total }))
      .sort((a, b) => b.rate - a.rate);
  },

  wrongQuestionIds: () => {
    const attempts = [...get().attempts].sort((a, b) => a.ts - b.ts);
    const byQ: Record<string, Attempt[]> = {};
    for (const a of attempts) (byQ[a.questionId] ??= []).push(a);
    const wrong = new Set<string>();
    for (const [qid, list] of Object.entries(byQ)) {
      const last = list[list.length - 1];
      if (!last.correct) wrong.add(qid);
    }
    return [...wrong];
  },

  wrongCount: () => get().wrongQuestionIds().length,
  correctRate: () => {
    const all = get().attempts;
    if (all.length === 0) return 0;
    return all.filter(a => a.correct).length / all.length;
  },
  totalAnswered: () => get().attempts.length,
  todayAnswered: () => {
    const t = new Date().toDateString();
    return get().attempts.filter(a => new Date(a.ts).toDateString() === t).length;
  },

  resetAll: async () => {
    const db = await getDb();
    await db.clear('attempts');
    set({ attempts: [] });
  },
}));
