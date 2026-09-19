import type { SrsState, Word } from '../types';

export type ReviewMode = 'all' | 'marked';

type RandomSource = () => number;

export function buildReviewPool(
  words: readonly Word[],
  states: Record<string, SrsState | undefined>,
  reviewMode: ReviewMode,
  random: RandomSource = Math.random,
): Word[] {
  const learned = words.filter(w => {
    const st = states[w.id];
    return reviewMode === 'marked' ? !!st?.marked : (st?.level ?? 0) >= 1;
  });
  const shuffled = shuffle(learned, random);
  if (reviewMode === 'marked') return shuffled;
  return shuffled.sort((a, b) => reviewPriority(states[b.id]) - reviewPriority(states[a.id]));
}

export function buildDueReviewPool(
  words: readonly Word[],
  states: Record<string, SrsState | undefined>,
  random: RandomSource = Math.random,
): Word[] {
  const now = Date.now();
  const due = words.filter(w => {
    const st = states[w.id];
    return !!st && st.level >= 1 && st.due <= now;
  });
  return shuffle(due, random).sort((a, b) => reviewPriority(states[b.id]) - reviewPriority(states[a.id]));
}

export function reviewPriority(st: SrsState | undefined): number {
  if (!st) return 0;
  const now = Date.now();
  const overdueHours = st.due <= now ? (now - st.due) / 3600000 : 0;
  return (
    (st.due <= now ? 10000 : 0) +
    Math.min(2400, overdueHours) +
    (st.marked ? 1200 : 0) +
    (st.lapseCount ?? 0) * 500 +
    st.wrongCount * 120 +
    (st.lastGrade === 'hard' ? 200 : 0) -
    st.level * 20
  );
}

export function shuffle<T>(arr: readonly T[], random: RandomSource = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}
