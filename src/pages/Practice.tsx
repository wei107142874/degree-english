import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { SECTION_COUNTS, SECTION_LABELS } from '../data/questions'
import type { QuestionSection } from '../types'
import { useAttemptStore } from '../store/useAttemptStore'

const sections: QuestionSection[] = ['vocabGrammar', 'reading', 'cloze', 'translationEN', 'translationCN', 'writing']

const icons: Record<QuestionSection, string> = {
  vocabGrammar: '🔤', reading: '📄', cloze: '🧩', translationEN: '🇬🇧→🇨🇳', translationCN: '🇨🇳→🇬🇧', writing: '✍️',
}

export default function Practice() {
  const attempts = useAttemptStore(s => s.attempts)
  const wrongIds = useMemo(() => {
    const byQ: Record<string, import('../types').Attempt[]> = {}
    for (const a of attempts) (byQ[a.questionId] ??= []).push(a)
    const wrong = new Set<string>()
    for (const [qid, list] of Object.entries(byQ)) {
      if (!list[list.length - 1].correct) wrong.add(qid)
    }
    return [...wrong]
  }, [attempts])

  const rateFor = (section: QuestionSection) => {
    const qs = attempts.filter(a => a.section === section)
    if (qs.length === 0) return null
    return Math.round((qs.filter(a => a.correct).length / qs.length) * 100)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">✏️ 专项练习</h1>
      <p className="text-sm text-slate-500">分题型刷题，即时对错 + 中文解析，错题自动进错题本</p>
      <div className="grid gap-3 md:grid-cols-2">
        {sections.map(s => {
          const rate = rateFor(s)
          return (
            <Link key={s} to={'/practice/' + s} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:border-blue-400 hover:shadow transition">
              <div className="flex items-center justify-between">
                <span className="text-2xl">{icons[s]}</span>
                <span className="text-xs text-slate-400">{SECTION_COUNTS[s]} 题</span>
              </div>
              <div className="font-semibold text-slate-800 mt-2">{SECTION_LABELS[s]}</div>
              <div className="text-xs text-slate-400 mt-1">
                {rate === null ? '还没做过，开始练习 →' : `正确率 ${rate}%`}
              </div>
            </Link>
          )
        })}
      </div>
      {wrongIds.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
          🎯 错题本里有 {wrongIds.length} 道错题待重练，<Link to="/wrongbook" className="underline font-medium">去重练</Link>
        </div>
      )}
    </div>
  )
}
