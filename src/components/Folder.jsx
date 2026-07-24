import { useNavigate } from 'react-router-dom'

const Folder = ({ classItem }) => {
  const navigate = useNavigate()

  const classColor =
    classItem.color || '#26371f'

  const openClass = () => {
    navigate(`/classes/${classItem.id}`)
  }

  const handleKeyDown = (event) => {
    if (
      event.key === 'Enter' ||
      event.key === ' '
    ) {
      event.preventDefault()
      openClass()
    }
  }

  const hasTargetGrade =
    classItem.target_grade !== null &&
    classItem.target_grade !== ''

  const hasCredits =
    classItem.credits !== null &&
    classItem.credits !== ''

  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={`Open ${classItem.name}`}
      onClick={openClass}
      onKeyDown={handleKeyDown}
      className="
        group relative cursor-pointer
        overflow-hidden rounded-2xl
        border border-(--border)
        bg-(--bg-card)
        p-5 shadow-sm
        transition-all duration-200
        hover:-translate-y-0.5
        hover:border-(--color-secondary)
        hover:shadow-md
        focus:outline-none
        focus-visible:ring-2
        focus-visible:ring-(--color-primary)
        focus-visible:ring-offset-2
      "
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1"
        style={{
          backgroundColor: classColor,
        }}
      />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{
                backgroundColor: classColor,
              }}
            />

            <p
              className="
                truncate text-xs font-bold
                uppercase tracking-[0.16em]
              "
              style={{
                color: classColor,
              }}
            >
              {classItem.code || 'Class'}
            </p>
          </div>

          <h2 className="mt-3 truncate text-lg font-bold text-(--text-primary)">
            {classItem.name}
          </h2>

          <p className="mt-1 truncate text-sm text-(--text-muted)">
            {classItem.lecturer ||
              'Lecturer not set'}
          </p>
        </div>

        <span
          aria-hidden="true"
          className="
            shrink-0 text-lg
            text-(--text-muted)
            transition-transform duration-200
            group-hover:translate-x-1
            group-hover:text-(--text-primary)
          "
        >
          →
        </span>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {hasTargetGrade && (
          <span
            className="
              rounded-lg border
              border-(--border)
              bg-(--bg-input)
              px-2.5 py-1.5
              text-xs font-medium
              text-(--text-secondary)
            "
          >
            Target: {classItem.target_grade}
          </span>
        )}

        {hasCredits && (
          <span
            className="
              rounded-lg border
              border-(--border)
              bg-(--bg-input)
              px-2.5 py-1.5
              text-xs font-medium
              text-(--text-secondary)
            "
          >
            {classItem.credits} credits
          </span>
        )}
      </div>

      <div className="mt-5 border-t border-(--border) pt-4">
        <span
          className="
            text-sm font-semibold
            text-(--text-secondary)
            transition-colors
            group-hover:text-(--text-primary)
          "
        >
          click to view
        </span>
      </div>
    </article>
  )
}

export default Folder