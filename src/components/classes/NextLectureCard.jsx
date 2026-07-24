import {
  LuCalendarDays,
  LuCheck,
  LuClock,
  LuExternalLink,
} from 'react-icons/lu'
import {
  formatDateForDisplay,
  formatTime,
} from '../../utils/lectureSchedule'

function NextLectureCard({
  lecture,
  onToggleComplete,
  updating = false,
}) {
  if (!lecture) {
    return (
      <section className="rounded-xl border border-(--border) bg-(--bg-card) p-4">
        <p className="text-xs font-medium text-(--text-muted)">
          Next lecture
        </p>

        <h2 className="mt-1 text-base font-semibold text-(--text-primary)">
          No upcoming lectures
        </h2>

        <p className="mt-1 text-xs text-(--text-muted)">
          Add a lecture schedule to see the next session here.
        </p>
      </section>
    )
  }

  const blockDate =
    lecture.timeBlock?.block_date
  const startTime =
    lecture.timeBlock?.start_time
  const endTime =
    lecture.timeBlock?.end_time

  return (
    <section className="overflow-hidden rounded-xl border border-(--border) bg-(--bg-card)">
      <div className="border-b border-(--border) px-4 py-2.5">
        <p className="text-xs font-medium text-(--text-muted)">
          Next lecture
        </p>
      </div>

      <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          {lecture.week_number && (
            <p className="text-[10px] font-semibold uppercase tracking-wide text-(--text-muted)">
              Week {lecture.week_number}
            </p>
          )}

          <h2 className="mt-1 truncate text-lg font-semibold text-(--text-primary)">
            {lecture.title}
          </h2>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-(--text-muted)">
            <span className="inline-flex items-center gap-1.5">
              <LuCalendarDays aria-hidden="true" />
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

            <span className="inline-flex items-center gap-1.5">
              <LuClock aria-hidden="true" />
              {startTime && endTime
                ? `${formatTime(
                    startTime,
                  )} – ${formatTime(
                    endTime,
                  )}`
                : startTime
                  ? formatTime(startTime)
                  : 'Time not set'}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {lecture.lecture_url && (
            <a
              href={lecture.lecture_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-(--border) px-2.5 text-xs font-medium text-(--text-primary) transition hover:bg-(--bg-hover)"
            >
              <LuExternalLink aria-hidden="true" />
              Open
            </a>
          )}

          <button
            type="button"
            onClick={() =>
              onToggleComplete?.(lecture.id)
            }
            disabled={updating}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-(--text-primary) transition hover:bg-(--bg-hover) disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LuCheck aria-hidden="true" />
            {updating
              ? 'Updating...'
              : 'Mark complete'}
          </button>
        </div>
      </div>
    </section>
  )
}

export default NextLectureCard
