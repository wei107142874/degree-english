import { describe, it, expect } from 'vitest'
import { ALL_WORDS } from '../src/data/words'
import {
  ALL_QUESTIONS, SECTION_COUNTS, readingPassages, clozePassages,
  vocabGrammarQuestions, readingQuestions, clozeQuestions,
  translationENQuestions, translationCNQuestions, essayQuestions,
} from '../src/data/questions'
import { MOCK_EXAMS } from '../src/data/mock/exams'
import { LESSONS } from '../src/data/grammar/lessons'

describe('内容库总量', () => {
  it('词汇 >= 1500', () => {
    expect(ALL_WORDS.length).toBeGreaterThanOrEqual(1500)
  })
  it('词汇 id 唯一', () => {
    const ids = new Set(ALL_WORDS.map(w => w.id))
    expect(ids.size).toBe(ALL_WORDS.length)
  })
  it('词汇都有释义和例句', () => {
    const bad = ALL_WORDS.filter(w => w.meanings.length === 0 || w.examples.length === 0)
    expect(bad.length).toBe(0)
  })
  it('题目总量 >= 600', () => {
    expect(ALL_QUESTIONS.length).toBeGreaterThanOrEqual(600)
  })
  it('各题型题量符合预期', () => {
    expect(vocabGrammarQuestions.length).toBeGreaterThanOrEqual(250)
    expect(readingQuestions.length).toBeGreaterThanOrEqual(100)
    expect(clozeQuestions.length).toBeGreaterThanOrEqual(100)
    expect(translationENQuestions.length).toBeGreaterThanOrEqual(60)
    expect(translationCNQuestions.length).toBeGreaterThanOrEqual(60)
    expect(essayQuestions.length).toBeGreaterThanOrEqual(20)
  })
  it('阅读文章数量 >= 25，每篇 5 题', () => {
    expect(readingPassages.length).toBeGreaterThanOrEqual(25)
    for (const p of readingPassages) {
      const qs = readingQuestions.filter(q => q.passageId === p.id)
      expect(qs.length).toBe(5)
    }
  })
  it('完形 10 篇，每篇 10 空', () => {
    expect(clozePassages.length).toBeGreaterThanOrEqual(10)
    for (const p of clozePassages) {
      const qs = clozeQuestions.filter(q => q.passageId === p.id)
      expect(qs.length).toBe(10)
    }
  })
  it('题目答案都在选项范围内', () => {
    for (const q of ALL_QUESTIONS) {
      if (q.options) {
        const a = Number(q.answer)
        expect(a).toBeGreaterThanOrEqual(0)
        expect(a).toBeLessThan(q.options.length)
      }
    }
  })
  it('语法课 12 节，每节有小测', () => {
    expect(LESSONS.length).toBeGreaterThanOrEqual(12)
    for (const l of LESSONS) {
      expect(l.quiz.length).toBeGreaterThanOrEqual(3)
    }
  })
  it('模拟卷 5 套且题目可组装', () => {
    expect(MOCK_EXAMS.length).toBe(5)
    for (const m of MOCK_EXAMS) {
      expect(m.questions.length).toBeGreaterThan(50)
      const ids = new Set(m.questions.map(q => q.id))
      expect(ids.size).toBe(m.questions.length)
    }
  })
  it('SECTION_COUNTS 与汇总一致', () => {
    const total = Object.values(SECTION_COUNTS).reduce((s, n) => s + n, 0)
    expect(total).toBe(ALL_QUESTIONS.length)
  })
})
