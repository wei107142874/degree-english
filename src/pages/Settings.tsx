import { useState } from 'react'
import { useSettingsStore } from '../store/useSettingsStore'
import { useSrsStore } from '../store/useSrsStore'
import { useAttemptStore } from '../store/useAttemptStore'
import { usePlanStore } from '../store/usePlanStore'
import { exportAll, importAll } from '../db/db'
import { DEFAULT_SECTION_CONFIG } from '../lib/examConfig'
import { Card, speak } from '../components/common'
import { engineStatus } from '../lib/speech'

export default function Settings() {
  const settings = useSettingsStore(s => s.settings)
  const update = useSettingsStore(s => s.update)
  const resetSrs = useSrsStore(s => s.resetAll)
  const resetAttempts = useAttemptStore(s => s.resetAll)
  const resetPlan = usePlanStore(s => s.resetAll)
  const [examDate, setExamDate] = useState(settings.examDate ?? '')
  const [daily, setDaily] = useState(settings.dailyNewWords)
  const [msg, setMsg] = useState('')

  const save = async () => {
    await update({ examDate: examDate || null, dailyNewWords: daily })
    setMsg('已保存 ✅')
    setTimeout(() => setMsg(''), 2000)
  }

  const doExport = async () => {
    const data = await exportAll()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'degree-english-backup-' + new Date().toISOString().slice(0, 10) + '.json'
    a.click()
    setMsg('已导出备份文件 ✅')
    setTimeout(() => setMsg(''), 2000)
  }

  const doImport = async (file: File) => {
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      await importAll(data)
      setMsg('已导入备份 ✅ 请刷新页面生效')
      setTimeout(() => location.reload(), 1000)
    } catch (e) {
      setMsg('导入失败：文件格式不正确 ❌')
    }
  }

  const doResetAll = async () => {
    if (!confirm('确定要清空全部学习数据吗？此操作不可恢复！')) return
    await Promise.all([resetSrs(), resetAttempts(), resetPlan()])
    await update({ examDate: null, dailyNewWords: 40 })
    setMsg('已清空全部数据')
    setTimeout(() => location.reload(), 800)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">⚙️ 设置</h1>
      {msg && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-2">{msg}</div>}

      <Card>
        <h2 className="font-bold text-slate-800 mb-3">考试与学习设置</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-500 block mb-1">考试日期（用于倒计时与计划）</label>
            <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">每日新词目标</label>
            <input type="number" min={10} max={100} value={daily} onChange={e => setDaily(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
          </div>
        </div>
        <button onClick={save} className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm">保存设置</button>
      </Card>

      <Card>
        <h2 className="font-bold text-slate-800 mb-2">题型分值配置</h2>
        <p className="text-xs text-slate-500 mb-3">当前模拟卷按川师常见结构配置（总分 100）。若学校通知有变，可在此调整。</p>
        <div className="space-y-1.5">
          {settings.mockSectionConfig.map(c => (
            <div key={c.section} className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{c.title}</span>
              <span className="text-slate-400">{c.count} 题 × {c.points} 分 = {c.count * c.points} 分</span>
            </div>
          ))}
          <button onClick={() => update({ mockSectionConfig: DEFAULT_SECTION_CONFIG })} className="mt-2 text-xs text-blue-600">恢复默认配置</button>
        </div>
      </Card>

      <Card>
        <h2 className="font-bold text-slate-800 mb-2">🔊 朗读设置</h2>
        <p className="text-xs text-slate-500 mb-3">手机没声音？选「在线发音」即可（需要联网，音质清晰）。本地语音离线可用，但国产安卓手机常无英语语音。</p>
        <div className="flex gap-2 mb-3">
          {(['auto', 'local', 'online'] as const).map(e => (
            <button
              key={e}
              onClick={() => update({ speakEngine: e })}
              className={'flex-1 py-2 rounded-lg text-sm ' + (settings.speakEngine === e ? 'bg-blue-600 text-white' : 'border border-slate-300 text-slate-600')}
            >
              {e === 'auto' ? '自动' : e === 'local' ? '本地语音' : '在线发音'}
            </button>
          ))}
        </div>
        <div className={'text-xs rounded-lg px-3 py-2 mb-3 ' + (engineStatus().local ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700')}>
          {engineStatus().note}
        </div>
        <button
          onClick={() => speak('ability', 'en-US')}
          className="w-full border border-blue-300 text-blue-600 py-2.5 rounded-lg text-sm hover:bg-blue-50"
        >
          🔊 测试发音（ability）
        </button>
      </Card>

      <Card>
        <h2 className="font-bold text-slate-800 mb-2">数据备份</h2>
        <p className="text-xs text-slate-500 mb-3">学习数据保存在本机浏览器中。换设备/清缓存前请先导出备份。</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={doExport} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">📤 导出备份</button>
          <label className="border border-slate-300 px-4 py-2 rounded-lg text-sm text-slate-600 cursor-pointer">
            📥 导入备份
            <input type="file" accept="application/json" className="hidden" onChange={e => e.target.files?.[0] && doImport(e.target.files[0])} />
          </label>
        </div>
      </Card>

      <Card className="border-red-200">
        <h2 className="font-bold text-slate-800 mb-2">危险区</h2>
        <button onClick={doResetAll} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm">🗑️ 清空全部学习数据</button>
      </Card>

      <Card>
        <h2 className="font-bold text-slate-800 mb-2">关于</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          学位英语备考助手 v0.1.0 · 面向四川师范大学学位英语考试
          <br />内置 1600+ 大纲词、600+ 原创题目、12 节语法、5 套模拟卷
          <br />数据本地存储（IndexedDB），可安装为 APP 离线使用
        </p>
      </Card>
    </div>
  )
}