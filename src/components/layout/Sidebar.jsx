import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import ThemeSwitcher from '../ThemeSwitcher'

import {
  LuLayoutDashboard,
  LuBookOpen,
  LuCalendarDays,
  LuFolderOpen,
  LuBrain,
  LuCircleCheck,
  LuChartColumn,
  LuLogOut,
  LuMenu,
  LuX,
} from 'react-icons/lu'

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

function SidebarContent({ closeSidebar }) {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    const result = await signOut()

    if (result?.success === false) {
      console.error(result.error)
      return
    }

    closeSidebar?.()
    navigate('/')
  }

  return (
    <div className="relative z-10 flex h-full flex-col">
      {/* Sidebar heading */}
      <div className="mb-8 border-b border-(--border) pb-6">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-(--color-secondary)">
          Personal Workspace
        </p>

        <div className="mt-2 flex items-center justify-between gap-4">
          <h2 className="text-3xl font-black tracking-tighter text-(--text-primary)">
            StudyFlow
          </h2>

        </div>

        <div className="mt-2 flex items-center justify-between gap-4">
          <ThemeSwitcher />
          </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon

          return (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={closeSidebar}
              className={({ isActive }) =>
                [
                  'group flex items-center gap-3 rounded-xl px-4 py-3',
                  'font-semibold transition-all duration-200',
                  isActive
                    ? 'bg-(--color-primary) text-(--text-light) shadow-sm'
                    : [
                        'text-(--text-muted)',
                        'hover:bg-(--bg-card)',
                        'hover:text-(--text-primary)',
                        'md:hover:translate-x-1',
                      ].join(' '),
                ].join(' ')
              }
            >
              <Icon
                size={20}
                className="shrink-0 transition-transform duration-200 group-hover:scale-110"
              />

              <span>{link.label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="mt-auto border-t border-(--border) pt-6">
        <button
          type="button"
          onClick={handleLogout}
          className={[
            'flex w-full items-center gap-3 rounded-xl px-4 py-3',
            'bg-(--error-bg) font-semibold text-(--error-text)',
            'transition-all duration-200',
            'hover:border-(--error-border) hover:brightness-95',
            'md:hover:translate-x-1',
          ].join(' ')}
        >
          <LuLogOut size={20} />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  )
}

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)

  const closeSidebar = () => setIsOpen(false)

  return (
    <>
      {/* Mobile header */}
      <header
        className={[
          'fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between',
          'border-b border-(--border)',
          'bg-(--bg-page) px-4',
          'text-(--text-primary)',
          'md:hidden',
        ].join(' ')}
      >
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-(--color-secondary)">
            Personal Workspace
          </p>

          <h1 className="text-xl font-black tracking-tight">
            StudyFlow
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={isOpen}
          className={[
            'grid size-10 place-items-center rounded-xl',
            'border border-(--border)',
            'bg-(--bg-card)',
            'text-(--text-primary)',
            'transition hover:brightness-95',
          ].join(' ')}
        >
          <LuMenu size={23} />
        </button>
      </header>

      {/* Mobile dark overlay */}
      <button
        type="button"
        aria-label="Close navigation menu"
        onClick={closeSidebar}
        className={[
          'fixed inset-0 z-40 bg-black/45 transition-opacity md:hidden',
          isOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0',
        ].join(' ')}
      />

      {/* Mobile sidebar drawer */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 w-[min(18rem,85vw)]',
          'overflow-hidden border-r border-(--border)',
          'bg-(--bg-page) p-5 text-(--text-primary)',
          'transition-transform duration-300 ease-in-out',
          'md:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* Adaptive grid decoration */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(var(--grid) 1px, transparent 1px),
              linear-gradient(90deg, var(--grid) 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px',
          }}
        />

        <button
          type="button"
          onClick={closeSidebar}
          aria-label="Close navigation menu"
          className={[
            'absolute right-4 top-4 z-20 grid size-9 place-items-center rounded-lg',
            'border border-(--border)',
            'bg-(--bg-card)',
            'text-(--text-primary)',
            'transition hover:brightness-95',
          ].join(' ')}
        >
          <LuX size={20} />
        </button>

        <SidebarContent closeSidebar={closeSidebar} />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-30 hidden w-72',
          'overflow-hidden border-r border-(--border)',
          'bg-(--bg-card) p-5',
          'text-(--text-primary)',
          'md:block',
        ].join(' ')}
      >
        

        <SidebarContent />
      </aside>
    </>
  )
}

export default Sidebar