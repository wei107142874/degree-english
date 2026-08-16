// ============================================================
// 今日新词批次
// ------------------------------------------------------------
// 需求：每天固定一批新词（默认 30，可按设置调整），按固定随机
//       词序学习；退出后重新进入，批次不变、进度连续显示
//       （“第 11 / 30 个”而不是重新从 1 开始）。
// 实现：批次 = 今天新学的词 ∪ 按固定词序补齐到每日目标的未学词。
//       纯函数、无持久化依赖：任何设备用相同数据都能算出同一批次。
// ============================================================

import type { SrsState, Word } from '../types';
import { dateOfTs } from './srs';

export interface TodayBatch {
  /** 今日批次全部单词（按固定随机词序） */
  batch: Word[];
  /** 今日已学新词数（learnedAt 是今天） */
  done: number;
  /** 批次中仍未学的单词（学习队列里的新词部分） */
  remaining: Word[];
}

export function buildTodayBatch(
  words: readonly Word[],
  states: Record<string, SrsState | undefined>,
  orderIndex: Map<string, number>,
  dailyGoal: number,
  today: string,
): TodayBatch {
  const isUnlearned = (w: Word) => {
    const st = states[w.id];
    return !st || st.level === 0;
  };
  const byOrder = (a: Word, b: Word) => (orderIndex.get(a.id) ?? 0) - (orderIndex.get(b.id) ?? 0);

  // 今天首次学到的词（learnedAt 日期是今天）—— 复习不算
  const learnedToday = words.filter(w => {
    const st = states[w.id];
    return !!st && st.level >= 1 && !!st.learnedAt && dateOfTs(st.learnedAt) === today;
  });

  // 未学词按固定词序补齐到每日目标
  const unlearned = words.filter(isUnlearned).sort(byOrder);
  const need = Math.max(0, dailyGoal - learnedToday.length);
  const fresh = unlearned.slice(0, need);

  const batch = [...learnedToday, ...fresh].sort(byOrder);
  return {
    batch,
    done: learnedToday.length,
    remaining: batch.filter(isUnlearned),
  };
}
