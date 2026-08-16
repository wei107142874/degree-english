// ============================================================
// 固定随机词序
// ------------------------------------------------------------
// 需求：全局打乱一次并固定，之后按此顺序每天学 N 个新词；
//       顺序在所有设备上保持一致（手机 = 电脑）。
// 方案：用「固定种子 + 种子化随机数」做确定性洗牌 —— 只要种子
//       相同，任何设备算出的顺序都完全一样，无需联网同步顺序本身。
//       种子持久化在设置里（IndexedDB + 局域网同步 + 备份均覆盖），
//       将来若想重新洗牌，改种子即可。
// ============================================================

import type { Word } from '../types';

/** FNV-1a 32 位字符串哈希（确定性） */
function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32 种子化伪随机数发生器（确定性） */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 种子化 Fisher-Yates 洗牌：同一种子永远得到同一个"随机"顺序。
 * 不改动原数组。
 */
export function seededShuffle<T>(arr: readonly T[], seed: string): T[] {
  const a = [...arr];
  const rand = mulberry32(hashString(seed));
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const t = a[i];
    a[i] = a[j];
    a[j] = t;
  }
  return a;
}

/** 默认种子：所有设备默认得到完全一致的词序（v1 固定，勿改） */
export const WORD_ORDER_SEED = 'degree-english-v1';

/** 按种子生成词序索引：wordId -> 全局位置（0 开始，越小越先学） */
export function buildOrderIndex(words: readonly Word[], seed: string): Map<string, number> {
  const ordered = seededShuffle(words.map(w => w.id), seed);
  const map = new Map<string, number>();
  ordered.forEach((id, i) => map.set(id, i));
  return map;
}
