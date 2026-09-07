import type { ReviewGrade, SrsState } from '../types';

const DAY_MS = 86400000;
const AGAIN_DELAY_MS = 10 * 60000;
const EASY_RESPONSE_MS = 5000;
const HARD_RESPONSE_MS = 15000;
const AUTO_MARK_UNKNOWN_STREAK = 3;
const AUTO_UNMARK_FAST_KNOWN_STREAK = 6;

export interface DailyNewWordsPlan {
  base: number;
  recommended: number;
  pressure: 'light' | 'normal' | 'heavy' | 'overload';
  reason: string;
}

export interface WordLearningStats {
  learned: number;
  due: number;
  marked: number;
  mature: number;
  repeatedWrong: number;
  slowRecall: number;
  fragile: number;
  averageResponseMs: number | null;
}

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

/** 只保留「认识」按钮时，用反应时间推断熟练度。 */
export function inferRecognitionGrade(responseMs: number): ReviewGrade {
  if (responseMs <= EASY_RESPONSE_MS) return 'easy';
  if (responseMs <= HARD_RESPONSE_MS) return 'good';
  return 'hard';
}

export function isRememberedGrade(grade: ReviewGrade): boolean {
  return grade !== 'again';
}

export function srsNextState(prev: SrsState, grade: ReviewGrade, now: number, responseMs?: number): SrsState {
  const remembered = isRememberedGrade(grade);
  const consecutiveUnknown = remembered ? 0 : (prev.consecutiveUnknown ?? 0) + 1;
  const fastKnown = remembered && responseMs !== undefined && responseMs <= EASY_RESPONSE_MS;
  const consecutiveFastKnown = fastKnown ? (prev.consecutiveFastKnown ?? 0) + 1 : 0;
  const marked = consecutiveUnknown >= AUTO_MARK_UNKNOWN_STREAK
    ? true
    : consecutiveFastKnown >= AUTO_UNMARK_FAST_KNOWN_STREAK
      ? false
      : !!prev.marked;
  const nextLevel =
    grade === 'easy'
      ? Math.min(5, prev.level + 2)
      : grade === 'good'
        ? Math.min(5, prev.level + 1)
        : grade === 'hard'
          ? Math.max(1, prev.level)
          : Math.max(0, prev.level - 2);
  const interval = remembered ? srsInterval(nextLevel) : 0;
  const reviewCount = prev.reviewCount + 1;
  const averageResponseMs = responseMs === undefined
    ? prev.averageResponseMs
    : Math.round(((prev.averageResponseMs ?? responseMs) * prev.reviewCount + responseMs) / reviewCount);

  return {
    ...prev,
    level: nextLevel,
    interval,
    due: remembered ? now + interval * DAY_MS : now + AGAIN_DELAY_MS,
    wrongCount: remembered ? prev.wrongCount : prev.wrongCount + 1,
    reviewCount,
    consecutiveCorrect: remembered ? (prev.consecutiveCorrect ?? 0) + 1 : 0,
    consecutiveUnknown,
    consecutiveFastKnown,
    lapseCount: remembered ? (prev.lapseCount ?? 0) : (prev.lapseCount ?? 0) + (prev.level >= 1 ? 1 : 0),
    marked,
    lastGrade: grade,
    lastResponseMs: responseMs,
    averageResponseMs,
    lastReview: now,
    learnedAt: remembered && prev.level === 0 ? (prev.learnedAt ?? now) : prev.learnedAt,
  };
}

/** 按复习压力动态调整今日新词数；不修改用户设置，只影响今日实际队列。 */
export function dailyNewWordsPlan(baseGoal: number, dueCount: number): DailyNewWordsPlan {
  const base = Math.max(1, Math.min(100, Math.round(baseGoal || 30)));
  if (dueCount >= 80) {
    return { base, recommended: 0, pressure: 'overload', reason: '到期词太多，今天优先清复习债' };
  }
  if (dueCount >= 30) {
    return { base, recommended: Math.max(5, Math.ceil(base * 0.5)), pressure: 'heavy', reason: '复习压力偏高，新词自动减半' };
  }
  if (dueCount >= 15) {
    return { base, recommended: Math.max(5, Math.ceil(base * 0.75)), pressure: 'normal', reason: '有一定复习压力，新词略微减少' };
  }
  return { base, recommended: base, pressure: 'light', reason: '复习压力较轻，按原计划学习新词' };
}

export function summarizeWordLearning(states: SrsState[]): WordLearningStats {
  const now = Date.now();
  const learned = states.filter(s => s.level >= 1);
  const responseStates = states.filter(s => Number.isFinite(s.averageResponseMs));
  const averageResponseMs = responseStates.length
    ? Math.round(responseStates.reduce((sum, s) => sum + (s.averageResponseMs ?? 0), 0) / responseStates.length)
    : null;

  return {
    learned: learned.length,
    due: learned.filter(s => s.due <= now).length,
    marked: states.filter(s => s.marked).length,
    mature: learned.filter(s => s.level >= 3).length,
    repeatedWrong: learned.filter(s => s.wrongCount >= 2 || (s.lapseCount ?? 0) >= 1).length,
    slowRecall: learned.filter(s => s.lastGrade === 'hard' || (s.averageResponseMs ?? 0) > HARD_RESPONSE_MS).length,
    fragile: learned.filter(s => s.level < 3 || s.lastGrade === 'hard' || s.wrongCount > 0).length,
    averageResponseMs,
  };
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
