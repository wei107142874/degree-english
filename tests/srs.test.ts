import { describe, it, expect } from 'vitest'
import { srsInterval, getDueWords, getNewWords, masteryRate } from '../src/lib/srs'
import type { SrsState } from '../src/types'

function state(over: Partial<SrsState> = {}): SrsState {
  return { wordId: 'w', level: 1, interval: 1, due: 0, wrongCount: 0, reviewCount: 0, lastReview: 0, ...over }
}

describe('SRS 间隔', () => {
  it('等级对应间隔 1,2,4,7,15,30 天', () => {
    expect(srsInterval(1)).toBe(1)
    expect(srsInterval(2)).toBe(2)
    expect(srsInterval(3)).toBe(4)
    expect(srsInterval(4)).toBe(7)
    expect(srsInterval(5)).toBe(15)
    expect(srsInterval(6)).toBe(30)
  })
  it('等级 0 或负数回退到 1 天', () => {
    expect(srsInterval(0)).toBe(1)
  })
})

describe('到期复习', () => {
  it('只返回已学且到期的词', () => {
    const now = Date.now()
    const due = state({ wordId: 'a', due: now - 1000 })
    const notDue = state({ wordId: 'b', due: now + 100000 })
    const notLearned = state({ wordId: 'c', level: 0, due: 0 })
    expect(getDueWords([due, notDue, notLearned]).map(s => s.wordId)).toEqual(['a'])
  })
})

describe('新词', () => {
  it('返回前 n 个未学词', () => {
    const s1 = state({ wordId: 'a', level: 0 })
    const s2 = state({ wordId: 'b', level: 0 })
    const s3 = state({ wordId: 'c', level: 2 })
    expect(getNewWords([s1, s2, s3], 2, 1).map(s => s.wordId)).toEqual(['a'])
  })
})

describe('掌握度', () => {
  it('等级>=3 的比例', () => {
    const s1 = state({ wordId: 'a', level: 3 })
    const s2 = state({ wordId: 'b', level: 1 })
    const s3 = state({ wordId: 'c', level: 0 })
    expect(masteryRate([s1, s2, s3])).toBe(0.5)
  })
  it('没有已学词时返回 0', () => {
    expect(masteryRate([])).toBe(0)
  })
})
