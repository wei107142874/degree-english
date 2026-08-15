import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getMockExam } from '../data/mock/exams'
import { getPassage } from '../data/questions'
import type { Question } from '../types'
import { useAttemptStore } from '../store/useAttemptStore'
import { scoreExam, type ExamResult } from '../lib/scoring'
import { speak } from '../components/common'

type Phase = 'intro' | 'exam' | 'result'

export default function MockSession() {
  const { id } = useParams()
  const navigate = useNavigate()
  const exam = id ? getMockExam(id) : undefined
  const addAttempt = useAttemptStore(s => s.add)

  const [phase, setPhase] = useState<Phase>('intro')
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, { userAnswer: string; correct: boolean }>>({})
  const [choice, setChoice] = useState<number | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const timerRef = useRef<number | null>(null)
  const startRef = useRef(0)
  const answersRef = useRef(answers)
  answersRef.current = answers

  // 题目按题型分组展示时的问题序号映射
  const questionOrder = useMemo(() => {
    if (!exam) return []
    const order: { q: Question; displayNo: number }[] = []
    let no = 1
    for (const cfg of exam.sections) {
      const qs = exam.questions.filter(q => q.section === cfg.section)
      for (const q of qs) { order.push({ q, displayNo: no++ }) }
    }
    return order
  }, [exam])

  useEffect(() => {
    if (phase !== 'exam') return
    startRef.current = Date.now()
    const total = (exam?.durationMin ?? 120) * 60
    setSecondsLeft(total)
    timerRef.current = window.setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(timerRef.current!)
          finish()
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase]) // eslint-disable-line

  if (!exam) return <div className="p-8 text-center text-slate-400">试卷不存在</div>

  const current = questionOrder[idx]?.q
  const passage = current?.passageId ? getPassage(current.passageId) : undefined
  const isChoice = !!current?.options

  const answer = async (i?: number) => {
    if (!current || choice !== null) return
    const userAnswer = isChoice ? String(i) : ''
    const correct = isChoice ? i === Number(current.answer) : false
    setChoice(isChoice ? i! : -1)
    setAnswers(a => ({ ...a, [current.id]: { userAnswer, correct } }))
    await addAttempt({ questionId: current.id, section: current.section, correct, userAnswer, source: 'mock', mockId: exam.id })
  }

  const next = () => {
    setChoice(null)
    setIdx(i => i + 1)
  }

  const finish = async () => {
    if (timerRef.current) clearInterval(timerRef.current)
    const durationSec = Math.round((Date.now() - startRef.current) / 1000)
    const result = scoreExam(answersRef.current, exam.questions, exam.sections, durationSec)
    setResult(result)
    setPhase('result')
  }

  const [result, setResult] = useState<ExamResult | null>(null)

  // 答题卡跳转
  const jumpTo = (i: number) => { setChoice(null); setIdx(i) }

  if (phase === 'intro') {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate('/mock')} className="text-sm text-blue-600">← 返回模拟卷列表</button>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-4">
          <h1 className="text-2xl font-bold">{exam.title}</h1>
          <div className="text-sm text-slate-500 space-y-1">
            <div>⏱️ 时长：{exam.durationMin} 分钟</div>
            <div>📊 总分：{exam.sections.reduce((s, c) => s + c.count * c.points, 0)} 分</div>
            <div>📝 题量：{exam.questions.length} 题</div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
            💡 提示：翻译与写作题会展示参考答案，需自评得分；其余题型自动判分。
          </div>
          <button onClick={() => setPhase('exam')} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium">
            开始考试
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'result' && result) {
    const pass = result.totalScore >= 60
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{pass ? '🎉 恭喜通过（≥60分）' : '💪 还需加油（<60分）'}</h1>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="text-5xl font-bold text-blue-600">{Math.round(result.totalScore * 10) / 10}</div>
          <div className="text-slate-400 mt-1">/ {result.maxScore} 分</div>
          <div className="text-sm text-slate-500 mt-3">用时 {Math.floor(result.durationSec / 60)} 分 {result.durationSec % 60} 秒</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h2 className="font-bold text-slate-800 mb-3">分节得分</h2>
          <div className="space-y-2">
            {result.sections.map(s => (
              <div key={s.section} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{s.title}</span>
                <span className="font-medium">
                  {s.correct}/{s.total} 题 · <span className="text-blue-600">{s.points} 分</span>/{s.maxPoints}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => { setAnswers({}); setIdx(0); setChoice(null); setPhase('intro') }} className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-sm">重做一遍</button>
          <button onClick={() => navigate('/mock')} className="flex-1 border border-slate-300 py-3 rounded-xl text-sm text-slate-600">返回列表</button>
        </div>
      </div>
    )
  }

  // 考试界面
  const answeredCount = Object.keys(answers).length
  const mm = Math.floor(secondsLeft / 60)
  const ss = secondsLeft % 60

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-10 bg-blue-700 text-white rounded-xl px-4 py-3 flex items-center justify-between shadow">
        <span className="font-semibold text-sm">{exam.title}</span>
        <span className="font-mono text-lg font-bold">{mm}:{String(ss).padStart(2, '0')}</span>
        <button onClick={finish} className="bg-white text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium">交卷</button>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>第 {idx + 1} / {questionOrder.length} 题</span>
        <span>已答 {answeredCount} / {questionOrder.length}</span>
      </div>

      {passage && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
          <div className="font-semibold text-slate-800 mb-2">{passage.title}</div>
          {passage.text}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="text-xs text-blue-500 mb-2">{exam.sections.find(c => c.section === current.section)?.title}</div>
        <p className="font-medium text-slate-800 mb-4 whitespace-pre-wrap">{current.prompt}</p>

        {isChoice ? (
          <div className="grid gap-2">
            {current.options!.map((o, i) => (
              <button
                key={i}
                onClick={() => answer(i)}
                className={`text-left px-4 py-2.5 rounded-lg border text-sm transition ${
                  choice === null ? 'border-slate-300 hover:border-blue-500 hover:bg-blue-50'
                  : choice === i ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-slate-200 opacity-70'
                }`}
              >
                {String.fromCharCode(65 + i)}. {o}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {current.section === 'translationEN' && (
              <button onClick={() => speak(current.prompt)} className="w-full border border-slate-300 py-2.5 rounded-lg text-sm text-slate-600">🔊 朗读原文</button>
            )}
            <button
              onClick={() => answer()}
              className={`w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm ${
                choice !== null ? 'opacity-50' : 'hover:bg-blue-700'
              }`}
            >已翻译完成，查看参考答案</button>
          </div>
        )}

        {choice !== null && (
          <div className="mt-4 space-y-2">
            {!isChoice && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="text-xs text-green-700 font-medium mb-1">参考答案</div>
                <div className="text-sm text-slate-700 whitespace-pre-wrap">{current.answer}</div>
              </div>
            )}
            {idx + 1 < questionOrder.length ? (
              <button onClick={next} className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm">下一题 →</button>
            ) : (
              <button onClick={finish} className="w-full bg-green-600 text-white py-2.5 rounded-lg text-sm">交卷查看成绩</button>
            )}
          </div>
        )}
      </div>

      {/* 答题卡 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="text-xs text-slate-400 mb-2">答题卡（点击跳转）</div>
        <div className="flex flex-wrap gap-1.5">
          {questionOrder.map(({ q, displayNo }, i) => {
            const answered = !!answers[q.id]
            return (
              <button
                key={q.id}
                onClick={() => jumpTo(i)}
                className={`w-8 h-8 rounded text-xs font-medium ${
                  answered ? 'bg-blue-600 text-white' : i === idx ? 'border-2 border-blue-600 text-blue-600' : 'bg-slate-100 text-slate-500'
                }`}
              >{displayNo}</button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
