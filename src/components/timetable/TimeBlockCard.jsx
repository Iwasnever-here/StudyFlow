import {
  formatTime,
} from '../../utils/datetime'
import {
  getBlockAppearance,
  getBlockPosition,
  getBlockTypeLabel,
} from '../../utils/timetable'

const TimeBlockCard = ({
  block,
  classItem,
  onEdit,
  onDelete,
}) => {
  if (
    !block ||
    !block.start_time ||
    !block.end_time
  ) {
    return null
  }

  const position =
    getBlockPosition(block)

  if (position.hidden) {
    return null
  }

  const appearance =
    getBlockAppearance(
      block,
      classItem,
    )

  const isLecture =
    Boolean(block.lecture_id)

  return (
    <article
      className="group absolute left-1 right-1 overflow-hidden rounded-xl border-l-4 px-2.5 py-2 shadow-sm"
      style={{
        top: position.top,
        height: position.height,
        borderColor:
          appearance.borderColor,
        background:
          appearance.background,
      }}
    >
      <div className="flex h-full flex-col justify-between gap-1">
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-xs font-semibold text-[var(--text-primary)]">
              {block.title}
            </p>

            {block.auto_generated && (
              <span className="shrink-0 rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                Auto
              </span>
            )}
          </div>

          <p className="mt-1 text-[10px] font-medium text-[var(--text-muted)]">
            {formatTime(
              block.start_time,
            )}
            {' – '}
            {formatTime(
              block.end_time,
            )}
          </p>
        </div>

        <div className="flex items-end justify-between gap-2">
          <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
            {classItem?.code ||
              getBlockTypeLabel(
                block,
              )}
          </p>

          {!isLecture && (
            <div className="hidden gap-1 group-hover:flex">
              <button
                type="button"
                onClick={() =>
                  onEdit(block)
                }
                className="rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--text-secondary)]"
              >
                Edit
              </button>

              <button
                type="button"
                onClick={() =>
                  onDelete(block)
                }
                className="rounded-md border border-[var(--error-border)] bg-[var(--error-bg)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--error-text)]"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

export default TimeBlockCard
