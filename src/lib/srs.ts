import type { SrsState } from '../types';

/** 今天的日期字符串 YYYY-MM-DD（本地时区） */
export function todayStamp(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** 明天 0 点时间戳 */
export function nextDayMs(): number {
  const d = new Date();
  d.setHours(24, 0, 0, 0);
  return d.getTime();
}

/** 复习间隔（天）按记忆等级 */
export function srsInterval(level: number): number {
  const table = [1, 2, 4, 7, 15, 30];
  const idx = Math.min(table.length - 1, Math.max(0, level - 1));
  return table[idx];
}

/** 到期待复习的词（level>=1 且 due <= now） */
export function getDueWords(states: SrsState[]): SrsState[] {
  const now = Date.now();
  return states.filter(s => s.level >= 1 && s.due <= now);
}

/** 需要今天复习的词：到期的 + 今天日期与 lastReview 同日的都算当天任务里的 */
export function getTodayDue(states: SrsState[]): SrsState[] {
  const t = todayStamp();
  const due = getDueWords(states);
  // 如果今天已经复习过、但还在队列中的，不再重复列入
  const reviewedToday = states.filter(s => s.level >= 1 && dateOfTs(s.lastReview) === t);
  const dueIds = new Set(due.map(s => s.wordId));
  const reviewedTodayIds = new Set(reviewedToday.map(s => s.wordId));
  return due.filter(s => !reviewedTodayIds.has(s.wordId) || !dueIds.has(s.wordId));
}

/** 时间戳 → 本地日期字符串 YYYY-MM-DD */
export function dateOfTs(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** 从未学过的新词（level===0），返回前 n 个 */
export function getNewWords(states: SrsState[], knownCount: number, n: number): SrsState[] {
  void knownCount;
  return states.filter(s => s.level === 0).slice(0, n);
}

/**
 * 今日已复习词数：已学（level>=1）且今天有复习动作、但并非今天首次学会的词。
 * 用 learnedAt 区分「今天新学」与「今天复习」——今天新学的词不计入复习数。
 */
export function countReviewedToday(states: SrsState[], today: string): number {
  return states.filter(s =>
    s.level >= 1 &&
    dateOfTs(s.lastReview) === today &&
    (!s.learnedAt || dateOfTs(s.learnedAt) !== today),
  ).length;
}

/** 记忆完成度：所有已学词等级 >= 3 的比例 */
export function masteryRate(states: SrsState[]): number {
  const learned = states.filter(s => s.level >= 1);
  if (learned.length === 0) return 0;
  return learned.filter(s => s.level >= 3).length / learned.length;
}

/**
 * 徽章等级：按累计正确认识次数指数级递增，无上限。
 * 门槛序列 5, 15, 45, 135, ...（每次 ×3）：
 * 1级=认识 5 次，2级=15 次，3级=45 次起（50 次已在第 3 级内），依次类推。
 * 答错不减徽章等级（复习调度仍会缩短间隔）。
 */
export function badgeLevel(correctCount: number): number {
  let level = 0;
  let threshold = 5;
  while (correctCount >= threshold) {
    level++;
    threshold *= 3;
  }
  return level;
}
