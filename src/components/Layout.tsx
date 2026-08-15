import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/', label: '首页', icon: '🏠' },
  { to: '/words', label: '背单词', icon: '📚' },
  { to: '/grammar', label: '语法', icon: '📖' },
  { to: '/practice', label: '专项练习', icon: '✏️' },
  { to: '/mock', label: '模拟考试', icon: '📝' },
  { to: '/wrongbook', label: '错题本', icon: '🎯' },
  { to: '/plan', label: '学习计划', icon: '🗓️' },
  { to: '/settings', label: '设置', icon: '⚙️' },
]

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* 顶部导航（手机）/ 侧边栏（电脑） */}
      <header className="lg:hidden sticky top-0 z-20 bg-blue-700 text-white shadow">
        <div className="flex items-center gap-1 overflow-x-auto px-2 py-2">
          <span className="font-bold whitespace-nowrap px-2">🎓 学位英语</span>
          {navItems.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) =>
                `whitespace-nowrap px-3 py-1.5 rounded-lg text-sm ${
                  isActive ? 'bg-white/20 font-semibold' : 'hover:bg-white/10'
                }`
              }
            >
              {n.icon} {n.label}
            </NavLink>
          ))}
        </div>
      </header>

      <aside className="hidden lg:flex w-52 shrink-0 flex-col bg-blue-700 text-white min-h-screen sticky top-0 h-screen">
        <div className="p-5 text-xl font-bold border-b border-white/15">🎓 学位英语备考</div>
        <nav className="flex-1 py-3 space-y-1 overflow-y-auto">
          {navItems.map(n => (
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

      <main className="flex-1 min-w-0">
        <div className="max-w-4xl mx-auto p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
