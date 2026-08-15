import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { findQuestion } from '../data/questions'
import { SECTION_LABELS } from '../data/questions'
import { useAttemptStore } from '../store/useAttemptStore'
import { getPassage } from '../data/questions'

export default function WrongBook() {
  const attempts = useAttemptStore(s => s.attempts)
  const wrongIds = useMemo(() => {
    const byQ: Record<string, import('../types').Attempt[]> = {}
    for (const a of attempts) (byQ[a.questionId] ??= []).push(a)
    const wrong = new Set<string>()
    for (const [qid, list] of Object.entries(byQ)) {
      const last = list[list.length - 1]
      if (!last.correct) wrong.add(qid)
    }
    return [...wrong]
  }, [attempts])
  const navigate = useNavigate()
  const [selected, setSelected] = useState<string | null>(null)

  // 按题型分组
  const groups = useMemo(() => {
    const map: Record<string, string[]> = {}
    for (const id of wrongIds) {
      const q = findQuestion(id)
      if (!q) continue
      (map[q.section] ??= []).push(id)
    }
    return map
  }, [wrongIds])

  const q = selected ? findQuestion(selected) : undefined
  const passage = q?.passageId ? getPassage(q.passageId) : undefined
  const history = q ? attempts.filter(a => a.questionId === q.id) : []

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">🎯 错题本</h1>
      <p className="text-sm text-slate-500">最近答错、尚未连续答对的题目会自动收录在这里，共 {wrongIds.length} 题</p>

      {wrongIds.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-400">
          太棒了，目前没有错题！继续加油 🎉
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        {/* 左侧：错题列表 */}
        <div className="space-y-3">
          {Object.entries(groups).map(([section, ids]) => (
            <div key={section} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="text-sm font-semibold text-slate-700 mb-2">{SECTION_LABELS[section as keyof typeof SECTION_LABELS]}（{ids.length}）</div>
              <div className="space-y-1.5">
                {ids.slice(0, 30).map(id => {
                  const item = findQuestion(id)
                  if (!item) return null
                  return (
                    <button
                      key={id}
                      onClick={() => setSelected(id)}
                      className={'w-full text-left px-3 py-2 rounded-lg text-sm border ' + (selected === id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-blue-300')}
                    >
                      <span className="line-clamp-1">{item.prompt.slice(0, 40)}{item.prompt.length > 40 ? '…' : ''}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* 右侧：错题详情 */}
        <div>
          {q ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-3">
              {passage && (
                <div className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                  <div className="font-semibold text-slate-700 mb-1">{passage.title}</div>
                  {passage.text}
                </div>
              )}
              <p className="font-medium text-slate-800 text-sm whitespace-pre-wrap">{q.prompt}</p>
              {q.options && (
                <div className="space-y-1.5">
                  {q.options.map((o, i) => (
                    <div key={i} className={'px-3 py-2 rounded-lg text-sm border ' + (i === Number(q.answer) ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 text-slate-500')}>
                      {String.fromCharCode(65 + i)}. {o} {i === Number(q.answer) && '✓ 正确答案'}
                    </div>
                  ))}
                </div>
              )}
              {!q.options && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="text-xs text-green-700 font-medium mb-1">参考答案</div>
                  <div className="text-sm text-slate-700 whitespace-pre-wrap">{q.answer}</div>
                </div>
              )}
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-500 font-medium mb-1">💡 解析</div>
                <div className="text-sm text-slate-600">{q.explanation}</div>
              </div>
              {history.length > 0 && (
                <div className="text-xs text-slate-400">曾答 {history.length} 次，最近{' '}
                  {history[history.length - 1].correct ? '答对' : '答错'}
                </div>
              )}
              <button onClick={() => navigate('/practice/' + q.section)} className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm">
                去 {SECTION_LABELS[q.section]} 再练一组
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-400">
              点击左侧错题查看详情与解析
            </div>
          )}
        </div>
      </div>
    </div>
  )
}