import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ALL_WORDS } from '../data/words'
import { ALL_QUESTIONS } from '../data/questions'
import { useSrsStore } from '../store/useSrsStore'
import { useAttemptStore } from '../store/useAttemptStore'
import { usePlanStore } from '../store/usePlanStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { daysToExam, todayTask } from '../lib/planner'
import { Card, ProgressBar, Stat } from '../components/common'

const SECTION_NAMES: Record<string, string> = {
  vocabGrammar: '词汇与语法', reading: '阅读理解', cloze: '完形填空',
  translationEN: '英译汉', translationCN: '汉译英', writing: '写作', quiz: '语法小测',
}

export default function Dashboard() {
  const srsStates = useSrsStore(s => s.states)
  const srsStats = useMemo(() => {
    const states = Object.values(srsStates)
    const learned = states.filter(s => s.level >= 1).length
    const due = states.filter(s => s.level >= 1 && s.due <= Date.now()).length
    return { learned, due }
  }, [srsStates])
  const due = srsStats.due
  const learned = srsStats.learned
  const attempts = useAttemptStore(s => s.attempts)
  const todayAnswered = useMemo(() => {
    const t = new Date().toDateString()
    return attempts.filter(a => new Date(a.ts).toDateString() === t).length
  }, [attempts])
  const correctRate = attempts.length ? attempts.filter(a => a.correct).length / attempts.length : 0
  const wrongCount = useMemo(() => {
    const byQ: Record<string, import('../types').Attempt[]> = {}
    for (const a of attempts) (byQ[a.questionId] ??= []).push(a)
    let n = 0
    for (const list of Object.values(byQ)) if (!list[list.length - 1].correct) n++
    return n
  }, [attempts])
  const plan = usePlanStore(s => s.plan)
  const settings = useSettingsStore(s => s.settings)

  const task = todayTask(plan)
  const days = daysToExam(settings.examDate)
  const totalQs = ALL_QUESTIONS.length
  const totalWords = ALL_WORDS.length

  // 连续打卡天数
  const streak = (() => {
    if (!plan) return 0
    let n = 0
    const done = new Set(plan.tasks.filter(t => t.done).map(t => t.date))
    const d = new Date()
    while (true) {
      const stamp = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
      if (!done.has(stamp)) break
      n++
      d.setDate(d.getDate() - 1)
    }
    return n
  })()

  const weak = useMemo(() => {
    const map: Record<string, { total: number; wrong: number }> = {}
    for (const a of attempts) {
      map[a.section] ??= { total: 0, wrong: 0 }
      map[a.section].total++
      if (!a.correct) map[a.section].wrong++
    }
    return Object.entries(map)
      .filter(([, v]) => v.total >= 3)
      .map(([section, v]) => ({ section, rate: v.wrong / v.total }))
      .sort((x, y) => y.rate - x.rate)
  }, [attempts])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">👋 今日学习</h1>
        <div className="flex gap-2 items-center">
          {streak > 0 && <div className="px-4 py-2 rounded-lg text-sm font-medium bg-orange-50 text-orange-600">🔥 连续打卡 {streak} 天</div>}
          {days !== null && (
            <div className={'px-4 py-2 rounded-lg text-sm font-medium ' + (days <= 30 ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600')}>
              📅 距考试还有 {days} 天
            </div>
          )}
        </div>
      </div>

      {/* 今日任务 */}
      <Card className="border-blue-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-slate-800">🗓️ 今日任务</h2>
          {task?.done && <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded">✅ 已完成</span>}
        </div>
        {task ? (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>📚 新词</span><span className="font-medium">{task.newWords} 个</span></div>
            <div className="flex justify-between"><span>🔁 复习</span><span className="font-medium">{due} 个（到期）</span></div>
            {task.grammarLessonId && <div className="flex justify-between"><span>📖 语法</span><span className="font-medium">1 节</span></div>}
            {task.practiceSection && <div className="flex justify-between"><span>✏️ 专项</span><span className="font-medium">{task.practiceCount} 题</span></div>}
            {task.mockExamId && <div className="flex justify-between"><span>📝 模拟</span><span className="font-medium">1 套</span></div>}
            <div className="flex gap-2 pt-2">
              <Link to="/study" className="flex-1 text-center bg-blue-600 text-white py-2.5 rounded-lg text-sm">开始背单词</Link>
              <Link to="/practice" className="flex-1 text-center border border-blue-300 text-blue-600 py-2.5 rounded-lg text-sm">专项练习</Link>
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-500">
            还没有学习计划，<Link to="/plan" className="text-blue-600 underline">去生成计划</Link>，让每天的学习有方向。
          </div>
        )}
      </Card>

      {/* 数据统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="已学单词" value={learned} hint={'/ ' + totalWords} />
        <Stat label="今日刷题" value={todayAnswered} hint={'累计 ' + attempts.length + ' 题'} />
        <Stat label="整体正确率" value={Math.round(correctRate * 100) + '%'} />
        <Stat label="错题本" value={wrongCount} />
      </div>

      {/* 进度条 */}
      <div className="grid md:grid-cols-2 gap-3">
        <Card>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-600">📚 单词进度</span>
            <span className="font-medium">{Math.round((learned / totalWords) * 100)}%</span>
          </div>
          <ProgressBar value={learned / totalWords} />
        </Card>
        <Card>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-600">✏️ 题库进度</span>
            <span className="font-medium">{attempts.length} / {totalQs} 题已做</span>
          </div>
          <ProgressBar value={attempts.length / totalQs} />
        </Card>
      </div>

      {/* 薄弱点 */}
      {weak.length > 0 && (
        <Card>
          <h2 className="font-bold text-slate-800 mb-3">🎯 薄弱题型（需加强）</h2>
          <div className="space-y-2">
            {weak.slice(0, 3).map(w => (
              <div key={w.section} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{SECTION_NAMES[w.section] ?? w.section}</span>
                <span className={'font-medium ' + (w.rate > 0.5 ? 'text-red-500' : 'text-amber-500')}>错误率 {Math.round(w.rate * 100)}%</span>
              </div>
            ))}
          </div>
          <Link to="/practice" className="text-sm text-blue-600 mt-3 inline-block">去针对性练习 →</Link>
        </Card>
      )}
    </div>
  )
}