import {
  LuCalendarDays,
  LuClock3,
  LuPencil,
  LuTrash2,
} from 'react-icons/lu'
import {
  formatTime,
} from '../../utils/datetime'

const formatMinutes = (
  minutes,
) => {
  const safeMinutes = Math.max(
    0,
    Math.round(minutes || 0),
  )

  const hours = Math.floor(
    safeMinutes / 60,
  )

  const remainingMinutes =
    safeMinutes % 60

  if (hours === 0) {
    return `${remainingMinutes}m`
  }

  if (remainingMinutes === 0) {
    return `${hours}h`
  }

  return `${hours}h ${remainingMinutes}m`
}

const formatStatus = (
  status,
) =>
  String(status || 'not_started')
    .replaceAll('_', ' ')
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    )

const CourseworkCard = ({
  assignment,
  linkedClass,
  scheduleSummary,
  saving,
  isDeleting,
  onEdit,
  onDelete,
}) => {
  const classColour =
    linkedClass?.color ||
    'var(--color-primary)'

  const estimatedMinutes =
    scheduleSummary
      ?.estimatedMinutes ??
    Math.max(
      0,
      Number(
        assignment.hours || 0,
      ) * 60,
    )

  const scheduledMinutes =
    scheduleSummary
      ?.scheduledMinutes ?? 0

  const remainingMinutes =
    scheduleSummary
      ?.remainingMinutes ??
    estimatedMinutes

  const progress =
    estimatedMinutes > 0
      ? Math.min(
          100,
          Math.round(
            (scheduledMinutes /
              estimatedMinutes) *
              100,
          ),
        )
      : 0

  const nextSession =
    scheduleSummary?.nextSession

  return (
    <article className="relative overflow-hidden rounded-3xl border border-(--border) bg-(--bg-card) p-5 shadow-sm">
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{
          backgroundColor:
            classColour,
        }}
      />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--text-muted)">
            {linkedClass?.code ||
              linkedClass?.name ||
              'Coursework'}
          </p>

          <h2 className="mt-2 truncate text-lg font-bold text-(--text-primary)">
            {assignment.title}
          </h2>
        </div>

        <span className="rounded-full border border-(--border) bg-(--bg-input) px-2.5 py-1 text-xs font-semibold text-(--text-secondary)">
          {formatStatus(
            assignment.status,
          )}
        </span>
      </div>

      {assignment.description && (
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-(--text-muted)">
          {assignment.description}
        </p>
      )}

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-(--border) bg-(--bg-input) p-3">
          <p className="text-xs font-medium text-(--text-muted)">
            Scheduled
          </p>

          <p className="mt-1 text-sm font-bold text-(--text-primary)">
            {formatMinutes(
              scheduledMinutes,
            )}
            {' / '}
            {formatMinutes(
              estimatedMinutes,
            )}
          </p>
        </div>

        <div className="rounded-2xl border border-(--border) bg-(--bg-input) p-3">
          <p className="text-xs font-medium text-(--text-muted)">
            Remaining
          </p>

          <p className="mt-1 text-sm font-bold text-(--text-primary)">
            {formatMinutes(
              remainingMinutes,
            )}
          </p>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-(--disabled)">
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{
            width: `${progress}%`,
            backgroundColor:
              classColour,
          }}
        />
      </div>

      <div className="mt-4 space-y-2 text-sm text-(--text-secondary)">
        <div className="flex items-center gap-2">
          <LuCalendarDays
            size={15}
          />

          <span>
            Due{' '}
            {new Intl.DateTimeFormat(
              'en-GB',
              {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              },
            ).format(
              new Date(
                `${assignment.due_date}T00:00:00`,
              ),
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <LuClock3 size={15} />

          <span>
            {nextSession
              ? `Next: ${new Intl.DateTimeFormat(
                  'en-GB',
                  {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  },
                ).format(
                  new Date(
                    `${nextSession.block_date}T00:00:00`,
                  ),
                )}, ${formatTime(
                  nextSession.start_time,
                )}`
              : 'No upcoming session'}
          </span>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <button
          type="button"
          onClick={() =>
            onEdit(assignment)
          }
          disabled={saving}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-(--border) bg-(--bg-input) px-3 py-2 text-sm font-semibold text-(--text-primary)"
        >
          <LuPencil size={15} />
          Edit
        </button>

        <button
          type="button"
          onClick={() =>
            onDelete(assignment)
          }
          disabled={isDeleting}
          className="flex items-center justify-center rounded-xl border border-(--error-border) bg-(--error-bg) px-3 py-2 text-(--error-text)"
        >
          <LuTrash2 size={15} />
        </button>
      </div>
    </article>
  )
}

export default CourseworkCard
