import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ALL_WORDS } from '../data/words'
import type { Word } from '../types'
import { useSrsStore } from '../store/useSrsStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { speak } from '../components/common'
import { WORD_ORDER_SEED, buildOrderIndex } from '../lib/wordOrder'
import { todayStamp } from '../lib/srs'
import { buildTodayBatch } from '../lib/studyBatch'

type Mode = 'flashcard' | 'quiz'

export default function WordStudy() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('flashcard')
  const [queue, setQueue] = useState<Word[]>([])
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [quizChoice, setQuizChoice] = useState<number | null>(null)
  const [doneCount, setDoneCount] = useState(0)
  const [sessionCorrect, setSessionCorrect] = useState(0)
  const [finished, setFinished] = useState(false)
  // 遮罩单词：正面只显示中文释义，翻面才显示英文（回忆拼写用）
  const [maskWord, setMaskWord] = useState(false)

  const states = useSrsStore(s => s.states)
  const review = useSrsStore(s => s.review)
  const srsLoaded = useSrsStore(s => s.loaded)
  const settings = useSettingsStore(s => s.settings)
  const settingsLoaded = useSettingsStore(s => s.loaded)

  const dueWords = useMemo(() => {
    const now = Date.now()
    return ALL_WORDS.filter(w => {
      const st = states[w.id]
      return st && st.level >= 1 && st.due <= now
    })
  }, [states])

  // 固定随机词序：种子持久化在设置里（IndexedDB + 局域网同步 + 备份），
  // 电脑与手机同种子 → 完全一致的顺序，且不会随会话变化。
  const orderIndex = useMemo(
    () => buildOrderIndex(ALL_WORDS, settings.wordOrderSeed ?? WORD_ORDER_SEED),
    [settings.wordOrderSeed],
  )

  // 今日批次：今天新学的 ∪ 按固定随机序补齐到每日目标。
  // 批次不随会话变化 —— 退出重进后仍是同一批，进度从上次继续。
  const dailyGoal = Math.max(1, Math.min(100, settings.dailyNewWords || 30))

  const today = todayStamp()
  const { batch, done: batchDone, remaining: fresh } = useMemo(
    () => buildTodayBatch(ALL_WORDS, states, orderIndex, dailyGoal, today),
    [states, orderIndex, dailyGoal, today],
  )

  const batchTotal = batch.length
  const batchAllDone = batchTotal > 0 && batchDone >= batchTotal
  const dueCount = Math.min(dueWords.length, 50)
  const progressLabel = batchTotal === 0
    ? '全部单词已学完'
    : batchAllDone
      ? `今日新词 ${batchTotal} 个已完成 ✓`
      : `新词 第 ${batchDone + 1} / ${batchTotal} 个`

  const buildQueue = (m: Mode) => {
    const due = dueWords.slice(0, 50)
    // 队列 = 到期复习词（优先）+ 今日批次中仍未学的新词（固定顺序）
    const q = m === 'flashcard' ? [...due, ...fresh] : shuffle([...due, ...fresh]).slice(0, 20)
    setQueue(q)
    setIdx(0)
    setFlipped(false)
    setQuizChoice(null)
    setDoneCount(0)
    setSessionCorrect(0)
    setFinished(false)
  }

  // 等 SRS 与设置加载完成后再构建队列，避免用空状态建队导致重复/缺词
  useEffect(() => {
    if (srsLoaded && settingsLoaded) buildQueue(mode)
  }, [srsLoaded, settingsLoaded]) // eslint-disable-line

  const current = queue[idx]

  // 自动朗读：闪卡模式下每出现一张新卡片（含进入学习的第一张）自动发音一遍。
  // 自测模式与「遮罩单词」不自动读，避免听力剧透答案/拼写。
  useEffect(() => {
    if (mode === 'flashcard' && !maskWord && current) {
      void speak(current.spelling)
    }
  }, [current?.id, mode, maskWord]) // eslint-disable-line

  // 自测选项缓存（保证与显示一致）
  const [optionsCache, setOptionsCache] = useState<Word[]>([])
  useEffect(() => {
    if (!current) return
    const others = shuffle(ALL_WORDS.filter(w => w.id !== current.id)).slice(0, 3)
    setOptionsCache(shuffle([current, ...others]))
    setQuizChoice(null)
  }, [current?.id]) // eslint-disable-line

  const correctIdx = useMemo(() => {
    if (mode !== 'quiz' || !current) return -1
    return optionsCache.findIndex(o => o.id === current.id)
  }, [mode, current, optionsCache])

  const next = () => {
    if (idx + 1 >= queue.length) { setFinished(true); return }
    setIdx(i => i + 1)
    setFlipped(false)
  }

  // 闪卡：认识/模糊/不认识（模糊也记对，但间隔更短由 SRS 等级控制）
  const grade = async (correct: boolean) => {
    if (!current) return
    await review(current.id, correct)
    if (correct) setSessionCorrect(c => c + 1)
    setDoneCount(c => c + 1)
    next()
  }

  // 自测答题
  const answerQuiz = async (choice: number) => {
    if (quizChoice !== null || !current) return
    setQuizChoice(choice)
    const correct = choice === correctIdx
    await review(current.id, correct)
    if (correct) setSessionCorrect(c => c + 1)
    setDoneCount(c => c + 1)
    setTimeout(() => { setQuizChoice(null); next() }, 900)
  }

  if (!srsLoaded || !settingsLoaded) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">开始学习</h1>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
          <p className="text-slate-500">正在加载学习数据…</p>
        </div>
      </div>
    )
  }

  if (queue.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">开始学习</h1>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center space-y-4">
          <p className="text-slate-500">
            {batchAllDone
              ? `今日 ${batchTotal} 个新词已完成 🎉，明天继续下一批`
              : '当前没有待学或待复习的单词'}
          </p>
          <div className="flex justify-center gap-3">
            {!batchAllDone && (
              <button onClick={() => buildQueue('flashcard')} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">重新加载队列</button>
            )}
            <button onClick={() => navigate('/')} className="border border-slate-300 px-4 py-2 rounded-lg text-sm text-slate-600">回首页</button>
          </div>
        </div>
      </div>
    )
  }

  if (finished) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">本次学习完成 🎉</h1>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center space-y-4">
          <div className="text-5xl">{doneCount > 0 && sessionCorrect / doneCount >= 0.8 ? '🌟' : '💪'}</div>
          <p className="text-slate-600">完成 {doneCount} 个单词，答对 {sessionCorrect} 个</p>
          <div className="flex justify-center gap-3">
            <button onClick={() => buildQueue('flashcard')} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">再学一轮</button>
            <button onClick={() => navigate('/')} className="border border-slate-300 px-4 py-2 rounded-lg text-sm text-slate-600">回首页</button>
          </div>
        </div>
      </div>
    )
  }

  if (!current) return null

  // ---- 自测模式（看中文选英文） ----
  if (mode === 'quiz') {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">单词自测</h1>
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>{progressLabel}{dueCount > 0 ? ` · 复习 ${dueCount} 个到期` : ''}</span>
          <button onClick={() => setMode('flashcard')} className="text-blue-600">切到闪卡模式</button>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="text-2xl font-bold mb-6">{current.meanings.join('；')}</div>
          <div className="grid gap-3">
            {optionsCache.map((o, i) => (
              <button
                key={o.id}
                onClick={() => answerQuiz(i)}
                className={`px-4 py-3 rounded-lg border text-left font-medium transition ${
                  quizChoice === null
                    ? 'border-slate-300 hover:border-blue-500 hover:bg-blue-50'
                    : i === correctIdx
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : quizChoice === i
                        ? 'border-red-500 bg-red-50 text-red-600'
                        : 'border-slate-200 opacity-60'
                }`}
              >
                {o.spelling} {o.phonetic && <span className="text-xs text-slate-400 ml-2">{o.phonetic}</span>}
              </button>
            ))}
          </div>
          {quizChoice !== null && (
            <div className="mt-4 text-sm text-slate-500">
              {quizChoice === correctIdx ? '✅ 回答正确' : '❌ 正确答案：' + current.spelling}
            </div>
          )}
        </div>
        <button onClick={() => speak(current.spelling)} className="w-full border border-slate-300 py-2.5 rounded-lg text-sm text-slate-600">🔊 朗读单词</button>
      </div>
    )
  }

  // ---- 闪卡模式 ----
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">闪卡学习</h1>
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>{progressLabel}{dueCount > 0 ? ` · 复习 ${dueCount} 个到期` : ''}</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setMaskWord(m => !m); setFlipped(false) }}
            className={maskWord ? 'text-amber-600 font-medium' : 'text-blue-600'}
            title="遮罩单词：正面只显示中文释义，翻面才显示英文单词"
          >{maskWord ? '👁 单词' : '🔒 单词'}</button>
          <button onClick={() => setMode('quiz')} className="text-blue-600">切到自测模式</button>
        </div>
      </div>

      <div className="flip-card h-72 cursor-pointer select-none" onClick={() => setFlipped(f => !f)}>
        <div className={`flip-inner h-full ${flipped ? 'flipped' : ''}`}>
          <div className="flip-face h-full bg-white rounded-2xl shadow-md border border-slate-200 flex flex-col items-center justify-center p-6">
            {maskWord ? (
              <>
                <div className="text-sm text-slate-500 mb-2">{current.pos ?? ''}</div>
                <div className="text-2xl font-semibold text-blue-900 text-center leading-relaxed">{current.meanings.join('；')}</div>
                <div className="absolute bottom-4 text-xs text-slate-300">点击翻面查看单词</div>
              </>
            ) : (
              <>
                <div className="text-4xl font-bold text-slate-800">{current.spelling}</div>
                {current.phonetic && <div className="text-slate-400 mt-2">{current.phonetic}</div>}
                <div className="absolute bottom-4 text-xs text-slate-300">点击翻面查看释义</div>
              </>
            )}
          </div>
          <div className="flip-back h-full bg-blue-50 rounded-2xl shadow-md border border-blue-200 flex flex-col items-center justify-center p-6 gap-2">
            {maskWord ? (
              <>
                <div className="text-4xl font-bold text-slate-800">{current.spelling}</div>
                {current.phonetic && <div className="text-slate-400 mt-2">{current.phonetic}</div>}
                {current.examples[0] && (
                  <div className="mt-2 text-sm text-slate-600 text-center">
                    <div>{current.examples[0].en}</div>
                    <div className="text-slate-400 mt-1">{current.examples[0].zh}</div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="text-sm text-slate-500">{current.pos ?? ''} {current.phonetic ?? ''}</div>
                <div className="text-xl font-semibold text-blue-900">{current.meanings.join('；')}</div>
                {current.examples[0] && (
                  <div className="mt-2 text-sm text-slate-600 text-center">
                    <div>{current.examples[0].en}</div>
                    <div className="text-slate-400 mt-1">{current.examples[0].zh}</div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <button onClick={(e) => { e.stopPropagation(); speak(current.spelling) }} className="w-full border border-slate-300 py-2.5 rounded-lg text-sm text-slate-600">🔊 朗读</button>

      <div className="grid grid-cols-3 gap-3">
        <button onClick={() => grade(false)} className="bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-medium">不认识</button>
        <button onClick={() => grade(true)} className="bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-medium">模糊</button>
        <button onClick={() => grade(true)} className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium">认识</button>
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
