import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ALL_WORDS, TIER_LABELS, searchWords } from '../data/words'
import type { Word } from '../types'
import { useSrsStore } from '../store/useSrsStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { WORD_ORDER_SEED, buildOrderIndex } from '../lib/wordOrder'
import { badgeLevel, dateOfTs, todayStamp } from '../lib/srs'
import { Card, ProgressBar, speak } from '../components/common'

const PAGE_SIZE = 100

export default function Words() {
  const [q, setQ] = useState('')
  const [tier, setTier] = useState<number | null>(null)
  const [learnedFilter, setLearnedFilter] = useState<'all' | 'new' | 'learned'>('all')
  const [page, setPage] = useState(0)
  // 遮罩模式：maskMean=遮住释义留单词；maskWord=遮住单词留释义。单击显示/再单击隐藏
  const [maskMean, setMaskMean] = useState(false)
  const [maskWord, setMaskWord] = useState(false)
  const [revealed, setRevealed] = useState<Set<string>>(new Set())
  // 已学分组折叠状态
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const states = useSrsStore(s => s.states)
  const settings = useSettingsStore(s => s.settings)

  // 列表顺序与「开始学习」一致：同一个固定随机词序（同一种子）
  const orderedWords = useMemo(() => {
    const idx = buildOrderIndex(ALL_WORDS, settings.wordOrderSeed ?? WORD_ORDER_SEED)
    return [...ALL_WORDS].sort((a, b) => (idx.get(a.id) ?? 0) - (idx.get(b.id) ?? 0))
  }, [settings.wordOrderSeed])

  const results = useMemo(() => {
    const base = searchWords(q, tier, orderedWords)
    if (learnedFilter === 'all') return base
    return base.filter(w => {
      const lv = states[w.id]?.level ?? 0
      return learnedFilter === 'learned' ? lv >= 1 : lv === 0
    })
  }, [q, tier, learnedFilter, states, orderedWords])
  const pageItems = results.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const learned = Object.values(states).filter(s => s.level >= 1).length
  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE))

  // 已学单词按学习日期分组（今天/昨天/M月D日/更早），类似百词斩
  const today = todayStamp()
  const yester = (() => { const d = new Date(); d.setDate(d.getDate() - 1); return dateOfTs(d.getTime()) })()
  const groups = useMemo(() => {
    if (learnedFilter !== 'learned') return [] as { key: string; label: string; words: Word[] }[]
    const map = new Map<string, Word[]>()
    for (const w of results) {
      const st = states[w.id]
      const key = st?.learnedAt ? dateOfTs(st.learnedAt) : 'older'
      const arr = map.get(key)
      if (arr) arr.push(w)
      else map.set(key, [w])
    }
    const keys = [...map.keys()].sort((a, b) => {
      if (a === 'older') return 1
      if (b === 'older') return -1
      return b.localeCompare(a) // YYYY-MM-DD 字符串比较 = 日期倒序
    })
    const label = (k: string): string => {
      if (k === 'older') return '更早'
      if (k === today) return '今天'
      if (k === yester) return '昨天'
      const d = new Date(k + 'T00:00:00')
      return d.getFullYear() === new Date().getFullYear()
        ? `${d.getMonth() + 1}月${d.getDate()}日`
        : `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
    }
    return keys.map(k => ({ key: k, label: label(k), words: map.get(k)! }))
  }, [results, states, learnedFilter, today, yester])

  const toggleReveal = (id: string) => {
    setRevealed(prev => {
      const s = new Set(prev)
      if (s.has(id)) s.delete(id)
      else s.add(id)
      return s
    })
  }
  const toggleCollapse = (key: string) => {
    setCollapsed(prev => {
      const s = new Set(prev)
      if (s.has(key)) s.delete(key)
      else s.add(key)
      return s
    })
  }

  const renderItem = (w: Word) => {
    const st = states[w.id]
    const cc = st ? Math.max(0, st.reviewCount - st.wrongCount) : 0
    const lv = badgeLevel(cc)
    const anyMask = maskMean || maskWord
    const showWord = !maskWord || revealed.has(w.id)
    const showMean = !maskMean || revealed.has(w.id)
    return (
      <li
        key={w.id}
        onClick={() => { if (anyMask) toggleReveal(w.id) }}
        className={`flex items-center gap-3 px-4 py-3 hover:bg-slate-50 ${anyMask ? 'cursor-pointer' : ''}`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {showWord ? (
              <>
                <span className="font-semibold text-slate-800">{w.spelling}</span>
                {w.phonetic && <span className="text-xs text-slate-400">{w.phonetic}</span>}
              </>
            ) : (
              <span className="text-sm text-slate-300 select-none">🔒 点击显示单词</span>
            )}
            {w.pos && <span className="text-xs text-blue-500">{w.pos}</span>}
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
              w.tier === 1 ? 'bg-red-100 text-red-600' : w.tier === 2 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'
            }`}>{TIER_LABELS[w.tier]}</span>
            {st && st.level >= 1 && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-600"
                title={`正确认识 ${cc} 次`}
              >已学{lv >= 1 ? ` Lv${lv}` : ''}</span>
            )}
          </div>
          {showMean ? (
            <div className="text-sm text-slate-500 truncate">{w.meanings.join('；')}</div>
          ) : (
            <div className="text-sm text-slate-300 truncate select-none">🔒 点击显示释义</div>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); speak(w.spelling) }}
          className="text-slate-400 hover:text-blue-600 text-lg"
          title="朗读"
        >🔊</button>
      </li>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">📚 背单词</h1>
        <Link to="/study" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          开始学习 →
        </Link>
      </div>

      <Card>
        <div className="text-sm text-slate-600 mb-2">已学 {learned} / {ALL_WORDS.length} 词</div>
        <ProgressBar value={learned / ALL_WORDS.length} />
      </Card>

      <div className="flex flex-wrap gap-2 items-center">
        <input
          value={q}
          onChange={e => { setQ(e.target.value); setPage(0) }}
          placeholder="搜索单词或中文…"
          className="flex-1 min-w-[180px] px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-1">
          <button
            onClick={() => { setTier(null); setPage(0) }}
            className={`px-3 py-2 rounded-lg text-sm ${
              tier === null ? 'bg-blue-600 text-white' : 'bg-white border border-slate-300 text-slate-600'
            }`}
          >全部</button>
          {[1, 2, 3].map(t => (
            <button
              key={t}
              onClick={() => { setTier(t); setPage(0) }}
              className={`px-3 py-2 rounded-lg text-sm ${
                tier === t ? 'bg-blue-600 text-white' : 'bg-white border border-slate-300 text-slate-600'
              }`}
            >{TIER_LABELS[t]}</button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-1 items-center">
        {(['all', 'new', 'learned'] as const).map(f => (
          <button
            key={f}
            onClick={() => { setLearnedFilter(f); setPage(0) }}
            className={`px-3 py-2 rounded-lg text-sm ${
              learnedFilter === f ? 'bg-green-600 text-white' : 'bg-white border border-slate-300 text-slate-600'
            }`}
          >{f === 'all' ? '全部' : f === 'new' ? '未学' : '✅ 已学'}</button>
        ))}
        <span className="mx-1 text-slate-200">|</span>
        <button
          onClick={() => { setMaskMean(m => !m); setRevealed(new Set()) }}
          className={`px-3 py-2 rounded-lg text-sm ${
            maskMean ? 'bg-amber-500 text-white' : 'bg-white border border-slate-300 text-slate-600'
          }`}
          title="开启后释义隐藏，只留英文单词，单击显示释义"
        >{maskMean ? '👁 显示释义' : '🔒 遮罩释义'}</button>
        <button
          onClick={() => { setMaskWord(m => !m); setRevealed(new Set()) }}
          className={`px-3 py-2 rounded-lg text-sm ${
            maskWord ? 'bg-amber-500 text-white' : 'bg-white border border-slate-300 text-slate-600'
          }`}
          title="开启后英文单词隐藏，只留中文释义，单击显示单词"
        >{maskWord ? '👁 显示单词' : '🔒 遮罩单词'}</button>
      </div>

      {learnedFilter === 'learned' && groups.length > 0 ? (
        // 已学视图：按日期分组
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {groups.map(g => (
            <div key={g.key}>
              <button
                onClick={() => toggleCollapse(g.key)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-700"
              >
                <span>🗓 {g.label}</span>
                <span className="text-xs font-normal text-slate-500">
                  {g.words.length} 个 {collapsed.has(g.key) ? '▸' : '▾'}
                </span>
              </button>
              {!collapsed.has(g.key) && (
                <ul className="divide-y divide-slate-100">
                  {g.words.map(renderItem)}
                </ul>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {pageItems.length === 0 && <div className="p-8 text-center text-slate-400">没有找到匹配的单词</div>}
          <ul className="divide-y divide-slate-100">
            {pageItems.map(renderItem)}
          </ul>
        </div>
      )}

      {learnedFilter !== 'learned' && totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm disabled:opacity-40">上一页</button>
          <span className="px-3 py-1.5 text-sm text-slate-500">{page + 1} / {totalPages}</span>
          <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm disabled:opacity-40">下一页</button>
        </div>
      )}
    </div>
  )
}
