import { useState } from 'react'
import { usePlanStore } from '../store/usePlanStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { daysToExam, planProgress } from '../lib/planner'
import { LESSONS } from '../data/grammar/lessons'
import { SECTION_LABELS } from '../data/questions'
import { Card } from '../components/common'

export default function Plan() {
  const plan = usePlanStore(s => s.plan)
  const create = usePlanStore(s => s.create)
  const toggleToday = usePlanStore(s => s.toggleToday)
  const settings = useSettingsStore(s => s.settings)
  const updateSettings = useSettingsStore(s => s.update)

  const [examDate, setExamDate] = useState(settings.examDate ?? '')
  const [daily, setDaily] = useState(settings.dailyNewWords)
  const [mode, setMode] = useState<'standard' | 'sprint'>('standard')

  const today = new Date()
  const todayStamp = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0')
  const prog = planProgress(plan)

  const doCreate = async () => {
    if (!examDate) { alert('请选择考试日期'); return }
    await create(examDate, daily, mode)
    await updateSettings({ examDate, dailyNewWords: daily })
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">🗓️ 学习计划</h1>

      <Card>
        <h2 className="font-bold text-slate-800 mb-3">{plan ? '重新生成计划' : '生成你的学习计划'}</h2>
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-slate-500 block mb-1">考试日期</label>
            <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">每日新词目标</label>
            <input type="number" min={10} max={100} value={daily} onChange={e => setDaily(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">模式</label>
            <div className="flex gap-1">
              <button onClick={() => setMode('standard')} className={'flex-1 py-2 rounded-lg text-sm ' + (mode === 'standard' ? 'bg-blue-600 text-white' : 'border border-slate-300 text-slate-600')}>标准</button>
              <button onClick={() => setMode('sprint')} className={'flex-1 py-2 rounded-lg text-sm ' + (mode === 'sprint' ? 'bg-red-600 text-white' : 'border border-slate-300 text-slate-600')}>冲刺</button>
            </div>
          </div>
        </div>
        <button onClick={doCreate} className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm">生成 / 更新计划</button>
      </Card>

      {plan && (
        <>
          <Card>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-slate-800">计划进度</h2>
              <span className="text-sm text-slate-500">{prog.done} / {prog.total} 天</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: (prog.total ? prog.done / prog.total * 100 : 0) + '%' }} />
                </div>
              </div>
              <span className="text-sm font-medium">{Math.round(prog.total ? prog.done / prog.total * 100 : 0)}%</span>
            </div>
            {daysToExam(plan.examDate) !== null && (<div className="text-sm text-slate-500 mt-2">📅 距考试 {daysToExam(plan.examDate)} 天</div>)}
          </Card>

          <Card className="border-green-200">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-800">今日打卡</h2>
              <button onClick={toggleToday} className={'px-4 py-2 rounded-lg text-sm font-medium ' + (plan.tasks.find(t => t.date === todayStamp)?.done ? 'bg-green-100 text-green-700' : 'bg-green-600 text-white hover:bg-green-700')}>
                {plan.tasks.find(t => t.date === todayStamp)?.done ? '✅ 已打卡' : '完成今日任务，打卡'}
              </button>
            </div>
          </Card>

          <Card>
            <h2 className="font-bold text-slate-800 mb-3">每日任务</h2>
            <div className="space-y-1 max-h-[480px] overflow-y-auto pr-1">
              {plan.tasks.map((t) => {
                const isToday = t.date === todayStamp
                const lesson = t.grammarLessonId ? LESSONS.find(l => l.id === t.grammarLessonId) : undefined
                return (
                  <div key={t.date} className={'flex items-center gap-3 px-3 py-2 rounded-lg text-sm ' + (isToday ? 'bg-blue-50 border border-blue-200' : t.done ? 'opacity-50' : '')}>
                    <span className="text-slate-400 w-20 shrink-0">{t.date.slice(5)}</span>
                    {t.done ? <span className="text-green-500">✓</span> : <span className="text-slate-300">○</span>}
                    <span className="text-slate-600 truncate">
                      新词 {t.newWords} · 复习 {t.reviewWords}
                      {lesson ? ' · ' + lesson.title : ''}
                      {t.practiceSection ? ' · ' + SECTION_LABELS[t.practiceSection] + ' ' + (t.practiceCount ?? '') + '题' : ''}
                      {t.mockExamId ? ' · 📝 模拟卷' : ''}
                    </span>
                  </div>
                )
              })}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}