import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ALL_WORDS } from '../data/words'
import type { ReviewGrade, StudyMode, Word } from '../types'
import { useSrsStore } from '../store/useSrsStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { speak } from '../components/common'
import { WORD_ORDER_SEED, buildOrderIndex } from '../lib/wordOrder'
import { dailyNewWordsPlan, inferRecognitionGrade, isRememberedGrade, todayStamp } from '../lib/srs'
import { buildTodayBatch } from '../lib/studyBatch'
import { onControl, sendControl, useControlAvailable } from '../control/remote'
import type { ControlPayload, RemoteState } from '../control/remote'
import { baiduTranslateUrl } from '../lib/dictionary'

type Mode = StudyMode

const MODE_LABELS: Record<Mode, string> = {
  flashcard: '闪卡',
  quiz: '看中文选英文',
  meaning: '看英文选中文',
  cloze: '例句挖空',
}

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
  const [retryCounts, setRetryCounts] = useState<Record<string, number>>({})
  const cardShownAtRef = useRef(Date.now())
  const leftControlPressedRef = useRef(false)
  const leftControlComboRef = useRef(false)
  // 遮罩单词：正面只显示中文释义，翻面才显示英文（回忆拼写用）
  const [maskWord, setMaskWord] = useState(false)
  // 手机遥控模式：本机静音，点认识/不认识时把指令发给电脑
  const [remoteOn, setRemoteOn] = useState(false)
  const [remoteState, setRemoteState] = useState<RemoteState | null>(null)
  const controlReady = useControlAvailable()

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

  // 固定随机词序：种子持久化在服务器设置里（PostgreSQL + 备份），
  // 电脑与手机同种子 → 完全一致的顺序，且不会随会话变化。
  const orderIndex = useMemo(
    () => buildOrderIndex(ALL_WORDS, settings.wordOrderSeed ?? WORD_ORDER_SEED),
    [settings.wordOrderSeed],
  )

  const dueTotal = dueWords.length
  const newWordsPlan = useMemo(
    () => dailyNewWordsPlan(settings.dailyNewWords || 30, dueTotal),
    [settings.dailyNewWords, dueTotal],
  )

  // 今日批次：今天新学的 ∪ 按固定随机序补齐到动态每日目标。
  // 批次不随会话变化 —— 退出重进后仍是同一批，进度从上次继续。
  const dailyGoal = newWordsPlan.recommended
  const today = todayStamp()
  const { batch, done: batchDone, remaining: fresh } = useMemo(
    () => buildTodayBatch(ALL_WORDS, states, orderIndex, dailyGoal, today),
    [states, orderIndex, dailyGoal, today],
  )

  const batchTotal = batch.length
  const batchAllDone = batchTotal > 0 && batchDone >= batchTotal
  const dueCount = Math.min(dueTotal, 50)
  const progressLabel = batchTotal === 0
    ? dailyGoal === 0 ? '今日先清复习债' : '全部单词已学完'
    : batchAllDone
      ? `今日新词 ${batchTotal} 个已完成 ✓`
      : `新词 第 ${batchDone + 1} / ${batchTotal} 个`
  const progressSummary = progressLabel + (dueCount > 0 ? ` · 复习 ${dueCount} 个到期` : '')
  const newWordsPlanNote = newWordsPlan.recommended === newWordsPlan.base
    ? newWordsPlan.reason
    : `今日新词 ${newWordsPlan.recommended}/${newWordsPlan.base} · ${newWordsPlan.reason}`

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
    setRetryCounts({})
    cardShownAtRef.current = Date.now()
  }

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode)
    buildQueue(nextMode)
  }

  // 等 SRS 与设置加载完成后再构建队列，避免用空状态建队导致重复/缺词
  useEffect(() => {
    if (srsLoaded && settingsLoaded) buildQueue(mode)
  }, [srsLoaded, settingsLoaded]) // eslint-disable-line

  const current = queue[idx]

  useEffect(() => {
    cardShownAtRef.current = Date.now()
  }, [current?.id])

  // 自动朗读：闪卡模式下每出现一张新卡片（含进入学习的第一张）自动发音一遍。
  // 自测模式、遮罩单词、手机遥控（本机静音，由电脑朗读）时不自动读。
  useEffect(() => {
    if (mode === 'flashcard' && !maskWord && !remoteOn && current) {
      void speak(current.spelling)
    }
  }, [current?.id, mode, maskWord, remoteOn]) // eslint-disable-line

  // 自测选项缓存（保证与显示一致）
  const [optionsCache, setOptionsCache] = useState<Word[]>([])
  useEffect(() => {
    if (!current) return
    const others = shuffle(ALL_WORDS.filter(w => w.id !== current.id)).slice(0, 3)
    setOptionsCache(shuffle([current, ...others]))
    setQuizChoice(null)
  }, [current?.id]) // eslint-disable-line

  const correctIdx = useMemo(() => {
    if (mode === 'flashcard' || !current) return -1
    return optionsCache.findIndex(o => o.id === current.id)
  }, [mode, current, optionsCache])
  const isQuizMode = mode !== 'flashcard'
  const quizTitle = isQuizMode ? MODE_LABELS[mode] : ''
  const quizPrompt = current && isQuizMode ? quizPromptFor(mode, current) : ''
  const correctAnswerText = current && isQuizMode ? quizAnswerText(mode, current) : ''

  const next = () => {
    if (idx + 1 >= queue.length) { setFinished(true); return }
    setIdx(i => i + 1)
    setFlipped(false)
  }

  const responseMs = () => Math.max(0, Date.now() - cardShownAtRef.current)

  const commandGrade = (msg: Extract<ControlPayload, { type: 'cmd' }>): { grade: ReviewGrade; responseMs?: number } => {
    if (msg.grade) return { grade: msg.grade, responseMs: msg.responseMs }
    if (msg.correct === false) return { grade: 'again', responseMs: msg.responseMs }
    const ms = msg.responseMs ?? responseMs()
    return { grade: inferRecognitionGrade(ms), responseMs: ms }
  }

  const queueRetry = (word: Word, grade: ReviewGrade) => {
    if (grade !== 'again' && grade !== 'hard') return
    const tried = retryCounts[word.id] ?? 0
    const limit = grade === 'again' ? 2 : 1
    if (tried >= limit) return
    setRetryCounts(prev => ({ ...prev, [word.id]: (prev[word.id] ?? 0) + 1 }))
    setQueue(prev => {
      const copy = [...prev]
      const delay = grade === 'again' ? 8 : 20
      const insertAt = Math.min(copy.length, idx + delay + 1)
      copy.splice(insertAt, 0, word)
      return copy
    })
  }

  // 界面只保留「认识/不认识」；认识的熟练度由反应时间自动推断。
  const grade = async (nextGrade: ReviewGrade, ms?: number) => {
    if (!current) return
    await review(current.id, nextGrade, ms)
    if (isRememberedGrade(nextGrade)) setSessionCorrect(c => c + 1)
    queueRetry(current, nextGrade)
    setDoneCount(c => c + 1)
    next()
  }

  const gradeKnown = () => {
    const ms = responseMs()
    void grade(inferRecognitionGrade(ms), ms)
  }

  const gradeUnknown = () => {
    void grade('again', responseMs())
  }

  useEffect(() => {
    if (mode !== 'flashcard' || remoteOn || finished || !current) return

    const resetLeftControl = () => {
      leftControlPressedRef.current = false
      leftControlComboRef.current = false
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'KeyL' && event.ctrlKey && !event.altKey && !event.metaKey) {
        event.preventDefault()
        leftControlComboRef.current = true
        if (!event.repeat) void speak(current.spelling)
        return
      }

      if (event.code === 'ControlLeft') {
        if (!event.repeat) {
          leftControlPressedRef.current = true
          leftControlComboRef.current = false
        }
        return
      }

      if (leftControlPressedRef.current) {
        leftControlComboRef.current = true
      }
    }

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code !== 'ControlLeft') return

      const shouldGradeUnknown = leftControlPressedRef.current && !leftControlComboRef.current
      resetLeftControl()

      if (shouldGradeUnknown) {
        event.preventDefault()
        gradeUnknown()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', resetLeftControl)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', resetLeftControl)
    }
  }, [current, finished, mode, remoteOn])

  // 自测答题
  const answerQuiz = async (choice: number) => {
    if (quizChoice !== null || !current) return
    setQuizChoice(choice)
    const correct = choice === correctIdx
    const ms = responseMs()
    const nextGrade = correct ? inferRecognitionGrade(ms) : 'again'
    await review(current.id, nextGrade, ms)
    if (correct) setSessionCorrect(c => c + 1)
    queueRetry(current, nextGrade)
    setDoneCount(c => c + 1)
    setTimeout(() => { setQuizChoice(null); next() }, 1600)
  }

  // ---- 手机遥控：完整会话状态镜像 ----
  // 电脑端（显示端）把完整状态广播给手机：当前词/翻面/模式/遮罩/自测选项/进度。
  // 状态每次变化都发一次，另每 5 秒心跳兜底，防止漏包导致两边不一致。
  const broadcastState = () => {
    if (!current) return
    void sendControl({
      type: 'state',
      state: {
        mode,
        wordId: current.id,
        flipped,
        maskWord,
        idx: idx + 1,
        total: queue.length,
        quizOptions: optionsCache.map(o => o.id),
        quizChoice,
        quizCorrectIdx: quizChoice !== null ? correctIdx : -1, // 作答前不泄露答案
        finished,
        doneCount,
        sessionCorrect,
        progress: progressSummary,
      },
    })
  }

  useEffect(() => {
    if (!controlReady || remoteOn || !current) return
    broadcastState()
    const t = setInterval(broadcastState, 5000)
    return () => clearInterval(t)
  }, [controlReady, remoteOn, current?.id, mode, flipped, maskWord, idx, queue.length, quizChoice, correctIdx, optionsCache, finished, doneCount, sessionCorrect, progressSummary]) // eslint-disable-line

  // 电脑端：接收手机指令并执行（本机为遥控端时不接收，避免双重操作）
  useEffect(() => {
    if (!controlReady || remoteOn) return
    return onControl(msg => {
      if (msg.type !== 'cmd') return
      switch (msg.action) {
        case 'grade':
          if (current && msg.wordId === current.id) {
            const inferred = commandGrade(msg)
            void grade(inferred.grade, inferred.responseMs)
          }
          break
        case 'flip':
          setFlipped(f => !f)
          break
        case 'mode':
          if (msg.mode && isStudyMode(msg.mode)) switchMode(msg.mode)
          break
        case 'mask':
          setMaskWord(!!msg.on)
          break
        case 'quiz':
          if (msg.choice != null && quizChoice === null && current) void answerQuiz(msg.choice)
          break
        case 'speak':
          if (current) void speak(current.spelling)
          break
        case 'hello':
          broadcastState()
          break
      }
    })
  }, [controlReady, remoteOn, current?.id, quizChoice]) // eslint-disable-line

  // 手机端（遥控端）：接收电脑广播的会话状态照此渲染
  useEffect(() => {
    if (!controlReady || !remoteOn) return
    return onControl(msg => {
      if (msg.type === 'state' && msg.state) setRemoteState(msg.state)
    })
  }, [controlReady, remoteOn])

  // 开启遥控时请求电脑当前状态；电脑没开背单词页则手机显示等待
  useEffect(() => {
    if (controlReady && remoteOn) {
      setRemoteState(null)
      void sendControl({ type: 'cmd', action: 'hello' })
    }
  }, [controlReady, remoteOn])

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

  // ---- 手机遥控端：只显示电脑广播的状态，本机只发指令、不发声（声音由电脑播放） ----
  if (remoteOn) {
    const rs = remoteState
    const rw = rs ? ALL_WORDS.find(w => w.id === rs.wordId) : undefined
    const send = (m: ControlPayload) => void sendControl(m)

    if (!rs || !rw || rs.finished) {
      return (
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">📱 手机遥控</h1>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center space-y-4">
            <p className="text-slate-500 whitespace-pre-line">
              {rs?.finished
                ? '本次学习已完成 🎉'
                : '等待电脑端响应…\n请确认：电脑已打开「开始学习」页，且手机与电脑都通过同一局域网服务器地址访问。'}
            </p>
            <button onClick={() => setRemoteOn(false)} className="bg-slate-600 text-white px-4 py-2 rounded-lg text-sm">关闭遥控</button>
          </div>
        </div>
      )
    }

    // 自测模式：选项由电脑广播，答题结果也来自电脑
    if (rs.mode !== 'flashcard') {
      return (
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">📱 手机遥控 · {MODE_LABELS[rs.mode]}</h1>
          <div className="text-sm text-slate-500">{rs.progress}</div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
            <div className="text-2xl font-bold mb-6 whitespace-pre-line">{quizPromptFor(rs.mode, rw)}</div>
            <div className="grid gap-3">
              {rs.quizOptions.map((id, i) => {
                const opt = ALL_WORDS.find(w => w.id === id)
                if (!opt) return null
                const answered = rs.quizChoice !== null
                return (
                  <button
                    key={id}
                    onClick={() => { if (!answered) send({ type: 'cmd', action: 'quiz', choice: i }) }}
                    className={`px-4 py-3 rounded-lg border text-left font-medium transition ${
                      !answered
                        ? 'border-slate-300 hover:border-blue-500 hover:bg-blue-50'
                        : i === rs.quizCorrectIdx
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : rs.quizChoice === i
                            ? 'border-red-500 bg-red-50 text-red-600'
                            : 'border-slate-200 opacity-60'
                    }`}
                  >
                    {quizOptionText(rs.mode, opt)}
                    {quizOptionSubtext(rs.mode, opt) && <span className="text-xs text-slate-400 ml-2">{quizOptionSubtext(rs.mode, opt)}</span>}
                  </button>
                )
              })}
            </div>
            {rs.quizChoice !== null && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-500">
                <span>{rs.quizChoice === rs.quizCorrectIdx ? '✅ 回答正确' : '❌ 正确答案：' + quizAnswerText(rs.mode, rw)}</span>
                <a
                  href={baiduTranslateUrl(rw.spelling)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:text-blue-700"
                >
                  查看 {rw.spelling} 的详细解释 ↗
                </a>
              </div>
            )}
          </div>
          <button onClick={() => send({ type: 'cmd', action: 'mode', mode: 'flashcard' })} className="w-full border border-slate-300 py-2.5 rounded-lg text-sm text-slate-600">切到闪卡模式</button>
        </div>
      )
    }

    // 闪卡模式：卡片/翻面/遮罩状态与电脑完全一致
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">📱 手机遥控</h1>
        <div className="text-sm text-slate-500">{rs.progress}</div>

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

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <button onClick={() => send({ type: 'cmd', action: 'speak' })} className="flex-1 border border-slate-300 py-2.5 rounded-lg text-sm text-slate-600">🔊 电脑朗读</button>
          <button onClick={() => send({ type: 'cmd', action: 'mask', on: !rs.maskWord })} className="flex-1 border border-slate-300 py-2.5 rounded-lg text-sm text-slate-600">{rs.maskWord ? '👁 单词' : '🔒 单词'}</button>
          <button onClick={() => send({ type: 'cmd', action: 'mode', mode: 'quiz' })} className="flex-1 border border-slate-300 py-2.5 rounded-lg text-sm text-slate-600">切到自测</button>
          {(!rs.maskWord || rs.flipped) && (
            <a
              href={baiduTranslateUrl(rw.spelling)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-lg border border-blue-200 py-2.5 text-center text-sm font-medium text-blue-600 hover:bg-blue-50"
            >
              百度详情 ↗
            </a>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => send({ type: 'cmd', action: 'grade', wordId: rw.id, grade: 'again' })} className="bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-medium">不认识</button>
          <button onClick={() => send({ type: 'cmd', action: 'grade', wordId: rw.id })} className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium">认识</button>
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

  // 手机遥控开关（仅局域网服务器可达时显示）
  const remoteBar = controlReady ? (
    <div className={`flex items-center justify-between gap-3 border rounded-lg px-3 py-2 text-sm ${remoteOn ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200'}`}>
      <span className="text-slate-600">
        {remoteOn
          ? '📱 遥控模式：本机静音，点「认识/不认识」会同步操作电脑（电脑端请保持此页打开）'
          : '📡 已连接局域网，可开启手机遥控'}
      </span>
      <button
        onClick={() => setRemoteOn(o => !o)}
        className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium ${remoteOn ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'}`}
      >{remoteOn ? '关闭遥控' : '开启遥控'}</button>
    </div>
  ) : null

  // ---- 考试化自测模式 ----
  if (isQuizMode) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{quizTitle}</h1>
        {remoteBar}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3 text-sm text-slate-500">
            <span>{progressSummary}</span>
            <span className="text-xs text-slate-400">{newWordsPlanNote}</span>
          </div>
          <ModeTabs mode={mode} onChange={switchMode} />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="text-2xl font-bold mb-6 whitespace-pre-line">{quizPrompt}</div>
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
                {quizOptionText(mode, o)}
                {quizOptionSubtext(mode, o) && <span className="text-xs text-slate-400 ml-2">{quizOptionSubtext(mode, o)}</span>}
              </button>
            ))}
          </div>
          {quizChoice !== null && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-500">
              <span>{quizChoice === correctIdx ? '✅ 回答正确' : '❌ 正确答案：' + correctAnswerText}</span>
              <a
                href={baiduTranslateUrl(current.spelling)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                查看 {current.spelling} 的详细解释 ↗
              </a>
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
      {remoteBar}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3 text-sm text-slate-500">
          <span>{progressSummary}</span>
          <span className="text-xs text-slate-400">{newWordsPlanNote}</span>
        </div>
        <ModeTabs mode={mode} onChange={switchMode} />
        <button
          onClick={() => { setMaskWord(m => !m); setFlipped(false) }}
          className={`rounded-lg border px-3 py-2 text-sm font-medium ${maskWord ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-slate-200 bg-white text-slate-600'}`}
          title="遮罩单词：正面只显示中文释义，翻面才显示英文单词"
        >{maskWord ? '👁 显示单词' : '🔒 遮住单词'}</button>
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
        <button onClick={(e) => { e.stopPropagation(); speak(current.spelling) }} className="flex-1 border border-slate-300 py-2.5 rounded-lg text-sm text-slate-600">🔊 朗读</button>
        {(!maskWord || flipped) && (
          <a
            href={baiduTranslateUrl(current.spelling)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-lg border border-blue-200 py-2.5 text-center text-sm font-medium text-blue-600 hover:bg-blue-50"
          >
            百度详情 ↗
          </a>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={gradeUnknown} className="bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-medium">不认识</button>
        <button onClick={gradeKnown} className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium">认识</button>
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

function ModeTabs({ mode, onChange }: { mode: Mode; onChange: (mode: Mode) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {(Object.keys(MODE_LABELS) as Mode[]).map(m => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
            mode === m
              ? 'border-blue-600 bg-blue-600 text-white'
              : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50'
          }`}
        >
          {MODE_LABELS[m]}
        </button>
      ))}
    </div>
  )
}

function isStudyMode(mode: string): mode is Mode {
  return mode === 'flashcard' || mode === 'quiz' || mode === 'meaning' || mode === 'cloze'
}

function quizPromptFor(mode: Mode, word: Word): string {
  if (mode === 'meaning') return word.spelling
  if (mode === 'cloze') return clozeSentence(word)
  return word.meanings.join('；')
}

function quizOptionText(mode: Mode, word: Word): string {
  return mode === 'meaning' ? word.meanings.join('；') : word.spelling
}

function quizOptionSubtext(mode: Mode, word: Word): string {
  if (mode === 'meaning') return [word.pos, word.phonetic].filter(Boolean).join(' ')
  return word.phonetic ?? ''
}

function quizAnswerText(mode: Mode, word: Word): string {
  return mode === 'meaning' ? word.meanings.join('；') : word.spelling
}

function clozeSentence(word: Word): string {
  const pattern = new RegExp(`\\b${escapeRegExp(word.spelling)}\\b`, 'i')
  const example = word.examples.map(e => e.en).find(text => pattern.test(text))
  if (!example) return `根据释义选择单词\n${word.meanings.join('；')}`
  return example.replace(pattern, '_____')
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
