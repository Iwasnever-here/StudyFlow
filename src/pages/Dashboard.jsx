import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  LuArrowRight,
  LuCalendarDays,
  LuClock3,
  LuSparkles,
} from 'react-icons/lu'

import {
  CourseworkSection,
  DashboardCard,
  DashboardLoadingState,
  TimetableSection,
  TodoSection,
} from '../components/dashboard/DashboardSections'

import HeaderSection from '../components/pages/HeaderSection'
import useDashboard from '../hooks/useDashboard'

import {
  formatDashboardDate,
  getGreeting,
} from '../utils/dashboardUtils'

const Dashboard = () => {
  const navigate = useNavigate()
  const [currentDate, setCurrentDate] = useState(
    new Date(),
  )

  const {
    todaysTodos,
    remainingBlocks,
    upcomingCoursework,
    flashcardSets,
    completeTodo,
    loading,
    error,
  } = useDashboard(currentDate)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentDate(new Date())
    }, 60000)

    return () => {
      window.clearInterval(interval)
    }
  }, [])

  const currentMinutes =
    currentDate.getHours() * 60 +
    currentDate.getMinutes()

  const remainingCount =
    todaysTodos.length +
    remainingBlocks.length

  return (
    <main className="space-y-6 bg-(--bg-page)">
      <HeaderSection
        eyebrow={getGreeting(currentDate.getHours())}
        title="Your dashboard"
        description={
          remainingCount > 0
            ? `You have ${todaysTodos.length} tasks and ${remainingBlocks.length} timetable blocks remaining today.`
            : 'Everything is clear for the rest of today.'
        }
      >
        <div className="grid w-full gap-3 sm:grid-cols-2 md:w-auto">
          <div className="rounded-2xl border border-(--border) bg-(--bg-input) px-5 py-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-(--text-muted)">
              <LuCalendarDays size={15} />
              Today
            </div>

            <p className="mt-2 font-black text-(--text-primary)">
              {formatDashboardDate(currentDate)}
            </p>
          </div>

          <div className="rounded-2xl border border-(--border) bg-(--bg-input) px-5 py-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-(--text-muted)">
              <LuClock3 size={15} />
              Time
            </div>

            <p className="mt-2 text-xl font-black text-(--text-primary)">
              {currentDate.toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      </HeaderSection>

      {error && (
        <div className="rounded-2xl border border-(--error-border) bg-(--error-bg) px-5 py-4 text-sm font-medium text-(--error-text)">
          {error}
        </div>
      )}

      {loading ? (
        <DashboardLoadingState />
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-3">
            <TodoSection
              todos={todaysTodos}
              onComplete={completeTodo}
              onView={() => navigate('/todo')}
            />

            <TimetableSection
              blocks={remainingBlocks}
              currentMinutes={currentMinutes}
              onView={() => navigate('/timetable')}
            />

            <CourseworkSection
              coursework={upcomingCoursework}
              onView={() => navigate('/coursework')}
            />
          </div>

          <DashboardCard>
            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-(--border) bg-(--bg-input) text-(--color-primary)">
                  <LuSparkles size={18} />
                </div>

                <div className="min-w-0">
                  <h2 className="text-lg font-black tracking-tight text-(--text-primary)">
                    Flashcard sets
                  </h2>

                  <p className="mt-1 text-xs text-(--text-muted)">
                    Continue revising
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/flashcards')}
                className="flex shrink-0 items-center gap-1 rounded-xl px-2 py-2 text-xs font-bold text-(--color-primary) transition hover:bg-(--bg-input)"
              >
                View all
                <LuArrowRight size={14} />
              </button>
            </div>

            {flashcardSets.length === 0 ? (
              <div className="flex min-h-32 items-center justify-center rounded-3xl border border-dashed border-(--border) bg-(--bg-input) p-5 text-center text-sm font-medium text-(--text-muted)">
                No flashcard sets yet.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {flashcardSets.map((set) => (
                  <button
                    key={set.id}
                    type="button"
                    onClick={() =>
                      navigate(`/flashcards/${set.id}`)
                    }
                    className="group flex min-h-40 flex-col justify-between rounded-3xl border border-(--border) bg-(--bg-input) p-5 text-left transition hover:-translate-y-1 hover:border-(--border-accent)"
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-2xl text-(--text-light)"
                        style={{
                          backgroundColor:
                            set.classItem?.color ||
                            'var(--color-primary)',
                        }}
                      >
                        <LuSparkles size={19} />
                      </div>

                      <LuArrowRight className="text-(--text-muted) transition-transform group-hover:translate-x-1" />
                    </div>

                    <div>
                      <h3 className="truncate font-black text-(--text-primary)">
                        {set.title}
                      </h3>

                      <p className="mt-2 text-sm text-(--text-muted)">
                        {set.cardCount}{' '}
                        {set.cardCount === 1
                          ? 'card'
                          : 'cards'}
                        {' · '}
                        {set.classItem?.name ||
                          'No class'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </DashboardCard>
        </>
      )}
    </main>
  )
}

export default Dashboard