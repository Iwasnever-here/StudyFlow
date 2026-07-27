import {
  LuArrowRight,
  LuBookOpen,
  LuCheck,
  LuCircle,
  LuClock3,
  LuListTodo,
} from 'react-icons/lu'

import {
  formatDeadline,
  formatTime,
  timeToMinutes,
} from '../../utils/dashboardUtils'

export const DashboardCard = ({
  children,
  className = '',
}) => {
  return (
    <section
      className={`rounded-4xl border border-(--border) bg-(--bg-card) p-6 shadow-sm ${className}`}
    >
      {children}
    </section>
  )
}

const SectionHeading = ({
  icon: Icon,
  title,
  subtitle,
  buttonText,
  onClick,
}) => {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-(--border) bg-(--bg-input) text-(--color-primary)">
          <Icon size={18} />
        </div>

        <div className="min-w-0">
          <h2 className="text-lg font-black tracking-tight text-(--text-primary)">
            {title}
          </h2>

          <p className="mt-1 text-xs text-(--text-muted)">
            {subtitle}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onClick}
        className="flex shrink-0 items-center gap-1 rounded-xl px-2 py-2 text-xs font-bold text-(--color-primary) transition hover:bg-(--bg-input)"
      >
        {buttonText}
        <LuArrowRight size={14} />
      </button>
    </div>
  )
}

const EmptyState = ({ children }) => {
  return (
    <div className="flex min-h-32 items-center justify-center rounded-3xl border border-dashed border-(--border) bg-(--bg-input) p-5 text-center text-sm font-medium text-(--text-muted)">
      {children}
    </div>
  )
}

export const DashboardLoadingState = () => {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-80 animate-pulse rounded-4xl border border-(--border) bg-(--bg-card) opacity-60"
        />
      ))}
    </div>
  )
}

export const TodoSection = ({
  todos,
  onComplete,
  onView,
}) => {
  return (
    <DashboardCard>
      <SectionHeading
        icon={LuListTodo}
        title="Due today"
        subtitle={`${todos.length} incomplete tasks`}
        buttonText="View"
        onClick={onView}
      />

      {todos.length === 0 ? (
        <EmptyState>
          No tasks are due today.
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {todos.slice(0, 4).map((todo) => (
            <div
              key={todo.id}
              className="group flex items-center gap-3 rounded-2xl border border-(--border) bg-(--bg-input) px-4 py-3"
            >
              <button
                type="button"
                onClick={() => onComplete(todo)}
                className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-(--color-primary) transition hover:bg-(--bg-card)"
              >
                <LuCircle size={21} />

                <LuCheck
                  size={14}
                  className="absolute opacity-0 transition group-hover:opacity-100"
                />
              </button>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-(--text-primary)">
                  {todo.title}
                </p>

                <p className="mt-1 truncate text-xs text-(--text-muted)">
                  {todo.classItem?.name || 'No class'}
                </p>
              </div>

              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{
                  backgroundColor:
                    todo.classItem?.color ||
                    'var(--color-secondary)',
                }}
              />
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  )
}

export const TimetableSection = ({
  blocks,
  currentMinutes,
  onView,
}) => {
  return (
    <DashboardCard>
      <SectionHeading
        icon={LuClock3}
        title="Remaining today"
        subtitle={`${blocks.length} timetable blocks`}
        buttonText="View"
        onClick={onView}
      />

      {blocks.length === 0 ? (
        <EmptyState>
          No more timetable blocks.
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {blocks.slice(0, 4).map((block, index) => {
            const startMinutes = timeToMinutes(
              block.start_time,
            )

            const endMinutes = timeToMinutes(
              block.end_time,
            )

            const isActive =
              startMinutes <= currentMinutes &&
              endMinutes > currentMinutes

            return (
              <div
                key={block.id}
                className="relative overflow-hidden rounded-2xl border border-(--border) bg-(--bg-input) px-4 py-3"
              >
                <span
                  className="absolute bottom-0 left-0 top-0 w-1.5"
                  style={{
                    backgroundColor:
                      block.classItem?.color ||
                      'var(--color-secondary)',
                  }}
                />

                <div className="min-w-0 pl-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-bold text-(--text-primary)">
                      {block.title}
                    </p>

                    {(isActive || index === 0) && (
                      <span className="rounded-full bg-(--color-primary) px-2 py-1 text-[9px] font-black uppercase text-(--text-light)">
                        {isActive ? 'Now' : 'Next'}
                      </span>
                    )}
                  </div>

                  <p className="mt-1 truncate text-xs text-(--text-muted)">
                    {formatTime(block.start_time)}
                    {' – '}
                    {formatTime(block.end_time)}
                  </p>

                  <p className="mt-1 truncate text-xs text-(--text-muted)">
                    {block.classItem?.name ||
                      block.block_type}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </DashboardCard>
  )
}

export const CourseworkSection = ({
  coursework,
  onView,
}) => {
  return (
    <DashboardCard>
      <SectionHeading
        icon={LuBookOpen}
        title="Upcoming coursework"
        subtitle="Nearest deadlines"
        buttonText="View"
        onClick={onView}
      />

      {coursework.length === 0 ? (
        <EmptyState>
          No upcoming coursework.
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {coursework.map((assignment) => (
            <article
              key={assignment.id}
              className="rounded-2xl border border-(--border) bg-(--bg-input) p-4"
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-(--text-light)"
                  style={{
                    backgroundColor:
                      assignment.classItem?.color ||
                      'var(--color-primary)',
                  }}
                >
                  <LuBookOpen size={17} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 text-sm font-black text-(--text-primary)">
                      {assignment.title}
                    </h3>

                    <span className="shrink-0 rounded-full border border-(--border) px-2 py-1 text-[10px] font-bold text-(--text-muted)">
                      {formatDeadline(
                        assignment.due_date,
                      )}
                    </span>
                  </div>

                  <p className="mt-2 truncate text-xs text-(--text-muted)">
                    {assignment.classItem?.name ||
                      'No class'}
                  </p>

                  <p className="mt-2 text-xs font-bold text-(--text-secondary)">
                    {assignment.hours ?? 0}{' '}
                    estimated hours
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </DashboardCard>
  )
}