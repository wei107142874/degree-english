import { describe, it, expect } from 'vitest'
import { scoreExam } from '../src/lib/scoring'
import { DEFAULT_SECTION_CONFIG } from '../src/lib/examConfig'
import type { Question } from '../src/types'

function q(id: string, section: Question['section']): Question {
  return { id, section, prompt: 'p', answer: '0', explanation: 'e', source: 'builtin' }
}

describe('评分器', () => {
  it('全对得满分', () => {
    const questions = [
      q('a', 'vocabGrammar'), q('b', 'vocabGrammar'),
      q('c', 'reading'), q('d', 'reading'),
    ]
    const config = [
      { section: 'vocabGrammar' as const, count: 2, points: 1, title: 'VG' },
      { section: 'reading' as const, count: 2, points: 1.5, title: 'RD' },
    ]
    const answers = {
      a: { userAnswer: '0', correct: true },
      b: { userAnswer: '0', correct: true },
      c: { userAnswer: '0', correct: true },
      d: { userAnswer: '0', correct: true },
    }
    const r = scoreExam(answers, questions, config, 600)
    expect(r.totalScore).toBe(5)
    expect(r.maxScore).toBe(5)
    expect(r.correctRate).toBe(1)
  })
  it('部分正确按分值累计', () => {
    const questions = [q('a', 'vocabGrammar'), q('b', 'vocabGrammar')]
    const config = [{ section: 'vocabGrammar' as const, count: 2, points: 2, title: 'VG' }]
    const answers = { a: { userAnswer: '1', correct: false }, b: { userAnswer: '0', correct: true } }
    const r = scoreExam(answers, questions, config, 300)
    expect(r.totalScore).toBe(2)
    expect(r.sections[0].correct).toBe(1)
  })
  it('默认配置总分 100', () => {
    const total = DEFAULT_SECTION_CONFIG.reduce((s, c) => s + c.count * c.points, 0)
    expect(total).toBe(100)
  })
})
