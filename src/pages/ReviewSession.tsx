import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ALL_WORDS } from '../data/words'
import type { Word } from '../types'
import { useSrsStore } from '../store/useSrsStore'
import { speak } from '../components/common'
import { todayStamp, countReviewedToday } from '../lib/srs'
import { onControl, sendControl, useControlAvailable } from '../control/remote'
import type { ControlPayload, RemoteState } from '../control/remote'

// 每批复习的词数（默认 50），「继续复习」接续下一批
const BATCH_SIZE = 50

export default function ReviewSession() {
  const navigate = useNavigate()
  const states = useSrsStore(s => s.states)
  const review = useSrsStore(s => s.review)
  const toggleMark = useSrsStore(s => s.toggleMark)
  const srsLoaded = useSrsStore(s => s.loaded)

  // 复习池：打标记的重点词（随机序）在前，其余已学词（随机序）在后。
  const [pool, setPool] = useState<Word[]>([])
  const [batchStart, setBatchStart] = useState(0) // 池中已取出的词数（“继续复习”用）
  const [queue, setQueue] = useState<Word[]>([])
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  // 遮罩单词：正面只显示中文释义，点击才显示英文（回忆拼写用）
  const [maskWord, setMaskWord] = useState(false)
  const [dictationOn, setDictationOn] = useState(false)
  const [dictation, setDictation] = useState('')
  const [doneCount, setDoneCount] = useState(0)
  const [sessionCorrect, setSessionCorrect] = useState(0)
  const [finished, setFinished] = useState(false)

  // 手机遥控：本机静音，点认识/模糊/不认识等指令发给电脑（与「开始学习」一致）
  const [remoteOn, setRemoteOn] = useState(false)
  const [remoteState, setRemoteState] = useState<RemoteState | null>(null)
  const controlReady = useControlAvailable()

  const today = todayStamp()
  const reviewedToday = useMemo(
    () => countReviewedToday(Object.values(states), today),
    [states, today],
  )
  const markedTotal = useMemo(() => Object.values(states).filter(s => s.marked).length, [states])

  /** 构建整个复习池（打标记在前） */
  const buildPool = (): Word[] => {
    const learned = ALL_WORDS.filter(w => (states[w.id]?.level ?? 0) >= 1)
    const marked = learned.filter(w => states[w.id]?.marked)
    const unmarked = learned.filter(w => !states[w.id]?.marked)
    return [...shuffle(marked), ...shuffle(unmarked)]
  }

  /** 从池中取出从 start 开始的一批，作为当前队列 */
  const startFrom = (p: Word[], start: number) => {
    setQueue(p.slice(start, start + BATCH_SIZE))
    setIdx(0)
    setFlipped(false)
    setDictation('')
    setDoneCount(0)
    setSessionCorrect(0)
    setFinished(false)
  }

  // 进入页面：构建整个池并开始第一批（只做一次，复习中不重排）
  useEffect(() => {
    if (srsLoaded) {
      const p = buildPool()
      setPool(p)
      setBatchStart(0)
      startFrom(p, 0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [srsLoaded])

  const continueReview = () => {
    const start = batchStart + BATCH_SIZE
    setBatchStart(start)
    startFrom(pool, start)
  }

  const restartAll = () => {
    const p = buildPool()
    setPool(p)
    setBatchStart(0)
    startFrom(p, 0)
  }

  const current = queue[idx]
  const hasMore = batchStart + BATCH_SIZE < pool.length
  const progressText = queue.length === 0 ? '' : `第 ${idx + 1} / ${queue.length} 个`
  const markedInQueue = queue.filter(w => states[w.id]?.marked).length

  // 每张新卡片自动朗读一遍（遮罩单词、手机遥控本机静音时不自动读）
  useEffect(() => {
    if (current && !maskWord && !remoteOn) void speak(current.spelling)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id, maskWord, remoteOn])

  const next = () => {
    if (idx + 1 >= queue.length) { setFinished(true); return }
    setIdx(i => i + 1)
    setFlipped(false)
    setDictation('')
  }

  // 认识/模糊/不认识（模糊也记对，但间隔更短由 SRS 等级控制）
  const grade = async (correct: boolean) => {
    if (!current) return
    await review(current.id, correct)
    if (correct) setSessionCorrect(c => c + 1)
    setDoneCount(c => c + 1)
    next()
  }

  // ---- 手机遥控：完整会话状态镜像（与 WordStudy 同机制） ----
  const broadcastState = () => {
    if (!current) return
    void sendControl({
      type: 'state',
      state: {
        mode: 'flashcard',
        wordId: current.id,
        flipped,
        maskWord,
        idx: idx + 1,
        total: queue.length,
        quizOptions: [],
        quizChoice: null,
        quizCorrectIdx: -1,
        finished,
        doneCount,
        sessionCorrect,
        progress: progressText,
        marked: !!states[current.id]?.marked,
        hasMore,
      },
    })
  }

  // 用 ref 持有最新 handler，避免遥控指令回调拿到过期闭包
  const ctlRef = useRef<{ continueReview: () => void; restartAll: () => void; broadcastState: () => void; grade: (c: boolean) => void } | undefined>(undefined)
  ctlRef.current = { continueReview, restartAll, broadcastState, grade }

  useEffect(() => {
    if (!controlReady || remoteOn || !current) return
    broadcastState()
    const t = setInterval(broadcastState, 5000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlReady, remoteOn, current?.id, flipped, maskWord, idx, queue.length, finished, doneCount, sessionCorrect, progressText, hasMore, states])

  // 电脑端：接收手机指令并执行（本机为遥控端时不接收，避免双重操作）
  useEffect(() => {
    if (!controlReady || remoteOn) return
    return onControl(msg => {
      if (msg.type !== 'cmd') return
      switch (msg.action) {
        case 'grade':
          if (current && msg.wordId === current.id) void ctlRef.current!.grade(msg.correct ?? true)
          break
        case 'flip':
          setFlipped(f => !f)
          break
        case 'mask':
          setMaskWord(!!msg.on)
          break
        case 'mark':
          if (current && msg.wordId === current.id) void toggleMark(current.id)
          break
        case 'speak':
          if (current) void speak(current.spelling)
          break
        case 'continue':
          ctlRef.current!.continueReview()
          break
        case 'restart':
          ctlRef.current!.restartAll()
          break
        case 'hello':
          ctlRef.current!.broadcastState()
          break
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlReady, remoteOn, current?.id])

  // 手机端（遥控端）：接收电脑广播的会话状态照此渲染
  useEffect(() => {
    if (!controlReady || !remoteOn) return
    return onControl(msg => {
      if (msg.type === 'state' && msg.state) setRemoteState(msg.state)
    })
  }, [controlReady, remoteOn])

  // 开启遥控时请求电脑当前状态；电脑没开复习页则手机显示等待
  useEffect(() => {
    if (controlReady && remoteOn) {
      setRemoteState(null)
      void sendControl({ type: 'cmd', action: 'hello' })
    }
  }, [controlReady, remoteOn])

  if (!srsLoaded) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">🔁 单词复习</h1>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
          <p className="text-slate-500">正在加载学习数据…</p>
        </div>
      </div>
    )
  }

  // ---- 手机遥控端：只显示电脑广播的状态，本机只发指令、不发声（声音由电脑播放） ----
  if (remoteOn) {
    const rs = remoteState
    const send = (m: ControlPayload) => void sendControl(m)

    if (!rs) {
      return (
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">📱 手机遥控 · 复习</h1>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center space-y-4">
            <p className="text-slate-500 whitespace-pre-line">
              {'等待电脑端响应…\n请确认：电脑已打开「单词复习」页，且手机与电脑都通过同一局域网服务器地址访问。'}
            </p>
            <button onClick={() => setRemoteOn(false)} className="bg-slate-600 text-white px-4 py-2 rounded-lg text-sm">关闭遥控</button>
          </div>
        </div>
      )
    }

    if (rs.finished) {
      return (
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">📱 手机遥控 · 复习</h1>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center space-y-4">
            <div className="text-5xl">🎉</div>
            <p className="text-slate-600">本轮复习完成 · 复习 {rs.doneCount} 个，答对 {rs.sessionCorrect} 个</p>
            <div className="flex flex-col gap-2">
              {rs.hasMore && (
                <button onClick={() => send({ type: 'cmd', action: 'continue' })} className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm">继续复习下一批</button>
              )}
              <button onClick={() => send({ type: 'cmd', action: 'restart' })} className="border border-slate-300 px-4 py-2.5 rounded-lg text-sm text-slate-600">重新复习一轮</button>
              <button onClick={() => setRemoteOn(false)} className="border border-slate-300 px-4 py-2.5 rounded-lg text-sm text-slate-600">关闭遥控</button>
            </div>
          </div>
        </div>
      )
    }

    const rw = ALL_WORDS.find(w => w.id === rs.wordId)
    if (!rw) {
      return (
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">📱 手机遥控 · 复习</h1>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
            <p className="text-slate-500">等待电脑端响应…</p>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-2xl font-bold">📱 手机遥控 · 复习</h1>
          <button onClick={() => setRemoteOn(false)} className="shrink-0 text-sm text-slate-500">关闭遥控</button>
        </div>
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>{rs.progress}</span>
          <span>{rs.marked ? '⭐ 重点' : ''}</span>
        </div>

        <div
          className="min-h-72 bg-white rounded-2xl shadow-md border border-slate-200 flex flex-col p-6 cursor-pointer select-none"
          onClick={() => send({ type: 'cmd', action: 'flip' })}
        >
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            {rs.maskWord ? (
              <>
                <div className="text-sm text-slate-500 mb-2">{rw.pos ?? ''}</div>
                <div className="text-2xl font-semibold text-blue-900 leading-relaxed">{rw.meanings.join('；')}</div>
                {rs.flipped && (
                  <div className="mt-6 w-full border-t border-slate-100 pt-5">
                    <div className="text-4xl font-bold text-slate-800">{rw.spelling}</div>
                    {rw.phonetic && <div className="text-slate-400 mt-2">{rw.phonetic}</div>}
                    {rw.examples[0] && (
                      <div className="mt-3 text-sm text-slate-600">
                        <div>{rw.examples[0].en}</div>
                        <div className="text-slate-400 mt-1">{rw.examples[0].zh}</div>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="text-4xl font-bold text-slate-800">{rw.spelling}</div>
                {rw.phonetic && <div className="text-slate-400 mt-2">{rw.phonetic}</div>}
                {rs.flipped && (
                  <div className="mt-6 w-full border-t border-slate-100 pt-5">
                    <div className="text-sm text-slate-500">{rw.pos ?? ''} {rw.phonetic ?? ''}</div>
                    <div className="text-xl font-semibold text-blue-900">{rw.meanings.join('；')}</div>
                    {rw.examples[0] && (
                      <div className="mt-3 text-sm text-slate-600">
                        <div>{rw.examples[0].en}</div>
                        <div className="text-slate-400 mt-1">{rw.examples[0].zh}</div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
          <div className="text-center text-xs text-slate-300 pt-3">
            {rs.flipped ? '点击收起' : rs.maskWord ? '点击显示单词' : '点击显示释义'}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => send({ type: 'cmd', action: 'mark', wordId: rw.id })}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
              rs.marked ? 'bg-amber-50 border-amber-300 text-amber-700' : 'border-slate-300 text-slate-600 hover:bg-slate-50'
            }`}
          >{rs.marked ? '⭐ 已重点记忆' : '☆ 标记重点记忆'}</button>
          <button onClick={() => send({ type: 'cmd', action: 'speak' })} className="flex-1 border border-slate-300 py-2.5 rounded-lg text-sm text-slate-600">🔊 电脑朗读</button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button onClick={() => send({ type: 'cmd', action: 'grade', wordId: rw.id, correct: false })} className="bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-medium">不认识</button>
          <button onClick={() => send({ type: 'cmd', action: 'grade', wordId: rw.id, correct: true })} className="bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-medium">模糊</button>
          <button onClick={() => send({ type: 'cmd', action: 'grade', wordId: rw.id, correct: true })} className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium">认识</button>
        </div>
      </div>
    )
  }

  if (queue.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">🔁 单词复习</h1>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center space-y-4">
          <p className="text-slate-500">还没有已学的单词，先去「开始学习」学一些吧</p>
          <div className="flex justify-center gap-3">
            <Link to="/study" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">去学习</Link>
            <button onClick={() => navigate('/words')} className="border border-slate-300 px-4 py-2 rounded-lg text-sm text-slate-600">回单词列表</button>
          </div>
        </div>
      </div>
    )
  }

  if (finished) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">本轮复习完成 🎉</h1>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center space-y-4">
          <div className="text-5xl">{doneCount > 0 && sessionCorrect / doneCount >= 0.8 ? '🌟' : '💪'}</div>
          <p className="text-slate-600">本轮复习 {doneCount} 个单词，答对 {sessionCorrect} 个</p>
          <p className="text-sm text-slate-500">
            今日已复习 {reviewedToday} 个词{markedTotal > 0 && <> · 仍有 ⭐ {markedTotal} 个重点记忆</>}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-2">
            {hasMore && (
              <button onClick={continueReview} className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium">继续复习下一批（剩 {pool.length - batchStart - BATCH_SIZE} 个）</button>
            )}
            <button onClick={restartAll} className="border border-blue-300 text-blue-600 px-4 py-2.5 rounded-lg text-sm">重新复习一轮</button>
            <button onClick={() => navigate('/words')} className="border border-slate-300 px-4 py-2.5 rounded-lg text-sm text-slate-600">回单词列表</button>
          </div>
        </div>
      </div>
    )
  }

  if (!current) return null

  const marked = !!states[current.id]?.marked
  const dictationCorrect = normalizeDictation(dictation) === normalizeDictation(current.spelling)

  // 手机遥控开关（仅局域网服务器可达时显示）
  const remoteBar = controlReady ? (
    <div className={`flex items-center justify-between gap-3 border rounded-lg px-3 py-2 text-sm ${remoteOn ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200'}`}>
      <span className="text-slate-600">
        {remoteOn
          ? '📱 遥控模式：本机静音，点「认识/模糊/不认识」会同步操作电脑（电脑端请保持此页打开）'
          : '📡 已连接局域网，可开启手机遥控'}
      </span>
      <button
        onClick={() => setRemoteOn(o => !o)}
        className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium ${remoteOn ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'}`}
      >{remoteOn ? '关闭遥控' : '开启遥控'}</button>
    </div>
  ) : null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">🔁 单词复习</h1>
        <button onClick={() => navigate('/words')} className="shrink-0 text-sm text-slate-500 hover:text-slate-700">退出</button>
      </div>

      <div className="text-sm text-slate-500">
        今日已复习 <span className="font-semibold text-slate-700">{reviewedToday}</span> 个词
        {markedTotal > 0 && <span className="ml-2 text-amber-600">· ⭐ 重点 {markedTotal} 个</span>}
      </div>

      {remoteBar}

      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>{progressText}{markedInQueue > 0 && <span className="ml-2 text-amber-600">本批含 ⭐ {markedInQueue} 个重点</span>}</span>
        <div className="flex items-center gap-3">
          {maskWord && (
            <label className="flex items-center gap-1.5 text-slate-600">
              <input
                type="checkbox"
                checked={dictationOn}
                onChange={e => { setDictationOn(e.target.checked); setDictation('') }}
                className="h-4 w-4 rounded border-slate-300"
              />
              单词默写
            </label>
          )}
          <button
            onClick={() => { setMaskWord(m => !m); setFlipped(false); setDictation('') }}
            className={maskWord ? 'text-amber-600 font-medium' : 'text-blue-600'}
            title="遮罩单词：正面只显示中文释义，点击才显示英文单词"
          >{maskWord ? '👁 单词' : '🔒 单词'}</button>
        </div>
      </div>

      <div
        className="min-h-72 bg-white rounded-2xl shadow-md border border-slate-200 flex flex-col p-6 cursor-pointer select-none"
        onClick={() => setFlipped(f => !f)}
      >
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          {maskWord ? (
            <>
              <div className="text-sm text-slate-500 mb-2">{current.pos ?? ''}</div>
              <div className="text-2xl font-semibold text-blue-900 leading-relaxed">{current.meanings.join('；')}</div>
              {dictationOn && (
                <div className="mt-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                  <input
                    value={dictation}
                    onChange={e => setDictation(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === ' ' && !e.repeat && dictationCorrect) {
                        e.preventDefault()
                        void grade(true)
                      }
                    }}
                    className={`w-full rounded-lg border px-4 py-3 text-center text-lg font-semibold outline-none ${
                      dictationCorrect ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-300 focus:border-blue-500'
                    }`}
                    placeholder="默写英文单词"
                    autoComplete="off"
                    autoCapitalize="none"
                    spellCheck={false}
                  />
                  <div className={`mt-2 text-xs ${dictationCorrect ? 'text-green-600' : 'text-slate-400'}`}>
                    {dictationCorrect ? '默写正确，按空格选中“认识”' : '输入正确后按空格进入下一个'}
                  </div>
                </div>
              )}
              {flipped && (
                <div className="mt-6 w-full border-t border-slate-100 pt-5">
                  <div className="text-4xl font-bold text-slate-800">{current.spelling}</div>
                  {current.phonetic && <div className="text-slate-400 mt-2">{current.phonetic}</div>}
                  {current.examples[0] && (
                    <div className="mt-3 text-sm text-slate-600">
                      <div>{current.examples[0].en}</div>
                      <div className="text-slate-400 mt-1">{current.examples[0].zh}</div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="text-4xl font-bold text-slate-800">{current.spelling}</div>
              {current.phonetic && <div className="text-slate-400 mt-2">{current.phonetic}</div>}
              {flipped && (
                <div className="mt-6 w-full border-t border-slate-100 pt-5">
                  <div className="text-sm text-slate-500">{current.pos ?? ''} {current.phonetic ?? ''}</div>
                  <div className="text-xl font-semibold text-blue-900">{current.meanings.join('；')}</div>
                  {current.examples[0] && (
                    <div className="mt-3 text-sm text-slate-600">
                      <div>{current.examples[0].en}</div>
                      <div className="text-slate-400 mt-1">{current.examples[0].zh}</div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
        <div className="text-center text-xs text-slate-300 pt-3">
          {flipped ? '点击收起' : maskWord ? '点击显示单词' : '点击显示释义'}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); void toggleMark(current.id) }}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
            marked ? 'bg-amber-50 border-amber-300 text-amber-700' : 'border-slate-300 text-slate-600 hover:bg-slate-50'
          }`}
        >{marked ? '⭐ 已重点记忆' : '☆ 标记重点记忆'}</button>
        <button onClick={() => speak(current.spelling)} className="flex-1 border border-slate-300 py-2.5 rounded-lg text-sm text-slate-600">🔊 朗读</button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <button onClick={() => grade(false)} className="bg-red-500 hover:bg-red-600 active:bg-red-700 text-white py-3 rounded-xl font-medium">不认识</button>
        <button onClick={() => grade(true)} className="bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white py-3 rounded-xl font-medium">模糊</button>
        <button onClick={() => grade(true)} className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white py-3 rounded-xl font-medium">认识</button>
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

function normalizeDictation(s: string): string {
  return s.trim().toLowerCase()
}
