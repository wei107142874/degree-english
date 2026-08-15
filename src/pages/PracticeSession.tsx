import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getQuestionsBySection, getPassage } from '../data/questions'
import { SECTION_LABELS } from '../data/questions'
import type { Question, QuestionSection } from '../types'
import { useAttemptStore } from '../store/useAttemptStore'
import { speak } from '../components/common'

export default function PracticeSession() {
  const { section } = useParams()
  const navigate = useNavigate()
  const sec = (section ?? 'vocabGrammar') as QuestionSection

  const all = useMemo(() => getQuestionsBySection(sec), [sec])
  const [queue, setQueue] = useState<Question[]>([])
  const [idx, setIdx] = useState(0)
  const [choice, setChoice] = useState<number | null>(null)
  const [results, setResults] = useState<{ q: any; correct: boolean }[]>([])
  const addAttempt = useAttemptStore(s => s.add)

  // 初始化/重开
  const start = () => {
    const qs = shuffle(all).slice(0, sec === 'writing' || sec === 'translationEN' || sec === 'translationCN' ? 10 : 15)
    setQueue(qs); setIdx(0); setChoice(null); setResults([])
  }
  useEffect(() => { start() }, []) // eslint-disable-line

  const current = queue[idx]
  const passage = current?.passageId ? getPassage(current.passageId) : undefined
  const isChoice = !!current?.options

  const answer = async (i?: number) => {
    if (!current || choice !== null) return
    const userAnswer = isChoice ? String(i) : ''
    const correct = isChoice ? i === Number(current.answer) : false
    setChoice(isChoice ? i! : -1)
    setResults(r => [...r, { q: current, correct }])
    await addAttempt({ questionId: current.id, section: sec, correct, userAnswer, source: 'practice' })
  }

  const next = () => {
    setChoice(null)
    if (idx + 1 >= queue.length) { setIdx(i => i + 1); return }
    setIdx(i => i + 1)
  }

  const finished = results.length > 0 && idx >= queue.length

  if (queue.length === 0 || !current) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate('/practice')} className="text-sm text-blue-600">← 返回专项练习</button>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
          <p className="text-slate-500">正在准备题目…</p>
          <button onClick={start} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">开始</button>
        </div>
      </div>
    )
  }

  if (finished) {
    const correct = results.filter(r => r.correct).length
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">练习完成 🎉</h1>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center space-y-4">
          <div className="text-5xl">{correct / results.length >= 0.7 ? '🌟' : '💪'}</div>
          <p className="text-slate-600">共 {results.length} 题，答对 {correct} 题，正确率 {Math.round(correct / results.length * 100)}%</p>
          <div className="flex justify-center gap-3">
            <button onClick={start} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">再来一组</button>
            <button onClick={() => navigate('/practice')} className="border border-slate-300 px-4 py-2 rounded-lg text-sm text-slate-600">返回</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <button onClick={() => navigate('/practice')} className="text-sm text-blue-600">← 返回专项练习</button>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{SECTION_LABELS[sec]}</h1>
        <span className="text-sm text-slate-500">{Math.min(idx + 1, queue.length)} / {queue.length}</span>
      </div>

      {passage && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
          <div className="font-semibold text-slate-800 mb-2">{passage.title}</div>
          {passage.text}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <p className="font-medium text-slate-800 mb-4 whitespace-pre-wrap">{current.prompt}</p>

        {isChoice ? (
          <div className="grid gap-2">
            {current.options!.map((o, i) => (
              <button
                key={i}
                onClick={() => answer(i)}
                className={`text-left px-4 py-2.5 rounded-lg border text-sm transition ${
                  choice === null
                    ? 'border-slate-300 hover:border-blue-500 hover:bg-blue-50'
                    : i === Number(current.answer)
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : choice === i
                        ? 'border-red-500 bg-red-50 text-red-600'
                        : 'border-slate-200 opacity-60'
                }`}
              >
                {String.fromCharCode(65 + i)}. {o}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {sec === 'translationEN' && (
              <button onClick={() => speak(current.prompt)} className="w-full border border-slate-300 py-2.5 rounded-lg text-sm text-slate-600">🔊 朗读原文</button>
            )}
            <div className="text-center py-4">
              <p className="text-xs text-slate-400 mb-2">先在心里翻译，然后对照参考答案</p>
              <button
                onClick={() => answer()}
                className={`bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm ${
                  choice !== null ? 'opacity-50' : 'hover:bg-blue-700'
                }`}
              >查看参考答案</button>
            </div>
          </div>
        )}

        {choice !== null && (
          <div className="mt-4 space-y-2">
            {isChoice && (
              <p className={`text-sm font-medium ${
                choice === Number(current.answer) ? 'text-green-600' : 'text-red-500'
              }`}>
                {choice === Number(current.answer) ? '✅ 回答正确' : '❌ 正确答案：' + String.fromCharCode(65 + Number(current.answer))}
              </p>
            )}
            {!isChoice && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="text-xs text-green-700 font-medium mb-1">参考答案</div>
                <div className="text-sm text-slate-700 whitespace-pre-wrap">{current.answer}</div>
              </div>
            )}
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-xs text-slate-500 font-medium mb-1">💡 解析</div>
              <div className="text-sm text-slate-600 leading-relaxed">{current.explanation}</div>
            </div>
            {idx + 1 < queue.length ? (
              <button onClick={next} className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm">下一题 →</button>
            ) : (
              <button onClick={next} className="w-full bg-green-600 text-white py-2.5 rounded-lg text-sm">查看结果</button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const t = a[i]; a[i] = a[j]; a[j] = t
  }
  return a
}
