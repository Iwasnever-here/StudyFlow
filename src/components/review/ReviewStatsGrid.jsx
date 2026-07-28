import {
  LuBookOpen,
  LuClock3,
  LuLayers3,
  LuListTodo,
  LuTriangleAlert,
} from 'react-icons/lu'

const formatDate = (
  dateString,
) => {
  if (!dateString) {
    return 'No due date'
  }

  return new Date(
    `${dateString}T00:00:00`,
  ).toLocaleDateString(
    'en-GB',
    {
      day: 'numeric',
      month: 'short',
    },
  )
}

const StandardStatCard = ({
  icon: Icon,
  label,
  value,
  detail,
}) => {
  return (
    <article className="
      min-h-40 rounded-3xl
      border border-(--border)
      bg-(--bg-card)
      p-5 shadow-sm
    ">
      <div className="
        flex items-start
        justify-between gap-4
      ">
        <div>
          <p className="
            text-xs font-bold
            uppercase
            tracking-[0.14em]
            text-(--text-muted)
          ">
            {label}
          </p>

          <p className="
            mt-3 text-3xl
            font-black
            tracking-tight
            text-(--text-primary)
          ">
            {value}
          </p>

          <p className="
            mt-2 text-sm
            text-(--text-muted)
          ">
            {detail}
          </p>
        </div>

        <div className="
          flex size-11 shrink-0
          items-center
          justify-center
          rounded-2xl border
          border-(--border)
          bg-(--bg-input)
          text-(--color-primary)
        ">
          <Icon size={20} />
        </div>
      </div>
    </article>
  )
}

const AttentionCard = ({
  overdueCoursework,
  overdueTodos,
}) => {
  const overdueItems = [
    ...overdueCoursework.map(
      (assignment) => ({
        id:
          `coursework-${assignment.id}`,

        icon:
          LuBookOpen,

        title:
          assignment.title,

        detail:
          `Coursework due ${formatDate(
            assignment.due_date,
          )}`,
      }),
    ),

    ...overdueTodos.map(
      (todo) => ({
        id:
          `todo-${todo.id}`,

        icon:
          LuListTodo,

        title:
          todo.title,

        detail:
          `Task due ${formatDate(
            todo.due_date,
          )}`,
      }),
    ),
  ]

  const attentionCount =
    overdueItems.length

  return (
    <article className="
      min-h-40 rounded-3xl
      border border-(--border)
      bg-(--bg-card)
      p-5 shadow-sm
    ">
      <div className="
        flex items-start
        justify-between gap-4
      ">
        <div>
          <p className="
            text-xs font-bold
            uppercase
            tracking-[0.14em]
            text-(--text-muted)
          ">
            Needs attention
          </p>

          <p className="
            mt-3 text-3xl
            font-black
            tracking-tight
            text-(--text-primary)
          ">
            {attentionCount}
          </p>

          <p className="
            mt-2 text-sm
            text-(--text-muted)
          ">
            {attentionCount === 1
              ? 'Overdue item'
              : 'Overdue items'}
          </p>
        </div>

        <div className="
          flex size-11 shrink-0
          items-center
          justify-center
          rounded-2xl border
          border-(--error-border)
          bg-(--error-bg)
          text-(--error-text)
        ">
          <LuTriangleAlert
            size={20}
          />
        </div>
      </div>

      {overdueItems.length > 0 && (
        <div className="
          mt-4 space-y-3
          border-t
          border-(--border)
          pt-4
        ">
          {overdueItems
            .slice(0, 2)
            .map((item) => {
              const Icon =
                item.icon

              return (
                <div
                  key={item.id}
                  className="
                    flex items-start
                    gap-2.5
                  "
                >
                  <Icon
                    size={15}
                    className="
                      mt-0.5 shrink-0
                      text-(--error-text)
                    "
                  />

                  <div className="
                    min-w-0
                  ">
                    <p className="
                      truncate text-sm
                      font-bold
                      text-(--text-primary)
                    ">
                      {item.title}
                    </p>

                    <p className="
                      mt-0.5 text-xs
                      text-(--text-muted)
                    ">
                      {item.detail}
                    </p>
                  </div>
                </div>
              )
            })}

          {overdueItems.length > 2 && (
            <p className="
              text-xs font-semibold
              text-(--text-muted)
            ">
              +
              {overdueItems.length - 2}
              {' more overdue '}
              {overdueItems.length - 2 ===
              1
                ? 'item'
                : 'items'}
            </p>
          )}
        </div>
      )}
    </article>
  )
}

const ReviewStatsGrid = ({
  summary,
  overdueCoursework,
  overdueTodos,
}) => {
  return (
    <section className="
      grid gap-4
      sm:grid-cols-2
      xl:grid-cols-4
    ">
      <AttentionCard
        overdueCoursework={
          overdueCoursework
        }
        overdueTodos={
          overdueTodos
        }
      />

      <StandardStatCard
        icon={LuListTodo}
        label="Active tasks"
        value={
          summary.activeTodos
        }
        detail="Todos remaining"
      />

      <StandardStatCard
        icon={LuLayers3}
        label="Flashcards"
        value={
          summary.totalFlashcards
        }
        detail="Cards created"
      />

      <StandardStatCard
        icon={LuClock3}
        label="This week"
        value={`${summary.scheduledHours}h`}
        detail="Scheduled study"
      />
    </section>
  )
}

export default ReviewStatsGrid