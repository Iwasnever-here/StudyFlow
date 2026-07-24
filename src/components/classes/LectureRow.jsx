import {
  LuCalendarDays,
  LuCheck,
  LuClock,
  LuExternalLink,
  LuPencil,
  LuRotateCcw,
  LuTrash2,
} from 'react-icons/lu'
import {
  formatDateForDisplay,
  formatTime,
} from '../../utils/lectureSchedule'

function LectureRow({
  lecture,
  isNext = false,
  onEdit,
  onDelete,
  onToggleComplete,
  updating = false,
  deleting = false,
}) {
  const blockDate =
    lecture.timeBlock?.block_date

  const startTime =
    lecture.timeBlock?.start_time

  const endTime =
    lecture.timeBlock?.end_time

  const timeText =
    startTime && endTime
      ? `${formatTime(startTime)} – ${formatTime(endTime)}`
      : startTime
        ? formatTime(startTime)
        : 'Time not set'

  const hasLectureLink =
    Boolean(lecture.lecture_url)

  const completed =
    Boolean(lecture.completed)

  const handleEdit = () => {
    if (!onEdit || updating || deleting) {
      return
    }

    onEdit(lecture)
  }

  const handleDelete = () => {
    if (!onDelete || updating || deleting) {
      return
    }

    onDelete(lecture)
  }

  const handleToggleComplete = () => {
    if (
      !onToggleComplete ||
      updating ||
      deleting
    ) {
      return
    }

    onToggleComplete(lecture.id)
  }

  return (
    <article
      className={[
        'border-b border-[var(--border)] px-5 py-4 transition last:border-b-0',
        isNext
          ? 'bg-[var(--accent-soft)]'
          : 'hover:bg-[var(--bg-hover)]',
        completed ? 'opacity-70' : '',
      ].join(' ')}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {lecture.week_number && (
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                Week {lecture.week_number}
              </span>
            )}

            {isNext && (
              <span className="rounded-full bg-[var(--accent)] px-2.5 py-1 text-xs font-semibold text-white">
                Next
              </span>
            )}

            {completed && (
              <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-2.5 py-1 text-xs font-medium text-[var(--text-muted)]">
                <LuCheck aria-hidden="true" />
                Completed
              </span>
            )}
          </div>

          <h3
            className={[
              'mt-2 text-base font-semibold text-[var(--text-primary)]',
              completed
                ? 'line-through decoration-[var(--text-muted)]'
                : '',
            ].join(' ')}
          >
            {lecture.title}
          </h3>

          <div className="mt-3 flex flex-col gap-2 text-sm text-[var(--text-muted)] sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <div className="flex items-center gap-2">
              <LuCalendarDays
                aria-hidden="true"
                className="shrink-0"
              />

              <span>
                {formatDateForDisplay(
                  blockDate,
                  {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  },
                )}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <LuClock
                aria-hidden="true"
                className="shrink-0"
              />

              <span>{timeText}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {hasLectureLink && (
            <a
              href={lecture.lecture_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--bg-card)]"
            >
              <LuExternalLink aria-hidden="true" />
              Open
            </a>
          )}

          {onToggleComplete && (
            <button
              type="button"
              onClick={handleToggleComplete}
              disabled={updating || deleting}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--bg-card)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {completed ? (
                <LuRotateCcw aria-hidden="true" />
              ) : (
                <LuCheck aria-hidden="true" />
              )}

              {updating
                ? 'Updating...'
                : completed
                  ? 'Undo'
                  : 'Complete'}
            </button>
          )}

          {onEdit && (
            <button
              type="button"
              onClick={handleEdit}
              disabled={updating || deleting}
              aria-label={`Edit ${lecture.title}`}
              className="inline-flex size-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-muted)] transition hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LuPencil aria-hidden="true" />
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={updating || deleting}
              aria-label={`Delete ${lecture.title}`}
              className="inline-flex size-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-muted)] transition hover:bg-[var(--bg-card)] hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LuTrash2 aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

export default LectureRow