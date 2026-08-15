import { describe, it, expect } from 'vitest'
import { generatePlan, daysToExam, planProgress, todayTask } from '../src/lib/planner'

describe('计划生成器', () => {
  it('生成的天数包含考试当天且每天有新词任务', () => {
    const future = new Date(Date.now() + 60 * 86400000)
    const stamp = future.toISOString().slice(0, 10)
    const plan = generatePlan(stamp, 40)
    expect(plan.tasks.length).toBeGreaterThanOrEqual(59)
    expect(plan.tasks.length).toBeLessThanOrEqual(61)
    expect(plan.tasks[0].newWords).toBe(40)
    expect(plan.tasks.every(t => t.newWords > 0)).toBe(true)
  })
  it('任务按 3 天一轮分配语法课', () => {
    const future = new Date(Date.now() + 60 * 86400000)
    const plan = generatePlan(future.toISOString().slice(0, 10), 40)
    expect(plan.tasks[0].grammarLessonId).toBe('tense-voice')
    expect(plan.tasks[3].grammarLessonId).toBe('nonfinite')
  })
  it('最后 7 天安排模拟卷', () => {
    const future = new Date(Date.now() + 60 * 86400000)
    const plan = generatePlan(future.toISOString().slice(0, 10), 40)
    const lastWeek = plan.tasks.slice(-7)
    expect(lastWeek.some(t => t.mockExamId)).toBe(true)
  })
})

describe('距考试天数', () => {
  it('未来日期返回正数', () => {
    const d = new Date(Date.now() + 30 * 86400000)
    expect(daysToExam(d.toISOString().slice(0, 10))).toBe(30)
  })
  it('null 返回 null', () => {
    expect(daysToExam(null)).toBeNull()
  })
})

describe('计划进度', () => {
  it('统计已完成天数', () => {
    const future = new Date(Date.now() + 30 * 86400000)
    const plan = generatePlan(future.toISOString().slice(0, 10), 40)
    plan.tasks[0].done = true
    plan.tasks[1].done = true
    expect(planProgress(plan)).toEqual({ done: 2, total: 30 })
  })
  it('无计划时返回 0/0', () => {
    expect(planProgress(null)).toEqual({ done: 0, total: 0 })
  })
})

describe('今日任务', () => {
  it('找到今天的任务', () => {
    const future = new Date(Date.now() + 30 * 86400000)
    const plan = generatePlan(future.toISOString().slice(0, 10), 40)
    const t = todayTask(plan)
    expect(t).not.toBeNull()
  })
})
