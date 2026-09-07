import { describe, it, expect } from 'vitest'
import { srsInterval, getDueWords, getNewWords, masteryRate, badgeLevel, inferRecognitionGrade, srsNextState, dailyNewWordsPlan, summarizeWordLearning } from '../src/lib/srs'
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

describe('反应时间评分', () => {
  it('认识按钮按耗时推断：秒懂/认识/犹豫认识', () => {
    expect(inferRecognitionGrade(5000)).toBe('easy')
    expect(inferRecognitionGrade(5001)).toBe('good')
    expect(inferRecognitionGrade(15000)).toBe('good')
    expect(inferRecognitionGrade(15001)).toBe('hard')
  })

  it('不认识会降级并安排 10 分钟后再见', () => {
    const now = new Date(2026, 8, 3, 10, 0, 0).getTime()
    const next = srsNextState(state({ level: 3, due: now - 1000 }), 'again', now, 7200)
    expect(next.level).toBe(1)
    expect(next.interval).toBe(0)
    expect(next.due).toBe(now + 10 * 60000)
    expect(next.wrongCount).toBe(1)
    expect(next.consecutiveCorrect).toBe(0)
    expect(next.lapseCount).toBe(1)
    expect(next.consecutiveUnknown).toBe(1)
    expect(next.consecutiveFastKnown).toBe(0)
    expect(next.marked).toBe(false)
    expect(next.lastGrade).toBe('again')
  })

  it('连续三次不认识会自动标记为重点记忆', () => {
    const now = new Date(2026, 8, 3, 10, 0, 0).getTime()
    const first = srsNextState(state({ level: 3, marked: false }), 'again', now, 7000)
    const second = srsNextState(first, 'again', now + 1, 7000)
    const third = srsNextState(second, 'again', now + 2, 7000)

    expect(second.consecutiveUnknown).toBe(2)
    expect(second.marked).toBe(false)
    expect(third.consecutiveUnknown).toBe(3)
    expect(third.marked).toBe(true)

    const remembered = srsNextState(third, 'good', now + 3, 7000)
    expect(remembered.consecutiveUnknown).toBe(0)
    expect(remembered.marked).toBe(true)
  })

  it('连续六次 5 秒内认识会自动取消重点记忆', () => {
    const now = new Date(2026, 8, 3, 10, 0, 0).getTime()
    let next = state({ level: 3, marked: true })

    for (let i = 0; i < 5; i++) {
      next = srsNextState(next, 'easy', now + i, 5000)
      expect(next.marked).toBe(true)
    }

    next = srsNextState(next, 'easy', now + 5, 4999)
    expect(next.consecutiveFastKnown).toBe(6)
    expect(next.marked).toBe(false)
  })

  it('认识超过 5 秒不会累计自动取消重点次数', () => {
    const now = new Date(2026, 8, 3, 10, 0, 0).getTime()
    const slow = srsNextState(state({ level: 3, marked: true, consecutiveFastKnown: 5 }), 'good', now, 5001)

    expect(slow.consecutiveFastKnown).toBe(0)
    expect(slow.marked).toBe(true)
  })

  it('犹豫认识不升级，秒懂可多升一级', () => {
    const now = new Date(2026, 8, 3, 10, 0, 0).getTime()
    const hard = srsNextState(state({ level: 2, reviewCount: 2 }), 'hard', now, 16000)
    const easy = srsNextState(state({ level: 2, reviewCount: 2 }), 'easy', now, 900)
    expect(hard.level).toBe(2)
    expect(hard.interval).toBe(2)
    expect(hard.lastGrade).toBe('hard')
    expect(easy.level).toBe(4)
    expect(easy.interval).toBe(7)
    expect(easy.lastGrade).toBe('easy')
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

describe('动态每日新词', () => {
  it('复习压力低时保持原计划', () => {
    expect(dailyNewWordsPlan(30, 5)).toMatchObject({ base: 30, recommended: 30, pressure: 'light' })
  })

  it('复习压力高时减少新词，过载时先不加新词', () => {
    expect(dailyNewWordsPlan(30, 30)).toMatchObject({ recommended: 15, pressure: 'heavy' })
    expect(dailyNewWordsPlan(30, 80)).toMatchObject({ recommended: 0, pressure: 'overload' })
  })
})

describe('单词学习画像', () => {
  it('统计熟词、到期、慢反应和易忘词', () => {
    const now = Date.now()
    const stats = summarizeWordLearning([
      state({ wordId: 'a', level: 3, due: now - 1, marked: true, averageResponseMs: 1200 }),
      state({ wordId: 'b', level: 2, due: now + 1000, wrongCount: 2, averageResponseMs: 7000, lastGrade: 'hard' }),
      state({ wordId: 'c', level: 0, due: now - 1 }),
    ])
    expect(stats.learned).toBe(2)
    expect(stats.due).toBe(1)
    expect(stats.marked).toBe(1)
    expect(stats.mature).toBe(1)
    expect(stats.slowRecall).toBe(1)
    expect(stats.repeatedWrong).toBe(1)
    expect(stats.averageResponseMs).toBe(4100)
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

describe('徽章等级（无上限，指数递增）', () => {
  it('按累计正确次数分级：5/15/45/135 为边界', () => {
    expect(badgeLevel(0)).toBe(0)
    expect(badgeLevel(4)).toBe(0)
    expect(badgeLevel(5)).toBe(1)
    expect(badgeLevel(14)).toBe(1)
    expect(badgeLevel(15)).toBe(2)
    expect(badgeLevel(44)).toBe(2)
    expect(badgeLevel(45)).toBe(3)
    expect(badgeLevel(50)).toBe(3)
    expect(badgeLevel(134)).toBe(3)
    expect(badgeLevel(135)).toBe(4)
  })
  it('无上限：很高的次数也有对应等级', () => {
    expect(badgeLevel(1215)).toBe(6)
    expect(badgeLevel(100000)).toBe(10)
  })
})
