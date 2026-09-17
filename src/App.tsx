import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Words from './pages/Words'
import WordStudy from './pages/WordStudy'
import ReviewSession from './pages/ReviewSession'
import Grammar from './pages/Grammar'
import GrammarLesson from './pages/GrammarLesson'
import GrammarMicroLesson from './pages/GrammarMicroLesson'
import Practice from './pages/Practice'
import PracticeSession from './pages/PracticeSession'
import MockExam from './pages/MockExam'
import MockSession from './pages/MockSession'
import WrongBook from './pages/WrongBook'
import Plan from './pages/Plan'
import Settings from './pages/Settings'
import { useSrsStore } from './store/useSrsStore'
import { useAttemptStore } from './store/useAttemptStore'
import { usePlanStore } from './store/usePlanStore'
import { useSettingsStore } from './store/useSettingsStore'
import { initSync } from './sync/client'
import { claimUser, createUser, getCurrentUserId, listUsers, setCurrentUserId, type DbUser } from './db/db'


export default function App() {
  const [currentUser, setCurrentUser] = useState(getCurrentUserId())
  const loadSrs = useSrsStore(s => s.load)
  const loadAttempts = useAttemptStore(s => s.load)
  const loadPlan = usePlanStore(s => s.load)
  const loadSettings = useSettingsStore(s => s.load)

  useEffect(() => {
    const onUserChange = () => setCurrentUser(getCurrentUserId())
    window.addEventListener('degree-english-user-change', onUserChange)
    return () => window.removeEventListener('degree-english-user-change', onUserChange)
  }, [])

  useEffect(() => {
    if (!currentUser) return
    loadSrs()
    loadAttempts()
    loadPlan()
    loadSettings()
    // 局域网同步：探测服务器并自动双向同步（由 server.mjs 提供）
    initSync()
  }, [currentUser, loadSrs, loadAttempts, loadPlan, loadSettings])

  if (!currentUser) return <ClaimRequired onClaimed={setCurrentUser} />

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/words" element={<Words />} />
        <Route path="/study" element={<WordStudy />} />
        <Route path="/review" element={<ReviewSession />} />
        <Route path="/grammar" element={<Grammar />} />
        <Route path="/grammar/micro/:id" element={<GrammarMicroLesson />} />
        <Route path="/grammar/:id" element={<GrammarLesson />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/practice/:section" element={<PracticeSession />} />
        <Route path="/mock" element={<MockExam />} />
        <Route path="/mock/:id" element={<MockSession />} />
        <Route path="/wrongbook" element={<WrongBook />} />
        <Route path="/plan" element={<Plan />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

function ClaimRequired({ onClaimed }: { onClaimed: (userId: string) => void }) {
  const [users, setUsers] = useState<DbUser[]>([])
  const [newUser, setNewUser] = useState('')
  const [target, setTarget] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    listUsers().then(rows => {
      setUsers(rows)
      setTarget(rows[0]?.id ?? '')
    }).catch(() => {
      setUsers([])
      setMsg('无法读取用户列表，请确认学习服务器已启动')
    })
  }, [])

  const enterAs = (userId: string) => {
    setCurrentUserId(userId)
    onClaimed(userId)
  }

  const createAndEnter = async () => {
    const name = newUser.trim()
    if (!name) {
      setMsg('请输入用户名称')
      return
    }
    setLoading(true)
    try {
      await createUser(name)
      enterAs(name)
    } catch (e) {
      setMsg(e instanceof Error && e.message === 'user exists' ? '用户名称已存在，请换一个名称' : '创建用户失败')
    } finally {
      setLoading(false)
    }
  }

  const doClaim = async () => {
    if (!target) {
      setMsg('请选择要认领的用户')
      return
    }
    if (!password.trim()) {
      setMsg('请输入认领密码')
      return
    }
    setLoading(true)
    try {
      await claimUser(target, password)
      enterAs(target)
    } catch (e) {
      if (e instanceof Error && e.message === 'invalid password') {
        setMsg('认领失败：密码不是当前北京时间年月日')
      } else if (e instanceof Error && e.message === 'user not found') {
        setMsg('认领失败：用户不存在')
      } else {
        setMsg('认领用户失败')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-sm p-5">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-slate-900">认领用户</h1>
          <p className="text-sm text-slate-500 mt-1">
            进入学习前必须先创建新用户，或认领已有用户。不会自动进入默认用户。
          </p>
        </div>

        {msg && <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">{msg}</div>}

        <div className="space-y-3 mb-4">
          <div>
            <label className="text-xs text-slate-500 block mb-1">新用户名称</label>
            <input
              value={newUser}
              onChange={e => setNewUser(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') void createAndEnter() }}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
              placeholder="例如 张三、student-a"
            />
          </div>
          <button
            onClick={createAndEnter}
            disabled={loading || !newUser.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm disabled:opacity-50"
          >
            {loading ? '处理中...' : '创建并进入'}
          </button>
        </div>

        <div className="border-t border-slate-200 pt-4 space-y-3">
          <p className="text-xs text-slate-500">认领已有用户：密码为当前北京时间年月日，例如 20260918。</p>
          <div>
            <label className="text-xs text-slate-500 block mb-1">用户</label>
            <select
              value={target}
              onChange={e => setTarget(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
            >
              <option value="">选择要认领的用户</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.id}（{user.records} 条）</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">认领密码</label>
            <input
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') void doClaim() }}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
              inputMode="numeric"
              placeholder="YYYYMMDD"
            />
          </div>
          <button
            onClick={doClaim}
            disabled={loading || !target || !password.trim()}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm disabled:opacity-50"
          >
            {loading ? '认领中...' : '认领并进入'}
          </button>
        </div>
      </div>
    </div>
  )
}
