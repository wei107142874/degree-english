import type { Word } from '../../types';
import { tier1Words } from './tier1';

// 后续档位：tier2/tier3 在 M6 补充
export const ALL_WORDS: Word[] = [...tier1Words];

export const TIER_LABELS: Record<number, string> = {
  1: '核心高频',
  2: '进阶',
  3: '认知',
};

export function findWord(id: string): Word | undefined {
  return ALL_WORDS.find(w => w.id === id);
}

export function searchWords(q: string, tier: number | null, words: Word[] = ALL_WORDS): Word[] {
  const s = q.trim().toLowerCase();
  if (!s && !tier) return words;
  return words.filter(w => {
    if (tier && w.tier !== tier) return false;
    if (!s) return true;
    return (
      w.spelling.toLowerCase().includes(s) ||
      w.meanings.some(m => m.includes(s))
    );
  });
}
