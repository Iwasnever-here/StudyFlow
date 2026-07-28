import TodoCard from './TodoCard'

const groupStyles = {
  overdue: {
    dot: 'bg-red-500',
    count: 'bg-red-500/10 text-red-700',
    emptyText: 'No overdue tasks',
  },

  today: {
    dot: 'bg-amber-500',
    count: 'bg-amber-500/10 text-amber-700',
    emptyText: 'No tasks due today',
  },

  thisWeek: {
    dot: 'bg-blue-500',
    count: 'bg-blue-500/10 text-blue-700',
    emptyText: 'No more tasks due this week',
  },

  other: {
    dot: 'bg-emerald-500',
    count:
      'bg-emerald-500/10 text-emerald-700',
    emptyText: 'No later tasks',
  },
}

const TodoColumn = ({
  title,
  group,
  todos = [],
  classesById = {},
  onComplete,
  onEdit,
  onDelete,
}) => {
  const styles =
    groupStyles[group] ||
    groupStyles.other

  return (
    <section className="
      min-w-0 rounded-3xl border border-(--border)
      bg-(--bg-card) p-4 sm:p-5">
      <header className="
        mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`
            h-2.5 w-2.5 rounded-full
            ${styles.dot}
          `} />

          <h2 className="
            text-sm font-bold text-(--text-primary)">
            {title}
          </h2>
        </div>

        <span className={`
          rounded-full px-2.5 py-1 text-xs font-bold
          ${styles.count}
        `}>
          {todos.length}
        </span>
      </header>

      <div className="space-y-3">
        {todos.length === 0 ? (
          <div className="
            rounded-2xl border border-dashed border-(--border)
            px-4 py-10 text-center">
            <p className="
              text-sm font-medium text-(--text-muted)">
              {styles.emptyText}
            </p>
          </div>
        ) : (
          todos.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              classItem={
                todo.class_id
                  ? classesById[
                      String(
                        todo.class_id,
                      )
                    ]
                  : null
              }
              onComplete={onComplete}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </section>
  )
}

export default TodoColumn