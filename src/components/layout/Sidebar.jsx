import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

import {
  LuLayoutDashboard,
  LuBookOpen,
  LuCalendarDays,
  LuFolderOpen,
  LuBrain,
  LuCircleCheck,
  LuChartColumn,
  LuLogOut,
} from 'react-icons/lu'
import ThemeSwitcher from '../ThemeSwitcher'

function Sidebar() {
  const links = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: LuLayoutDashboard,
    },
    {
      path: '/classes',
      label: 'Classes',
      icon: LuBookOpen,
    },
    {
      path: '/timetable',
      label: 'Timetable',
      icon: LuCalendarDays,
    },
    {
      path: '/coursework',
      label: 'Coursework',
      icon: LuFolderOpen,
    },
    {
      path: '/flashcards',
      label: 'Flashcards',
      icon: LuBrain,
    },
    {
      path: '/todo',
      label: 'To Do',
      icon: LuCircleCheck,
    },
    {
      path: '/review',
      label: 'Review',
      icon: LuChartColumn,
    },
  ]

  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <aside className="w-72 min-h-screen bg-[#f4f0df] border-r border-[#c9b98a] p-5 text-[#22351f] relative overflow-hidden flex flex-col">

      <div className="absolute inset-0 opacity-[0.12] bg-[linear-gradient(#415c3214_1px,transparent_1px),linear-gradient(90deg,#415c3214_1px,transparent_1px)] bg-[size:30px_30px]" />

      <div className="relative z-10">

        <div className="mb-8 border-b border-[#c9b98a] pb-6">
          <p className="text-xs uppercase tracking-[0.28em] font-black text-[#7a8357]">
            Personal Workspace
          </p>

          <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-[#26371f]">
            StudyFlow
          </h2>
        </div>
        <ThemeSwitcher />

        <nav className="space-y-2">
          {links.map((link) => {
            const Icon = link.icon

            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-[#26371f] text-[#fff8dd] shadow-sm'
                      : 'text-[#5d5436] hover:bg-[#ece2c3] hover:translate-x-1'
                  }`
                }
              >
                <Icon
                  size={20}
                  className="transition-transform duration-200 group-hover:scale-110"
                />

                <span>{link.label}</span>
              </NavLink>
            )
          })}
        </nav>
      </div>

      <div className="relative z-10 mt-auto pt-6 border-t border-[#c9b98a]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full rounded-xl bg-[#f5dfdb] px-4 py-3 font-semibold text-[#9c2f23] transition-all duration-200 hover:bg-[#efd0ca] hover:translate-x-1"
        >
          <LuLogOut size={20} />
          <span>Log Out</span>
        </button>
      </div>

    </aside>
  )
}

export default Sidebar