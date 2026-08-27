import { useEffect, useState } from 'react'
import { useSettingsStore } from '../store/useSettingsStore'
import { useSrsStore } from '../store/useSrsStore'
import { useAttemptStore } from '../store/useAttemptStore'
import { usePlanStore } from '../store/usePlanStore'
import {
  copyUserData,
  createUser,
  exportAll,
  getCurrentUserId,
  importAll,
  listUsers,
  setCurrentUserId,
  type DbUser,
} from '../db/db'
import { DEFAULT_SECTION_CONFIG } from '../lib/examConfig'
import { Card, speak } from '../components/common'
import LearningGuide from '../components/LearningGuide'
import { engineStatus } from '../lib/speech'
import {
  getSyncStatus, onSyncStatus, getServerInfo,
  syncNow, syncClearAll,
} from '../sync/client'

export default function Settings() {
  const settings = useSettingsStore(s => s.settings)
  const update = useSettingsStore(s => s.update)
  const resetSrs = useSrsStore(s => s.resetAll)
  const resetAttempts = useAttemptStore(s => s.resetAll)
  const resetPlan = usePlanStore(s => s.resetAll)
  const [examDate, setExamDate] = useState(settings.examDate ?? '')
  const [daily, setDaily] = useState(settings.dailyNewWords)
  const [msg, setMsg] = useState('')
  const [syncStatus, setSyncStatus] = useState(getSyncStatus())
  const [newUser, setNewUser] = useState('')
  const [users, setUsers] = useState<DbUser[]>([])
  const [copyFrom, setCopyFrom] = useState('')

  useEffect(() => onSyncStatus(setSyncStatus), [])
  useEffect(() => {
    listUsers().then(rows => {
      setUsers(rows)
      setCopyFrom(rows.find(u => u.id !== getCurrentUserId())?.id ?? '')
    }).catch(() => setUsers([]))
  }, [])

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
    await update({ examDate: null, dailyNewWords: 30 })
    // 同时清空服务器上的数据
    await syncClearAll()
    setMsg('已清空全部数据')
    setTimeout(() => location.reload(), 800)
  }

  const createNewUser = async () => {
    const name = newUser.trim()
    if (!name) {
      setMsg('请输入用户名称')
      return
    }
    try {
      await createUser(name)
      setCurrentUserId(name)
      setMsg('用户已创建；不拉取数据则从 0 开始')
      setTimeout(() => location.reload(), 800)
    } catch (e) {
      setMsg(e instanceof Error && e.message === 'user exists' ? '用户名称已存在，请重新创建一个新名称' : '创建用户失败')
    }
  }

  const doCopyUser = async () => {
    if (!copyFrom || copyFrom === getCurrentUserId()) return
    if (!confirm(`确定用「${copyFrom}」的数据覆盖当前用户「${getCurrentUserId()}」吗？此操作不可恢复。`)) return
    await copyUserData(copyFrom)
    setMsg('已复制用户数据，正在刷新页面...')
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
        <h2 className="font-bold text-slate-800 mb-2">用户数据隔离</h2>
        <p className="text-xs text-slate-500 mb-3">当前用户：<b>{getCurrentUserId()}</b>。先创建新用户名称；不拉取数据就从 0 开始。</p>
        <div className="grid md:grid-cols-[1fr_auto] gap-2 mb-3">
          <input
            value={newUser}
            onChange={e => setNewUser(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
            placeholder="例如 张三、student-a"
          />
          <button onClick={createNewUser} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">创建用户</button>
        </div>
        <div className="grid md:grid-cols-[1fr_auto] gap-2">
          <select
            value={copyFrom}
            onChange={e => setCopyFrom(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
          >
            <option value="">选择要拉取的用户</option>
            {users.filter(u => u.id !== getCurrentUserId()).map(u => (
              <option key={u.id} value={u.id}>{u.id}（{u.records} 条）</option>
            ))}
          </select>
          <button
            onClick={doCopyUser}
            disabled={!copyFrom}
            className="border border-red-300 text-red-600 px-4 py-2 rounded-lg text-sm disabled:opacity-50"
          >
            拉取并覆盖当前用户
          </button>
        </div>
      </Card>

      <LearningGuide />

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
        <p className="text-xs text-slate-500 mb-3">「自动」优先在线发音（清晰稳定），断网时自动回退本地语音；「在线发音」始终联网发声；「本地语音」始终离线发声。</p>
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
        <h2 className="font-bold text-slate-800 mb-2">🌐 服务器数据</h2>
        <p className="text-xs text-slate-500 mb-3">
          学习记录保存到部署服务器的 PostgreSQL 数据库中。浏览器只读取和提交数据，不再把学习记录存到本机 IndexedDB，也不再支持离线学习。
        </p>

        {syncStatus.supported === null && (
          <div className="text-xs text-slate-500 rounded-lg px-3 py-2 bg-slate-50">正在连接服务器…</div>
        )}

        {syncStatus.supported === false && (
          <div className="text-xs text-amber-700 rounded-lg px-3 py-2 bg-amber-50">
            {syncStatus.message || '未连接到服务器'} 请通过部署后的服务器地址访问应用。
          </div>
        )}

        {syncStatus.supported && (
          <div className="space-y-2">
            <div className="text-xs text-green-700 rounded-lg px-3 py-2 bg-green-50">
              ✅ {syncStatus.message}
              {getServerInfo()?.addresses?.length ? (
                <span className="block mt-1 text-slate-600">
                  手机访问地址：<b>{getServerInfo()!.addresses.map(ip => `http://${ip}:4173`).join('　')}</b>
                </span>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setSyncStatus({ ...syncStatus, syncing: true }); syncNow() }}
                disabled={syncStatus.syncing}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
              >
                {syncStatus.syncing ? '刷新中…' : '🔄 从服务器刷新'}
              </button>
            </div>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="font-bold text-slate-800 mb-2">数据备份</h2>
        <p className="text-xs text-slate-500 mb-3">学习数据保存在服务器 PostgreSQL 中。这里的导入会覆盖服务器数据。</p>
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
          <br />数据存储在部署服务器 PostgreSQL 中，需要连接服务器使用
        </p>
      </Card>
    </div>
  )
}
