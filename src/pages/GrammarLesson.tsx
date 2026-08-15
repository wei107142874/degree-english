import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getLesson } from '../data/grammar/lessons'
import { useAttemptStore } from '../store/useAttemptStore'

export default function GrammarLesson() {
  const { id } = useParams()
  const navigate = useNavigate()
  const lesson = id ? getLesson(id) : undefined
  const addAttempt = useAttemptStore(s => s.add)

  const [quizIdx, setQuizIdx] = useState(0)
  const [choice, setChoice] = useState<number | null>(null)
  const [results, setResults] = useState<boolean[]>([])

  if (!lesson) {
    return <div className="p-8 text-center text-slate-400">课程不存在 <button onClick={() => navigate('/grammar')} className="text-blue-600 ml-2">返回</button></div>
  }

  const quiz = lesson.quiz[quizIdx]
  const answeredAll = results.length === lesson.quiz.length

  const answer = async (i: number) => {
    if (choice !== null) return
    setChoice(i)
    const correct = i === quiz.answer
    setResults(r => [...r, correct])
    await addAttempt({
      questionId: lesson.id + ':' + quizIdx,
      section: 'vocabGrammar',
      correct,
      userAnswer: String(i),
      source: 'quiz',
    })
  }

  const next = () => {
    setChoice(null)
    setQuizIdx(i => i + 1)
  }

  return (
    <div className="space-y-4">
      <button onClick={() => navigate('/grammar')} className="text-sm text-blue-600">← 返回语法列表</button>
      <div>
        <div className="text-xs text-blue-500 bg-blue-50 inline-block px-2 py-0.5 rounded">{lesson.category}</div>
        <h1 className="text-2xl font-bold mt-1">{lesson.title}</h1>
        <p className="text-sm text-slate-500 mt-1">{lesson.summary}</p>
      </div>

      {/* 讲义 */}
      <div className="space-y-3">
        {lesson.sections.map((sec, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h2 className="font-bold text-slate-800 mb-2">{i + 1}. {sec.heading}</h2>
            {sec.content.map((c, j) => <p key={j} className="text-sm text-slate-600 leading-relaxed mb-2">{c}</p>)}
            {sec.examples && (
              <div className="bg-blue-50/60 rounded-lg p-3 mt-2 space-y-1.5">
                {sec.examples.map((ex, j) => (
                  <div key={j} className="text-sm">
                    <div className="text-blue-800">{ex.en}</div>
                    <div className="text-slate-500 text-xs mt-0.5">{ex.zh}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 小测 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-slate-800">随堂小测</h2>
          <span className="text-xs text-slate-400">{results.length} / {lesson.quiz.length}</span>
        </div>

        {answeredAll ? (
          <div className="text-center py-6 space-y-3">
            <div className="text-4xl">{results.filter(Boolean).length / results.length >= 0.7 ? '🎉' : '💪'}</div>
            <p className="text-slate-600">答对 {results.filter(Boolean).length} / {results.length} 题</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => { setResults([]); setQuizIdx(0); setChoice(null) }} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">重新测试</button>
              <button onClick={() => navigate('/grammar')} className="border border-slate-300 px-4 py-2 rounded-lg text-sm text-slate-600">返回列表</button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm font-medium text-slate-700 mb-3">{quizIdx + 1}. {quiz.question}</p>
            <div className="grid gap-2">
              {quiz.options.map((o, i) => (
                <button
                  key={i}
                  onClick={() => answer(i)}
                  className={`text-left px-4 py-2.5 rounded-lg border text-sm transition ${
                    choice === null
                      ? 'border-slate-300 hover:border-blue-500 hover:bg-blue-50'
                      : i === quiz.answer
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
            {choice !== null && (
              <div className="mt-4 space-y-2">
                <p className={`text-sm font-medium ${
                  choice === quiz.answer ? 'text-green-600' : 'text-red-500'
                }`}>{choice === quiz.answer ? '✅ 回答正确' : '❌ 正确答案：' + String.fromCharCode(65 + quiz.answer)}</p>
                <p className="text-sm text-slate-500 bg-slate-50 rounded-lg p-3 leading-relaxed">💡 {quiz.explanation}</p>
                {quizIdx + 1 < lesson.quiz.length ? (
                  <button onClick={next} className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm">下一题 →</button>
                ) : (
                  <button onClick={next} className="w-full bg-green-600 text-white py-2.5 rounded-lg text-sm">查看结果</button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
