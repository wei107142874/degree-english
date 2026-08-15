import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'

// 桌面端侧边栏全部入口
const desktopItems = [
  { to: '/', label: '首页', icon: '🏠' },
  { to: '/words', label: '背单词', icon: '📚' },
  { to: '/grammar', label: '语法', icon: '📖' },
  { to: '/practice', label: '专项练习', icon: '✏️' },
  { to: '/mock', label: '模拟考试', icon: '📝' },
  { to: '/wrongbook', label: '错题本', icon: '🎯' },
  { to: '/plan', label: '学习计划', icon: '🗓️' },
  { to: '/settings', label: '设置', icon: '⚙️' },
]

// 手机端底部 Tab：5 个主入口
const mobileTabs = [
  { to: '/', label: '首页', icon: '🏠' },
  { to: '/words', label: '背单词', icon: '📚' },
  { to: '/grammar', label: '语法', icon: '📖' },
  { to: '/practice', label: '专项', icon: '✏️' },
]

// "更多"面板里的其余入口
const moreItems = [
  { to: '/mock', label: '模拟考试', icon: '📝' },
  { to: '/wrongbook', label: '错题本', icon: '🎯' },
  { to: '/plan', label: '学习计划', icon: '🗓️' },
  { to: '/settings', label: '设置', icon: '⚙️' },
]

export default function Layout() {
  const [moreOpen, setMoreOpen] = useState(false)
  const location = useLocation()

  // 路由变化时自动关闭"更多"面板
  useEffect(() => {
    setMoreOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ===== 手机端：顶部标题栏（简洁） ===== */}
      <header className="lg:hidden sticky top-0 z-30 bg-blue-700 text-white shadow flex items-center justify-between px-4 py-3">
        <span className="font-bold">🎓 学位英语</span>
        <span className="text-xs text-blue-200">备考助手</span>
      </header>

      {/* ===== 桌面端侧边栏（不变） ===== */}
      <aside className="hidden lg:flex w-52 shrink-0 flex-col bg-blue-700 text-white min-h-screen sticky top-0 h-screen">
        <div className="p-5 text-xl font-bold border-b border-white/15">🎓 学位英语备考</div>
        <nav className="flex-1 py-3 space-y-1 overflow-y-auto">
          {desktopItems.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) =>
                `block px-5 py-2.5 text-sm ${
                  isActive ? 'bg-white/20 font-semibold' : 'hover:bg-white/10'
                }`
              }
            >
              {n.icon} {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 text-xs text-blue-200 border-t border-white/15">
          四川师范大学 · 学位英语
        </div>
      </aside>

      {/* ===== 内容区（手机端底部留出 Tab 高度） ===== */}
      <main className="flex-1 min-w-0">
        <div className="max-w-4xl mx-auto p-4 lg:p-8 pb-24 lg:pb-8">
          <Outlet />
        </div>
      </main>

      {/* ===== 手机端：底部 Tab 栏 ===== */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-slate-200 shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
        <div className="grid grid-cols-5 max-w-md mx-auto">
          {mobileTabs.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center py-2 pt-2.5 text-[11px] ${
                  isActive ? 'text-blue-600 font-semibold' : 'text-slate-500'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`text-xl leading-none mb-1 ${isActive ? 'scale-110' : ''} transition-transform`}>{n.icon}</span>
                  {n.label}
                  {isActive && <span className="absolute -top-px h-0.5 w-8 bg-blue-600 rounded-full" />}
                </>
              )}
            </NavLink>
          ))}

          {/* 更多按钮 */}
          <button
            onClick={() => setMoreOpen(o => !o)}
            className={`relative flex flex-col items-center py-2 pt-2.5 text-[11px] ${
              moreOpen ? 'text-blue-600 font-semibold' : 'text-slate-500'
            }`}
          >
            <span className="text-xl leading-none mb-1">☰</span>
            更多
            {moreOpen && <span className="absolute -top-px h-0.5 w-8 bg-blue-600 rounded-full" />}
          </button>
        </div>
      </nav>

      {/* ===== "更多"面板（底部弹出） ===== */}
      {moreOpen && (
        <>
          {/* 遮罩 */}
          <div className="lg:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setMoreOpen(false)} />
          {/* 面板 */}
          <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-2xl shadow-xl p-4 pb-8 animate-slide-up">
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />
            <div className="text-sm font-bold text-slate-800 mb-3 px-1">更多功能</div>
            <div className="grid grid-cols-2 gap-2">
              {moreItems.map(n => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={false}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm border ${
                      isActive ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`
                  }
                >
                  <span className="text-xl">{n.icon}</span>
                  {n.label}
                </NavLink>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
