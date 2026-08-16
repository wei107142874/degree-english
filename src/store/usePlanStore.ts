import { create } from 'zustand';
import type { StudyPlan } from '../types';
import { getDb, putRecord } from '../db/db';
import { generatePlan } from '../lib/planner';

interface PlanStore {
  plan: StudyPlan | null;
  loaded: boolean;
  load: () => Promise<void>;
  create: (examDate: string, dailyNewWords: number, mode?: 'standard' | 'sprint') => Promise<void>;
  toggleToday: () => Promise<void>;
  resetAll: () => Promise<void>;
}

export const usePlanStore = create<PlanStore>((set, get) => ({
  plan: null,
  loaded: false,

  load: async () => {
    const db = await getDb();
    const plans = await db.getAll('plan');
    const plan = plans.sort((a, b) => (a.startDate < b.startDate ? 1 : -1))[0] ?? null;
    set({ plan, loaded: true });
  },

  create: async (examDate, dailyNewWords, mode = 'standard') => {
    const plan = generatePlan(examDate, dailyNewWords, mode);
    await putRecord('plan', plan);
    set({ plan });
  },

  toggleToday: async () => {
    const { plan } = get();
    if (!plan) return;
    const t = new Date();
    const stamp = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
    const updated: StudyPlan = {
      ...plan,
      tasks: plan.tasks.map(tk => tk.date === stamp ? { ...tk, done: !tk.done, doneTs: Date.now() } : tk),
    };
    await putRecord('plan', updated);
    set({ plan: updated });
  },

  resetAll: async () => {
    const db = await getDb();
    await db.clear('plan');
    set({ plan: null });
  },
}));
