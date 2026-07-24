import {
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  LuBookOpen,
  LuCheck,
  LuCircle,
  LuEllipsis,
  LuPencil,
  LuTrash2,
} from 'react-icons/lu'

const TodoCard = ({
  todo,
  classItem,
  onComplete,
  onEdit,
  onDelete,
}) => {
  const [isCompleting, setIsCompleting] =
    useState(false)

  const [isMenuOpen, setIsMenuOpen] =
    useState(false)

  const menuRef = useRef(null)

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener(
      'mousedown',
      handleOutsideClick
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutsideClick
      )
    }
  }, [])

  if (!todo) return null

  const handleComplete = async () => {
    if (isCompleting) return

    setIsMenuOpen(false)
    setIsCompleting(true)

    try {
      await onComplete?.(todo)
    } catch {
      setIsCompleting(false)
    }
  }

  const handleEdit = () => {
    setIsMenuOpen(false)
    onEdit?.(todo)
  }

  const handleDelete = () => {
    setIsMenuOpen(false)
    onDelete?.(todo)
  }

  return (
    <article
      className={`
        relative rounded-2xl
        border border-(--border)
        bg-(--bg-card)
        p-4
        shadow-sm
        transition-all duration-500
        ${
          isCompleting
            ? 'scale-[0.98] opacity-50'
            : `
              hover:-translate-y-0.5
              hover:border-(--border-accent)
              hover:shadow-md
            `
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
            text-(--color-primary)
            transition
            hover:bg-(--color-primary)/10
            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-(--color-primary)
            disabled:cursor-default
          "
        >
          {isCompleting ? (
            <span
              className="
                flex h-6 w-6 items-center justify-center
                rounded-full
                bg-(--color-primary)
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
              wrap-break-word pr-8
              text-sm font-semibold
              text-(--text-primary)
              transition
              ${
                isCompleting
                  ? 'line-through'
                  : ''
              }
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
                    text-(--text-secondary)
                  "
                >
                  {classItem.name}
                </p>

                {classItem.code && (
                  <p
                    className="
                      truncate text-[11px]
                      text-(--text-muted)
                    "
                  >
                    {classItem.code}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div
          ref={menuRef}
          className="relative shrink-0"
        >
          <button
            type="button"
            disabled={isCompleting}
            onClick={() =>
              setIsMenuOpen(
                (currentValue) => !currentValue
              )
            }
            aria-label={`Actions for ${todo.title}`}
            aria-expanded={isMenuOpen}
            className="
              flex h-8 w-8 items-center
              justify-center rounded-lg
              text-(--text-muted)
              transition
              hover:bg-(--bg-input)
              hover:text-(--text-primary)
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-(--color-primary)
              disabled:cursor-default
            "
          >
            <LuEllipsis size={19} />
          </button>

          {isMenuOpen && (
            <div
              className="
                absolute right-0 top-10 z-20
                w-36 overflow-hidden
                rounded-xl
                border border-(--border)
                bg-(--bg-card)
                p-1.5
                shadow-lg
              "
            >
              <button
                type="button"
                onClick={handleEdit}
                className="
                  flex w-full items-center gap-2
                  rounded-lg px-3 py-2
                  text-left text-sm font-medium
                  text-(--text-primary)
                  transition
                  hover:bg-(--bg-input)
                "
              >
                <LuPencil size={15} />
                Edit
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="
                  flex w-full items-center gap-2
                  rounded-lg px-3 py-2
                  text-left text-sm font-medium
                  text-red-600
                  transition
                  hover:bg-red-500/10
                "
              >
                <LuTrash2 size={15} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

export default TodoCard