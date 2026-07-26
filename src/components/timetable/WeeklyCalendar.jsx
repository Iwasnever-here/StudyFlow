import TimeBlockCard from './TimeBlockCard'
import {
  CALENDAR_END_HOUR,
  CALENDAR_START_HOUR,
  HOUR_HEIGHT,
  getBlocksForDate,
} from '../../utils/timetable'
import {
  formatDayHeading,
  formatMonthHeading,
  getNowMinutes,
  getWeekDays,
  isSameDate,
} from '../../utils/datetime'

const HOURS = Array.from(
  {
    length:
      CALENDAR_END_HOUR -
      CALENDAR_START_HOUR,
  },
  (_, index) =>
    CALENDAR_START_HOUR + index,
)

const CalendarDay = ({
  date,
  blocks = [],
  classesById = {},
  onEdit,
  onDelete,
}) => {
  const dayBlocks = getBlocksForDate(
    blocks,
    date,
  )

  const today = isSameDate(
    date,
    new Date(),
  )

  const nowMinutes = getNowMinutes()

  const currentTimeTop =
    ((nowMinutes -
      CALENDAR_START_HOUR * 60) /
      60) *
    HOUR_HEIGHT

  const calendarHeight =
    HOURS.length * HOUR_HEIGHT

  return (
    <section className="min-w-0 border-l border-[var(--border)]">
      <header
        className={`
          sticky top-0 z-20
          flex h-16 flex-col
          items-center justify-center
          border-b border-[var(--border)]
          px-1 text-center
          ${
            today
              ? 'bg-[var(--bg-input)]'
              : 'bg-[var(--bg-card)]'
          }
        `}
      >
        <p className="truncate text-[11px] font-semibold text-[var(--text-primary)] sm:text-xs">
          {formatDayHeading(date)}
        </p>

        {today && (
          <span
            className="
              mt-1 inline-flex rounded-full
              bg-[var(--color-primary)]
              px-2 py-0.5
              text-[8px] font-semibold
              uppercase tracking-wide
              text-[var(--text-light)]
            "
          >
            Today
          </span>
        )}
      </header>

      <div
        className="relative"
        style={{
          height: calendarHeight,
        }}
      >
        {HOURS.map((hour) => (
          <div
            key={hour}
            className="
              pointer-events-none absolute
              left-0 right-0
              border-t border-[var(--grid)]
            "
            style={{
              top:
                (hour -
                  CALENDAR_START_HOUR) *
                HOUR_HEIGHT,
            }}
          />
        ))}

        {today &&
          currentTimeTop >= 0 &&
          currentTimeTop <=
            calendarHeight && (
            <div
              className="
                pointer-events-none absolute
                left-0 right-0 z-30
                border-t-2
                border-[var(--color-primary)]
              "
              style={{
                top: currentTimeTop,
              }}
            >
              <span
                className="
                  absolute -left-1.5 -top-1.5
                  h-3 w-3 rounded-full
                  bg-[var(--color-primary)]
                "
              />
            </div>
          )}

        {dayBlocks
          .filter(
            (block) =>
              block &&
              block.start_time &&
              block.end_time,
          )
          .map((block, index) => (
            <TimeBlockCard
              key={
                block.id ||
                `${date.toISOString()}-${index}`
              }
              block={block}
              classItem={
                classesById[
                  block.class_id
                ]
              }
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
      </div>
    </section>
  )
}

const CalendarToolbar = ({
  currentDate,
  onPrevious,
  onNext,
  onToday,
}) => {
  const controls = [
    {
      label: 'Previous',
      handler: onPrevious,
    },
    {
      label: 'Today',
      handler: onToday,
    },
    {
      label: 'Next',
      handler: onNext,
    },
  ]

  return (
    <div
      className="
        flex flex-col gap-3
        rounded-3xl
        border border-[var(--border)]
        bg-[var(--bg-card)]
        p-4
        sm:flex-row
        sm:items-center
        sm:justify-between
      "
    >
      <div>
        <p
          className="
            text-xs font-semibold uppercase
            tracking-[0.18em]
            text-[var(--text-muted)]
          "
        >
          Weekly calendar
        </p>

        <h2
          className="
            mt-1 text-xl font-semibold
            text-[var(--text-primary)]
          "
        >
          {formatMonthHeading(
            currentDate,
          )}
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {controls.map(
          ({ label, handler }) => (
            <button
              key={label}
              type="button"
              onClick={handler}
              className="
                rounded-xl
                border border-[var(--border)]
                bg-[var(--bg-input)]
                px-3 py-2
                text-sm font-medium
                text-[var(--text-primary)]
                hover:border-[var(--border-accent)]
              "
            >
              {label}
            </button>
          ),
        )}
      </div>
    </div>
  )
}

const TimeColumn = () => {
  const calendarHeight =
    HOURS.length * HOUR_HEIGHT

  return (
    <div className="w-12 shrink-0 sm:w-14">
      <div
        className="
          sticky top-0 z-30 h-16
          border-b border-[var(--border)]
          bg-[var(--bg-card)]
        "
      />

      <div
        className="relative"
        style={{
          height: calendarHeight,
        }}
      >
        {HOURS.map((hour) => (
          <span
            key={hour}
            className="
              absolute right-1
              -translate-y-1/2
              text-[9px] font-medium
              text-[var(--text-muted)]
              sm:right-2 sm:text-[10px]
            "
            style={{
              top:
                (hour -
                  CALENDAR_START_HOUR) *
                HOUR_HEIGHT,
            }}
          >
            {String(hour).padStart(
              2,
              '0',
            )}
            :00
          </span>
        ))}
      </div>
    </div>
  )
}

const WeeklyCalendar = ({
  currentDate,
  blocks = [],
  classesById = {},
  onEdit,
  onDelete,
  onPrevious,
  onNext,
  onToday,
}) => {
  const days = getWeekDays(
    currentDate,
  )

  return (
    <div className="min-w-0 space-y-4">
      <CalendarToolbar
        currentDate={currentDate}
        onPrevious={onPrevious}
        onNext={onNext}
        onToday={onToday}
      />

      <div
        className="
          max-h-[calc(100vh-12rem)]
          overflow-auto
          rounded-3xl
          border border-[var(--border)]
          bg-[var(--bg-card)]
        "
      >
        <div
          className="
            grid min-w-[850px] max-h-[560px]
            grid-cols-[48px_repeat(7,minmax(0,1fr))]
            sm:grid-cols-[56px_repeat(7,minmax(0,1fr))]
            xl:min-w-0
          "
        >
          <TimeColumn />

          {days.map((date) => (
            <CalendarDay
              key={date.toISOString()}
              date={date}
              blocks={blocks}
              classesById={classesById}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default WeeklyCalendar