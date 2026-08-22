import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Words from './pages/Words'
import WordStudy from './pages/WordStudy'
import ReviewSession from './pages/ReviewSession'
import Grammar from './pages/Grammar'
import GrammarLesson from './pages/GrammarLesson'
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


export default function App() {
  const loadSrs = useSrsStore(s => s.load)
  const loadAttempts = useAttemptStore(s => s.load)
  const loadPlan = usePlanStore(s => s.load)
  const loadSettings = useSettingsStore(s => s.load)

  useEffect(() => {
    loadSrs()
    loadAttempts()
    loadPlan()
    loadSettings()
    // 局域网同步：探测服务器并自动双向同步（由 server.mjs 提供）
    initSync()
    // PWA service worker 由 vite-plugin-pwa 自动注册（dev 模式下不注册）
    if (import.meta.env.PROD && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register(import.meta.env.BASE_URL + 'sw.js').catch(() => {})
      })
    }
  }, [loadSrs, loadAttempts, loadPlan, loadSettings])

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/words" element={<Words />} />
        <Route path="/study" element={<WordStudy />} />
        <Route path="/review" element={<ReviewSession />} />
        <Route path="/grammar" element={<Grammar />} />
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
