import { describe, it, expect } from 'vitest'
import type { SrsState, Word } from '../src/types'
import { buildTodayBatch } from '../src/lib/studyBatch'

function word(id: string): Word {
  return { id, spelling: id, meanings: [id], examples: [], tier: 1 }
}
function st(over: Partial<SrsState> = {}): SrsState {
  return { wordId: 'w', level: 0, interval: 0, due: 0, wrongCount: 0, reviewCount: 0, lastReview: 0, ...over }
}

const TODAY = '2026-08-16'
const todayTs = new Date(2026, 7, 16, 10, 0, 0).getTime()
const yesterdayTs = new Date(2026, 7, 15, 10, 0, 0).getTime()

// 40 个词，词序即固定随机序
const WORDS = Array.from({ length: 40 }, (_, i) => word('w' + (i + 1)))
const ORDER = new Map(WORDS.map((w, i) => [w.id, i]))

function statesOf(map: Record<string, Partial<SrsState>>): Record<string, SrsState> {
  const out: Record<string, SrsState> = {}
  for (const [id, patch] of Object.entries(map)) out[id] = st({ wordId: id, ...patch })
  return out
}

describe('今日新词批次', () => {
  it('学 10 个后重进：批次不变，剩余 20 个且计数从 11 继续', () => {
    const states = statesOf({})
    for (let i = 1; i <= 10; i++) {
      states['w' + i] = st({ wordId: 'w' + i, level: 1, learnedAt: todayTs, lastReview: todayTs })
    }
    const r = buildTodayBatch(WORDS, states, ORDER, 30, TODAY)
    expect(r.batch.length).toBe(30)
    expect(r.done).toBe(10)
    expect(r.remaining.map(w => w.id)).toEqual(Array.from({ length: 20 }, (_, i) => 'w' + (i + 11)))
  })

  it('今日 30 个学完：剩余 0（已完成）', () => {
    const states = statesOf({})
    for (let i = 1; i <= 30; i++) {
      states['w' + i] = st({ wordId: 'w' + i, level: 1, learnedAt: todayTs, lastReview: todayTs })
    }
    const r = buildTodayBatch(WORDS, states, ORDER, 30, TODAY)
    expect(r.batch.length).toBe(30)
    expect(r.done).toBe(30)
    expect(r.remaining.length).toBe(0)
  })

  it('今天复习昨天的词不占今日新词名额', () => {
    const states = statesOf({
      w1: { level: 2, learnedAt: yesterdayTs, lastReview: todayTs }, // 昨天学的，今天复习
    })
    const r = buildTodayBatch(WORDS, states, ORDER, 30, TODAY)
    expect(r.done).toBe(0)
    expect(r.batch.length).toBe(30)
    expect(r.batch[0].id).toBe('w2') // 从 w2 开始，w1 不进今日批次
  })

  it('答“不认识”的词不算学完，仍留在剩余里', () => {
    const states = statesOf({
      w1: { level: 1, learnedAt: todayTs, lastReview: todayTs },
      w2: { level: 0, lastReview: todayTs }, // 今天答错过，仍未学
    })
    const r = buildTodayBatch(WORDS, states, ORDER, 30, TODAY)
    expect(r.done).toBe(1)
    expect(r.remaining.map(w => w.id)).toEqual(Array.from({ length: 29 }, (_, i) => 'w' + (i + 2)))
  })

  it('每日目标可调整：goal=50 时批次变大', () => {
    const states = statesOf({ w1: { level: 1, learnedAt: todayTs, lastReview: todayTs } })
    const r = buildTodayBatch(WORDS, states, ORDER, 50, TODAY)
    expect(r.batch.length).toBe(40) // 词库只有 40 个
    expect(r.done).toBe(1)
  })

  it('同一数据多次计算批次完全一致（确定性）', () => {
    const states = statesOf({ w1: { level: 1, learnedAt: todayTs, lastReview: todayTs } })
    const a = buildTodayBatch(WORDS, states, ORDER, 30, TODAY)
    const b = buildTodayBatch(WORDS, states, ORDER, 30, TODAY)
    expect(a.batch.map(w => w.id)).toEqual(b.batch.map(w => w.id))
  })
})
