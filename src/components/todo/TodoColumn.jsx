import TodoCard from './TodoCard'

const priorityStyles = {
  low: {
    dot: 'bg-emerald-500',
    count:
      'bg-emerald-500/10 text-emerald-700',
  },
  medium: {
    dot: 'bg-amber-500',
    count:
      'bg-amber-500/10 text-amber-700',
  },
  high: {
    dot: 'bg-red-500',
    count:
      'bg-red-500/10 text-red-700',
  },
}

const TodoColumn = ({
  title,
  priority,
  todos = [],
  classesById = {},
  onComplete,
}) => {
  const styles =
    priorityStyles[priority] ||
    priorityStyles.medium

  return (
    <section
      className="
        min-w-0 rounded-3xl
        border border-[var(--border)]
        bg-[var(--bg-card)]
        p-4
        sm:p-5
      "
    >
      <header
        className="
          mb-4 flex items-center
          justify-between gap-3
        "
      >
        <div className="flex items-center gap-2">
          <span
            className={`
              h-2.5 w-2.5 rounded-full
              ${styles.dot}
            `}
          />

          <h2
            className="
              text-sm font-bold
              text-[var(--text-primary)]
            "
          >
            {title}
          </h2>
        </div>

        <span
          className={`
            rounded-full px-2.5 py-1
            text-xs font-bold
            ${styles.count}
          `}
        >
          {todos.length}
        </span>
      </header>

      <div className="space-y-3">
        {todos.length === 0 ? (
          <div
            className="
              rounded-2xl
              border border-dashed
              border-[var(--border)]
              px-4 py-10
              text-center
            "
          >
            <p
              className="
                text-sm font-medium
                text-[var(--text-muted)]
              "
            >
              No {priority} priority tasks
            </p>
          </div>
        ) : (
          todos.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              classItem={
                todo.class_id
                  ? classesById[todo.class_id]
                  : null
              }
              onComplete={onComplete}
            />
          ))
        )}
      </div>
    </section>
  )
}

export default TodoColumn