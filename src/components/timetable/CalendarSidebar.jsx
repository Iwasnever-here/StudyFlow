import {
  BLOCK_TYPES,
} from '../../utils/timetable'
import {
  formatDate,
  formatTime,
} from '../../utils/datetime'

const CalendarSidebar = ({
  classes,
  assignments,
  todayBlocks,
  activeTypes,
  selectedClassId,
  onToggleType,
  onClassChange,
}) => {
  return (
    <aside className="space-y-4">
      <section className="rounded-3xl border border-(--border) bg-(--bg-card) p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-muted)">
          Filters
        </p>

        <div className="mt-4 space-y-2">
          {BLOCK_TYPES.map(
            (type) => {
              const active =
                activeTypes.includes(
                  type,
                )

              return (
                <button
                  key={type}
                  type="button"
                  onClick={() =>
                    onToggleType(type)
                  }
                  className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm font-medium ${
                    active
                      ? 'border-(--border-accent) bg-(--bg-input) text-(--text-primary)'
                      : 'border-transparent text-(--text-muted)'
                  }`}
                >
                  <span>{type}</span>

                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      active
                        ? 'bg-(--color-primary)'
                        : 'bg-(--disabled)'
                    }`}
                  />
                </button>
              )
            },
          )}
        </div>

        <label className="mt-4 block text-xs font-semibold text-(--text-secondary)">
          Class
        </label>

        <select
          value={selectedClassId}
          onChange={(event) =>
            onClassChange(
              event.target.value,
            )
          }
          className="mt-2 w-full rounded-xl border border-(--border) bg-(--bg-input) px-3 py-2 text-sm text-(--text-primary)"
        >
          <option value="">
            All classes
          </option>

          {classes.map(
            (classItem) => (
              <option
                key={classItem.id}
                value={classItem.id}
              >
                {classItem.code ||
                  classItem.name}
              </option>
            ),
          )}
        </select>
      </section>

      <section className="h-[279px] overflow-y-auto rounded-3xl border border-(--border) bg-(--bg-card) p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-muted)">
          Today
        </p>

        <div className="mt-4 space-y-3">
          {todayBlocks.length === 0 ? (
            <p className="text-sm text-(--text-muted)">
              Nothing scheduled today.
            </p>
          ) : (
            todayBlocks
              .slice(0, 5)
              .map((block) => (
                <div
                  key={block.id}
                  className="rounded-xl border border-(--border) bg-(--bg-input) p-3"
                >
                  <p className="truncate text-sm font-semibold text-(--text-primary)">
                    {block.title}
                  </p>

                  <p className="mt-1 text-xs text-(--text-muted)">
                    {formatTime(
                      block.start_time,
                    )}
                    {' – '}
                    {formatTime(
                      block.end_time,
                    )}
                  </p>
                </div>
              ))
          )}
        </div>
      </section>

      
    </aside>
  )
}

export default CalendarSidebar
