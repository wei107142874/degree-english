import { Link } from 'react-router-dom'
import { LESSONS } from '../data/grammar/lessons'
import { MICRO_LESSONS } from '../data/grammar/microLessons'
import { useAttemptStore } from '../store/useAttemptStore'

export default function Grammar() {
  const attempts = useAttemptStore(s => s.attempts)

  // 统计每节课小测正确率
  const quizStats = (lessonId: string) => {
    const qs = attempts.filter(a => a.source === 'quiz' && a.questionId.startsWith(lessonId + ':'))
    if (qs.length === 0) return null
    const correct = qs.filter(a => a.correct).length
    return { total: qs.length, correct }
  }

  const microQuizStats = (lessonId: string) => {
    const qs = attempts.filter(a => a.source === 'quiz' && a.questionId.startsWith('micro:' + lessonId + ':'))
    if (qs.length === 0) return null
    const correct = qs.filter(a => a.correct).length
    return { total: qs.length, correct }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">📖 语法专题</h1>
      <p className="text-sm text-slate-500">零基础友好的中文讲解 + 随堂小测，共 {LESSONS.length + MICRO_LESSONS.length} 节</p>
      <section className="space-y-3">
        <div>
          <h2 className="font-bold text-slate-800">语法小灶</h2>
          <p className="text-xs text-slate-500 mt-0.5">一次只讲一个小点，例句和练习优先使用你学过的单词。</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {MICRO_LESSONS.map(l => {
            const s = microQuizStats(l.id)
            return (
              <Link key={l.id} to={'/grammar/micro/' + l.id} className="bg-white rounded-xl shadow-sm border border-emerald-200 p-5 hover:border-emerald-400 hover:shadow transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">{l.category}</span>
                  {s ? (
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      s.correct / s.total >= 0.7 ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                    }`}>小测 {s.correct}/{s.total}</span>
                  ) : (
                    <span className="text-xs text-slate-400">{l.minutes} 分钟</span>
                  )}
                </div>
                <div className="font-semibold text-slate-800 mt-2">{l.title}</div>
                <div className="text-sm text-slate-500 mt-1">{l.summary}</div>
                <div className="text-xs text-slate-400 mt-3">练习 {l.exercises.length} 题 →</div>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="font-bold text-slate-800">考试语法大全</h2>
          <p className="text-xs text-slate-500 mt-0.5">保留原来的系统复习课，适合后面冲刺刷考点。</p>
        </div>
      <div className="grid gap-3 md:grid-cols-2">
        {LESSONS.map(l => {
          const s = quizStats(l.id)
          return (
            <Link key={l.id} to={'/grammar/' + l.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:border-blue-400 hover:shadow transition">
              <div className="flex items-center justify-between">
                <span className="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded">{l.category}</span>
                {s && (
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    s.correct / s.total >= 0.7 ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                  }`}>小测 {s.correct}/{s.total}</span>
                )}
              </div>
              <div className="font-semibold text-slate-800 mt-2">{l.title}</div>
              <div className="text-sm text-slate-500 mt-1">{l.summary}</div>
              <div className="text-xs text-slate-400 mt-3">小测 {l.quiz.length} 题 →</div>
            </Link>
          )
        })}
      </div>
      </section>
    </div>
  )
}
