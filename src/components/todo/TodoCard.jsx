import { useState } from 'react'
import {
  LuBookOpen,
  LuCheck,
  LuCircle,
} from 'react-icons/lu'

const TodoCard = ({
  todo,
  classItem,
  onComplete,
}) => {
  const [isCompleting, setIsCompleting] = useState(false)

  if (!todo) return null

  const handleComplete = async () => {
    if (isCompleting) return

    setIsCompleting(true)

    try {
      await onComplete?.(todo)
    } catch {
      setIsCompleting(false)
    }
  }

  return (
    <article
      className={`
        rounded-2xl
        border border-[var(--border)]
        bg-[var(--bg-card)]
        p-4
        shadow-sm
        transition-all
        duration-500
        ${isCompleting
          ? 'scale-[0.98] opacity-50'
          : 'hover:-translate-y-0.5 hover:border-[var(--border-accent)] hover:shadow-md'
        }
      `}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          disabled={isCompleting}
          onClick={handleComplete}
          aria-label={`Complete ${todo.title}`}
          className="
            mt-0.5 flex h-7 w-7 shrink-0
            items-center justify-center
            rounded-full
            text-[var(--color-primary)]
            transition
            hover:bg-[var(--color-primary)]/10
            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-[var(--color-primary)]
            disabled:cursor-default
          "
        >
          {isCompleting ? (
            <span
              className="
                flex h-6 w-6 items-center justify-center
                rounded-full
                bg-[var(--color-primary)]
                text-white
              "
            >
              <LuCheck
                size={15}
                strokeWidth={3}
              />
            </span>
          ) : (
            <LuCircle size={24} />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <h3
            className={`
              break-words text-sm font-semibold
              text-[var(--text-primary)]
              transition
              ${isCompleting ? 'line-through' : ''}
            `}
          >
            {todo.title}
          </h3>

          {classItem && (
            <div className="mt-3 flex items-center gap-2">
              <span
                className="
                  flex h-7 w-7 shrink-0
                  items-center justify-center
                  rounded-lg
                "
                style={{
                  backgroundColor:
                    `${classItem.color || '#26371f'}20`,
                  color:
                    classItem.color || '#26371f',
                }}
              >
                <LuBookOpen size={14} />
              </span>

              <div className="min-w-0">
                <p
                  className="
                    truncate text-xs font-medium
                    text-[var(--text-secondary)]
                  "
                >
                  {classItem.name}
                </p>

                {classItem.code && (
                  <p
                    className="
                      truncate text-[11px]
                      text-[var(--text-muted)]
                    "
                  >
                    {classItem.code}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

export default TodoCard