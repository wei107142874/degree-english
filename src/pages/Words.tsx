import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ALL_WORDS, TIER_LABELS, searchWords } from '../data/words'
import type { Word } from '../types'
import { useSrsStore } from '../store/useSrsStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { WORD_ORDER_SEED, buildOrderIndex, seededShuffle } from '../lib/wordOrder'
import { badgeLevel, todayStamp, countReviewedToday, summarizeWordLearning } from '../lib/srs'
import { ProgressBar, speak } from '../components/common'
import { baiduTranslateUrl } from '../lib/dictionary'

type LearnedFilter = 'all' | 'new' | 'learned'

const PAGE_SIZE = 80

const learnedLabels: Record<LearnedFilter, string> = {
  all: '全部',
  new: '未学',
  learned: '已学',
}

export default function Words() {
  const [q, setQ] = useState('')
  const deferredQ = useDeferredValue(q)
  const [tier, setTier] = useState<number | null>(null)
  const [learnedFilter, setLearnedFilter] = useState<LearnedFilter>('all')
  const [markedOnly, setMarkedOnly] = useState(false)
  const [markedSnapshot, setMarkedSnapshot] = useState<Set<string>>(new Set())
  const [localShuffleSeed, setLocalShuffleSeed] = useState<string | null>(null)
  const [reverseOrder, setReverseOrder] = useState(false)
  const [maskMean, setMaskMean] = useState(false)
  const [maskWord, setMaskWord] = useState(false)
  const [revealed, setRevealed] = useState<Set<string>>(new Set())
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  const states = useSrsStore(s => s.states)
  const toggleMark = useSrsStore(s => s.toggleMark)
  const settings = useSettingsStore(s => s.settings)

  const orderedWords = useMemo(() => {
    const idx = buildOrderIndex(ALL_WORDS, settings.wordOrderSeed ?? WORD_ORDER_SEED)
    const ordered = [...ALL_WORDS].sort((a, b) => (idx.get(a.id) ?? 0) - (idx.get(b.id) ?? 0))
    return localShuffleSeed ? seededShuffle(ordered, localShuffleSeed) : ordered
  }, [settings.wordOrderSeed, localShuffleSeed])

  const results = useMemo(() => {
    const base = searchWords(deferredQ, tier, orderedWords).filter(w => {
      if (markedOnly && !markedSnapshot.has(w.id)) return false
      if (learnedFilter === 'all') return true
      const lv = states[w.id]?.level ?? 0
      return learnedFilter === 'learned' ? lv >= 1 : lv === 0
    })
    return reverseOrder ? [...base].reverse() : base
  }, [deferredQ, tier, learnedFilter, markedOnly, markedSnapshot, states, orderedWords, reverseOrder])

  const visibleResults = useMemo(() => results.slice(0, visibleCount), [results, visibleCount])
  const hasMore = visibleCount < results.length

  const wordStats = useMemo(() => summarizeWordLearning(Object.values(states)), [states])
  const learned = wordStats.learned
  const markedCount = wordStats.marked
  const reviewedToday = countReviewedToday(Object.values(states), todayStamp())
  const progressValue = learned / ALL_WORDS.length
  const activeFilterCount =
    (q.trim() ? 1 : 0) +
    (tier !== null ? 1 : 0) +
    (learnedFilter !== 'all' ? 1 : 0) +
    (markedOnly ? 1 : 0)

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
    setRevealed(new Set())
  }, [deferredQ, tier, learnedFilter, markedOnly, localShuffleSeed, reverseOrder])

  useEffect(() => {
    if (!hasMore || !loadMoreRef.current || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting) {
        setVisibleCount(count => Math.min(count + PAGE_SIZE, results.length))
      }
    }, { rootMargin: '360px 0px' })

    observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [hasMore, results.length])

  const toggleReveal = (id: string) => {
    setRevealed(prev => {
      const s = new Set(prev)
      if (s.has(id)) s.delete(id)
      else s.add(id)
      return s
    })
  }

  const toggleMarkedOnly = () => {
    const next = !markedOnly
    setMarkedOnly(next)
    setMarkedSnapshot(next ? new Set(Object.values(states).filter(s => s.marked).map(s => s.wordId)) : new Set())
  }

  const clearFilters = () => {
    setQ('')
    setTier(null)
    setLearnedFilter('all')
    setMarkedOnly(false)
    setMarkedSnapshot(new Set())
  }

  const renderWord = (w: Word, index: number) => {
    const st = states[w.id]
    const correctCount = st ? Math.max(0, st.reviewCount - st.wrongCount) : 0
    const level = badgeLevel(correctCount)
    const anyMask = maskMean || maskWord
    const showWord = !maskWord || revealed.has(w.id)
    const showMean = !maskMean || revealed.has(w.id)
    const displayIndex = index + 1

    return (
      <li
        key={w.id}
        onClick={() => { if (anyMask) toggleReveal(w.id) }}
        className={`group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 py-3 transition-all duration-150 hover:bg-slate-50 active:bg-blue-50/60 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:px-4 sm:py-3.5 ${
          anyMask ? 'cursor-pointer' : ''
        }`}
      >
        <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500 sm:flex">
          {displayIndex}
        </div>

        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            {showWord ? (
              <>
                <span className="min-w-0 max-w-full break-all text-base font-bold leading-tight text-slate-900 sm:text-lg">{w.spelling}</span>
                {w.phonetic && <span className="min-w-0 max-w-full break-all text-xs text-slate-400">{w.phonetic}</span>}
              </>
            ) : (
              <span className="text-sm font-medium text-slate-300 select-none">点击显示单词</span>
            )}
            {w.pos && <span className="shrink-0 rounded bg-blue-50 px-1.5 py-0.5 text-[11px] font-medium text-blue-600">{w.pos}</span>}
            <span className={`shrink-0 rounded px-1.5 py-0.5 text-[11px] font-medium ${
              w.tier === 1 ? 'bg-red-50 text-red-600' : w.tier === 2 ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'
            }`}>{TIER_LABELS[w.tier]}</span>
            {st && st.level >= 1 && (
              <span
                className="shrink-0 rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-600"
                title={`正确认识 ${correctCount} 次`}
              >已学{level >= 1 ? ` Lv${level}` : ''}</span>
            )}
            {st?.marked && <span className="shrink-0 rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-600">重点</span>}
            {st?.lastGrade === 'hard' && <span className="shrink-0 rounded bg-blue-50 px-1.5 py-0.5 text-[11px] font-medium text-blue-600">慢想起</span>}
            {st && (st.wrongCount >= 2 || (st.lapseCount ?? 0) >= 1) && <span className="shrink-0 rounded bg-red-50 px-1.5 py-0.5 text-[11px] font-medium text-red-600">易忘</span>}
            {st?.averageResponseMs && <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-500">{(st.averageResponseMs / 1000).toFixed(1)}s</span>}
          </div>
          {showMean ? (
            <div className="mt-1 line-clamp-2 text-sm leading-5 text-slate-500">{w.meanings.join('；')}</div>
          ) : (
            <div className="mt-1 text-sm leading-5 text-slate-300 select-none">点击显示释义</div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); void toggleMark(w.id) }}
            className={`flex h-10 w-10 items-center justify-center rounded-full text-xl leading-none transition-all active:scale-90 ${
              st?.marked ? 'bg-amber-50 text-amber-500' : 'text-slate-300 hover:bg-amber-50 hover:text-amber-400'
            }`}
            title={st?.marked ? '已标记为重点记忆，点击取消' : '标记为重点记忆'}
            aria-label={st?.marked ? '取消重点记忆标记' : '标记为重点记忆'}
            aria-pressed={!!st?.marked}
          >{st?.marked ? '★' : '☆'}</button>
          <button
            onClick={(e) => { e.stopPropagation(); speak(w.spelling) }}
            className="flex h-10 w-10 items-center justify-center rounded-full text-lg text-slate-400 transition-all hover:bg-blue-50 hover:text-blue-600 active:scale-90"
            title="朗读"
            aria-label="朗读"
          >🔊</button>
          <a
            href={baiduTranslateUrl(w.spelling)}
            target="_blank"
            rel="noopener noreferrer"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-slate-400 transition-all hover:bg-blue-50 hover:text-blue-600 active:scale-90"
            title={`查看 ${w.spelling} 的百度翻译详情`}
            aria-label={`查看 ${w.spelling} 的百度翻译详情`}
          >↗</a>
        </div>
      </li>
    )
  }

  return (
    <div className="space-y-4 lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start lg:gap-5 lg:space-y-0">
      <section className="space-y-4 lg:sticky lg:top-8">
        <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-blue-600">词库</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">背单词</h1>
            </div>
            <div className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
              {results.length} 词
            </div>
          </div>

          <div className="mt-3 sm:mt-4">
            <div className="mb-2 flex items-end justify-between">
              <div className="text-sm text-slate-500">学习进度</div>
              <div className="text-sm font-semibold text-slate-800">{learned} / {ALL_WORDS.length}</div>
            </div>
            <ProgressBar value={progressValue} />
          </div>

          <div className="mt-4 hidden grid-cols-3 gap-2 text-center sm:grid">
            <StatPill label="重点" value={markedCount} tone="amber" />
            <StatPill label="今日复习" value={reviewedToday} tone="emerald" />
            <StatPill label="筛选" value={activeFilterCount} tone="blue" />
          </div>
          <div className="mt-2 hidden grid-cols-3 gap-2 text-center sm:grid">
            <StatPill label="熟词" value={wordStats.mature} tone="emerald" />
            <StatPill label="慢反应" value={wordStats.slowRecall} tone="blue" />
            <StatPill label="易忘" value={wordStats.repeatedWrong} tone="red" />
          </div>
          <div className="mt-2 hidden rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500 sm:block">
            平均反应：{wordStats.averageResponseMs ? `${(wordStats.averageResponseMs / 1000).toFixed(1)} 秒` : '暂无数据'}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <Link to="/study" className="rounded-lg bg-blue-600 px-3 py-2.5 text-center text-sm font-semibold text-white transition-all hover:bg-blue-700 active:scale-[0.98] sm:py-3">
              开始学习
            </Link>
            <Link to="/review" className="rounded-lg bg-amber-500 px-3 py-2.5 text-center text-sm font-semibold text-white transition-all hover:bg-amber-600 active:scale-[0.98] sm:py-3">
              复习
            </Link>
            <Link to="/review?mode=marked" className="rounded-lg bg-amber-100 px-3 py-2.5 text-center text-sm font-semibold text-amber-700 transition-all hover:bg-amber-200 active:scale-[0.98] sm:py-3">
              重点复习
            </Link>
          </div>
        </div>

        <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5">
          <div className="relative">
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="搜索单词或中文..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 pr-10 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 sm:h-11"
            />
            {q && (
              <button
                onClick={() => setQ('')}
              className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 sm:right-1.5 sm:top-1.5"
                aria-label="清空搜索"
                title="清空搜索"
              >×</button>
            )}
          </div>

          <FilterBlock title="档位">
            <Chip active={tier === null} onClick={() => setTier(null)}>全部</Chip>
            {[1, 2, 3].map(t => (
              <Chip key={t} active={tier === t} onClick={() => setTier(t)}>{TIER_LABELS[t]}</Chip>
            ))}
          </FilterBlock>

          <FilterBlock title="状态">
            {(['all', 'new', 'learned'] as const).map(f => (
              <Chip key={f} active={learnedFilter === f} onClick={() => setLearnedFilter(f)}>
                {learnedLabels[f]}
              </Chip>
            ))}
          </FilterBlock>

          <FilterBlock title="排列">
            <Chip
              active={!localShuffleSeed && !reverseOrder}
              onClick={() => { setLocalShuffleSeed(null); setReverseOrder(false) }}
            >顺序</Chip>
            <Chip active={reverseOrder} onClick={() => setReverseOrder(v => !v)}>倒序</Chip>
            <Chip
              active={!!localShuffleSeed}
              onClick={() => setLocalShuffleSeed(seed => seed ? null : String(Date.now()))}
            >乱序</Chip>
          </FilterBlock>

          <div className="mt-3 grid grid-cols-3 gap-2 sm:mt-4">
            <ToggleButton active={markedOnly} onClick={toggleMarkedOnly}>收藏</ToggleButton>
            <ToggleButton active={maskMean} onClick={() => { setMaskMean(m => !m); setRevealed(new Set()) }}>释义</ToggleButton>
            <ToggleButton active={maskWord} onClick={() => { setMaskWord(m => !m); setRevealed(new Set()) }}>单词</ToggleButton>
          </div>

          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="mt-3 w-full rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 active:scale-[0.98]"
            >
              清除筛选
            </button>
          )}
        </div>
      </section>

      <section className="min-w-0 space-y-3">
        <div className="sticky top-[56px] z-10 flex items-center justify-between rounded-lg bg-white/95 px-4 py-3 shadow-sm ring-1 ring-slate-200 backdrop-blur lg:top-8">
          <div>
            <div className="text-sm font-semibold text-slate-900">单词列表</div>
            <div className="text-xs text-slate-500">
              {reverseOrder ? '倒序' : localShuffleSeed ? '乱序' : '固定顺序'} · {learnedLabels[learnedFilter]} · 已显示 {visibleResults.length} / {results.length}
            </div>
          </div>
          <button
            data-testid="words-reverse-toggle"
            onClick={() => setReverseOrder(v => !v)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-all active:scale-[0.96] ${
              reverseOrder ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            title="切换倒序排列"
          >
            {reverseOrder ? '倒序中' : '倒序'}
          </button>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
          {results.length === 0 && (
            <div className="px-6 py-12 text-center">
              <div className="text-base font-semibold text-slate-700">没有找到匹配的单词</div>
              <button onClick={clearFilters} className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700">清除筛选</button>
            </div>
          )}
          <ul className="divide-y divide-slate-100">
            {visibleResults.map(renderWord)}
          </ul>
          {hasMore && (
            <div ref={loadMoreRef} className="px-4 py-5 text-center text-xs font-medium text-slate-400">
              继续滑动加载更多
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function StatPill({ label, value, tone }: { label: string; value: React.ReactNode; tone: 'amber' | 'blue' | 'emerald' | 'red' }) {
  const toneClass = {
    amber: 'bg-amber-50 text-amber-700',
    blue: 'bg-blue-50 text-blue-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    red: 'bg-red-50 text-red-700',
  }[tone]

  return (
    <div className={`rounded-lg px-2 py-2 ${toneClass}`}>
      <div className="text-lg font-bold leading-none">{value}</div>
      <div className="mt-1 text-[11px] font-medium">{label}</div>
    </div>
  )
}

function FilterBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-3 sm:mt-4">
      <div className="mb-2 text-xs font-semibold text-slate-500">{title}</div>
      <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:overflow-visible lg:pb-0">
        {children}
      </div>
    </div>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`h-8 shrink-0 rounded-full px-3 text-sm font-medium transition-all active:scale-[0.96] sm:h-9 ${
        active ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
    >
      {children}
    </button>
  )
}

function ToggleButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`h-9 rounded-lg text-sm font-medium transition-all active:scale-[0.96] sm:h-10 ${
        active ? 'bg-amber-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
    >
      {children}
    </button>
  )
}
