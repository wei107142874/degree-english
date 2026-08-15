import { create } from 'zustand';
import type { Settings, ExamSectionConfig } from '../types';
import { getDb } from '../db/db';
import { DEFAULT_SECTION_CONFIG } from '../lib/examConfig';

const DEFAULT_SETTINGS: Settings = {
  id: 'main',
  dailyNewWords: 40,
  examDate: null,
  mockSectionConfig: DEFAULT_SECTION_CONFIG,
};

interface SettingsStore {
  settings: Settings;
  loaded: boolean;
  load: () => Promise<void>;
  update: (patch: Partial<Settings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  loaded: false,

  load: async () => {
    const db = await getDb();
    const rows = await db.getAll('settings');
    const row = rows[0];
    set({ settings: row ? { ...DEFAULT_SETTINGS, ...row } : DEFAULT_SETTINGS, loaded: true });
  },

  update: async (patch) => {
    const next = { ...get().settings, ...patch };
    const db = await getDb();
    await db.put('settings', next);
    set({ settings: next });
  },
}));

export type { ExamSectionConfig };
