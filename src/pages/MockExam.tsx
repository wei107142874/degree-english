import { Link } from 'react-router-dom'
import { MOCK_EXAMS } from '../data/mock/exams'
import { examTotalPoints } from '../lib/examConfig'
import { useAttemptStore } from '../store/useAttemptStore'

export default function MockExam() {
  const attempts = useAttemptStore(s => s.attempts)
  const mockAttempts = attempts.filter(a => a.source === 'mock')
  const correctRate = mockAttempts.length
    ? Math.round((mockAttempts.filter(a => a.correct).length / mockAttempts.length) * 100)
    : null

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">📝 模拟考试</h1>
      <p className="text-sm text-slate-500">全真模拟 120 分钟，交卷自动评分 + 分节报告。建议每周 1 套。</p>

      {correctRate !== null && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
          已做过 {mockAttempts.length} 道模拟题，累计正确率 {correctRate}%
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {MOCK_EXAMS.map(m => (
          <Link key={m.id} to={'/mock/' + m.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:border-blue-400 hover:shadow transition">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800">{m.title}</span>
              <span className="text-xs text-slate-400">{examTotalPoints(m.sections)} 分</span>
            </div>
            <div className="text-xs text-slate-400 mt-2">
              {m.durationMin} 分钟 · {m.questions.length} 题 · {m.sections.length} 个题型
            </div>
            <div className="text-sm text-blue-600 mt-3">开始考试 →</div>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 text-sm text-slate-500 space-y-1">
        <div className="font-semibold text-slate-700 mb-1">📌 题型说明（四川师范大学常见结构，可在设置中调整）</div>
        <div>· 词汇与语法 30 题 × 1 分</div>
        <div>· 阅读理解 20 题 × 1.5 分</div>
        <div>· 完形填空 10 空 × 1 分</div>
        <div>· 英译汉 5 句 × 2 分 + 汉译英 5 句 × 2 分</div>
        <div>· 写作 1 篇 × 10 分</div>
      </div>
    </div>
  )
}
