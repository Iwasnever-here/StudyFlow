import {
  LuBookOpen,
  LuCalendarDays,
  LuClock3,
  LuGraduationCap,
  LuPencil,
  LuTrash2,
} from 'react-icons/lu'

const statusStyles = {
  not_started: {
    label: 'Not started',
    className:
      'bg-slate-500/10 text-slate-600 ring-slate-500/20',
  },
  in_progress: {
    label: 'In progress',
    className:
      'bg-amber-500/10 text-amber-700 ring-amber-500/20',
  },
  completed: {
    label: 'Completed',
    className:
      'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20',
  },
  submitted: {
    label: 'Submitted',
    className:
      'bg-blue-500/10 text-blue-700 ring-blue-500/20',
  },
}

const formatDate = (date) => {
  if (!date) {
    return 'No due date'
  }

  return new Date(
    `${date}T00:00:00`
  ).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const getDaysUntilDue = (dueDate) => {
  const today = new Date()
  const due = new Date(`${dueDate}T00:00:00`)

  today.setHours(0, 0, 0, 0)

  return Math.ceil(
    (due.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24)
  )
}

const getDueDetails = (dueDate, status) => {
  if (!dueDate) {
    return {
      label: 'No due date',
      className: 'text-(--text-muted)',
    }
  }

  if (
    status === 'completed' ||
    status === 'submitted'
  ) {
    return {
      label: `Due ${formatDate(dueDate)}`,
      className: 'text-(--text-muted)',
    }
  }

  const daysUntilDue = getDaysUntilDue(dueDate)

  if (daysUntilDue < 0) {
    const overdueDays = Math.abs(daysUntilDue)

    return {
      label: `${overdueDays} ${
        overdueDays === 1 ? 'day' : 'days'
      } overdue`,
      className: 'text-(--error-text)',
    }
  }

  if (daysUntilDue === 0) {
    return {
      label: 'Due today',
      className: 'text-red-600',
    }
  }

  if (daysUntilDue === 1) {
    return {
      label: 'Due tomorrow',
      className: 'text-amber-700',
    }
  }

  if (daysUntilDue <= 7) {
    return {
      label: `Due in ${daysUntilDue} days`,
      className: 'text-amber-700',
    }
  }

  return {
    label: `Due ${formatDate(dueDate)}`,
    className: 'text-(--text-muted)',
  }
}

const getStatusDetails = (status) =>
  statusStyles[status] || {
    label:
      status
        ?.replaceAll('_', ' ')
        .replace(/\b\w/g, (letter) =>
          letter.toUpperCase()
        ) || 'Unknown',
    className:
      'bg-slate-500/10 text-slate-600 ring-slate-500/20',
  }

const CourseworkCard = ({
  assignment,
  linkedClass,
  saving,
  isDeleting,
  onEdit,
  onDelete,
}) => {
  const status = getStatusDetails(assignment.status)

  const dueDetails = getDueDetails(
    assignment.due_date,
    assignment.status
  )

  const classColor =
    linkedClass?.color || 'var(--color-primary)'

  const hasHours =
    assignment.hours !== null &&
    assignment.hours !== undefined

  const hasGrade =
    assignment.grade !== null &&
    assignment.grade !== undefined

  return (
    <article
      className="
        group relative flex min-h-72
        flex-col overflow-hidden rounded-3xl
        border border-(--border)
        bg-(--bg-card) p-5 shadow-sm
        transition duration-200
        hover:-translate-y-1
        hover:border-(--color-primary)/30
        hover:shadow-lg
      "
    >
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{
          backgroundColor: classColor,
        }}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="
              flex size-10 shrink-0
              items-center justify-center
              rounded-xl text-white shadow-sm
            "
            style={{
              backgroundColor: classColor,
            }}
          >
            <LuBookOpen size={18} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-xs font-bold uppercase tracking-[0.14em] text-(--text-muted)">
              {linkedClass?.code ||
                linkedClass?.name ||
                'Coursework'}
            </p>

            {linkedClass?.code && linkedClass?.name && (
              <p className="mt-0.5 truncate text-xs text-(--text-muted)">
                {linkedClass.name}
              </p>
            )}
          </div>
        </div>

        <span
          className={`
            shrink-0 rounded-full px-2.5 py-1
            text-xs font-semibold ring-1 ring-inset
            ${status.className}
          `}
        >
          {status.label}
        </span>
      </div>

      <div className="mt-5">
        <h2 className="line-clamp-2 text-xl font-bold leading-snug text-(--text-primary)">
          {assignment.title}
        </h2>

        {assignment.description ? (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-(--text-secondary)">
            {assignment.description}
          </p>
        ) : (
          <p className="mt-2 text-sm italic text-(--text-muted)">
            No description added
          </p>
        )}
      </div>

      <div className="mt-auto pt-6">
        <div className="rounded-2xl bg-(--bg-secondary) p-3">
          <div className="flex items-center gap-2">
            <LuCalendarDays
              size={16}
              className={dueDetails.className}
            />

            <p
              className={`text-sm font-semibold ${dueDetails.className}`}
            >
              {dueDetails.label}
            </p>
          </div>

          <p className="mt-1 pl-6 text-xs text-(--text-muted)">
            {formatDate(assignment.due_date)}
          </p>
        </div>

        {(hasHours || hasGrade) && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {hasHours && (
              <div className="flex items-center gap-2">
                <LuClock3
                  size={15}
                  className="shrink-0 text-(--text-muted)"
                />

                <div>
                  <p className="text-xs text-(--text-muted)">
                    Estimate
                  </p>

                  <p className="text-sm font-semibold text-(--text-primary)">
                    {assignment.hours}{' '}
                    {Number(assignment.hours) === 1
                      ? 'hour'
                      : 'hours'}
                  </p>
                </div>
              </div>
            )}

            {hasGrade && (
              <div className="flex items-center gap-2">
                <LuGraduationCap
                  size={16}
                  className="shrink-0 text-(--text-muted)"
                />

                <div>
                  <p className="text-xs text-(--text-muted)">
                    Grade
                  </p>

                  <p className="text-sm font-semibold text-(--text-primary)">
                    {assignment.grade}%
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-5 flex gap-2 border-t border-(--border) pt-4">
          <button
            type="button"
            onClick={() => onEdit(assignment)}
            disabled={saving || isDeleting}
            className="
              flex flex-1 items-center
              justify-center gap-2 rounded-xl
              border border-(--border)
              bg-(--bg-secondary) px-3 py-2.5
              text-sm font-semibold
              text-(--text-primary)
              transition
              hover:border-(--color-primary)/40
              hover:text-(--color-primary)
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <LuPencil size={15} />
            Edit
          </button>

          <button
            type="button"
            onClick={() => onDelete(assignment)}
            disabled={saving || isDeleting}
            className="
              flex flex-1 items-center
              justify-center gap-2 rounded-xl
              border border-red-500/20
              bg-red-500/5 px-3 py-2.5
              text-sm font-semibold text-(--error-text)
              transition
              hover:border-(--error-border)
              hover:bg-(--error-bg)
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <LuTrash2 size={15} />

            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </article>
  )
}

export default CourseworkCard