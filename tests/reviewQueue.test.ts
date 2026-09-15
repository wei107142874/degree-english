import { describe, expect, it } from 'vitest';
import { buildReviewPool } from '../src/lib/reviewQueue';
import type { SrsState, Word } from '../src/types';

function word(id: string): Word {
  return { id, spelling: id, meanings: [id], examples: [], tier: 1 };
}

function state(over: Partial<SrsState> = {}): SrsState {
  return {
    wordId: 'w',
    level: 1,
    interval: 1,
    due: Date.now() + 86400000,
    wrongCount: 0,
    reviewCount: 0,
    lastReview: 0,
    ...over,
  };
}

function sequenceRandom(values: number[]) {
  let idx = 0;
  return () => values[idx++] ?? 0;
}

describe('复习队列', () => {
  it('重点复习只取重点词，并按本轮随机结果推送', () => {
    const now = Date.now();
    const words = [word('a'), word('b'), word('c'), word('d')];
    const states = {
      a: state({ wordId: 'a', marked: true, due: now - 10 * 86400000, wrongCount: 20 }),
      b: state({ wordId: 'b', marked: true }),
      c: state({ wordId: 'c', marked: true }),
      d: state({ wordId: 'd', marked: false }),
    };

    const pool = buildReviewPool(words, states, 'marked', sequenceRandom([0, 0]));

    expect(pool.map(w => w.id)).toEqual(['b', 'c', 'a']);
  });

  it('全部复习仍按到期和薄弱优先', () => {
    const now = Date.now();
    const words = [word('a'), word('b'), word('c')];
    const states = {
      a: state({ wordId: 'a', due: now + 86400000 }),
      b: state({ wordId: 'b', due: now - 1000 }),
      c: state({ wordId: 'c', level: 0 }),
    };

    const pool = buildReviewPool(words, states, 'all', sequenceRandom([0, 0]));

    expect(pool.map(w => w.id)).toEqual(['b', 'a']);
  });
});
