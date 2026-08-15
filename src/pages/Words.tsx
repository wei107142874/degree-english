import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ALL_WORDS, TIER_LABELS, searchWords } from '../data/words'
import { useSrsStore } from '../store/useSrsStore'
import { Card, ProgressBar, speak } from '../components/common'

const PAGE_SIZE = 100

export default function Words() {
  const [q, setQ] = useState('')
  const [tier, setTier] = useState<number | null>(null)
  const [page, setPage] = useState(0)
  const states = useSrsStore(s => s.states)

  const results = useMemo(() => searchWords(q, tier), [q, tier])
  const pageItems = results.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const statesList = useSrsStore(s => s.states)
  const learned = Object.values(statesList).filter(s => s.level >= 1).length
  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE))

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

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {pageItems.length === 0 && <div className="p-8 text-center text-slate-400">没有找到匹配的单词</div>}
        <ul className="divide-y divide-slate-100">
          {pageItems.map(w => {
            const st = states[w.id]
            return (
              <li key={w.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{w.spelling}</span>
                    {w.phonetic && <span className="text-xs text-slate-400">{w.phonetic}</span>}
                    {w.pos && <span className="text-xs text-blue-500">{w.pos}</span>}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      w.tier === 1 ? 'bg-red-100 text-red-600' : w.tier === 2 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'
                    }`}>{TIER_LABELS[w.tier]}</span>
                    {st && st.level >= 1 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-600">已学 Lv{st.level}</span>}
                  </div>
                  <div className="text-sm text-slate-500 truncate">{w.meanings.join('；')}</div>
                </div>
                <button onClick={() => speak(w.spelling)} className="text-slate-400 hover:text-blue-600 text-lg" title="朗读">🔊</button>
              </li>
            )
          })}
        </ul>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm disabled:opacity-40">上一页</button>
          <span className="px-3 py-1.5 text-sm text-slate-500">{page + 1} / {totalPages}</span>
          <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm disabled:opacity-40">下一页</button>
        </div>
      )}
    </div>
  )
}
