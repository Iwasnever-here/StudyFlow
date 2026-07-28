import {
  LuChartNoAxesColumnIncreasing,
  LuGraduationCap,
} from 'react-icons/lu'

const SectionCard = ({
  icon: Icon,
  title,
  description,
  children,
}) => {
  return (
    <section className="
      rounded-4xl border
      border-(--border)
      bg-(--bg-card)
      p-6 shadow-sm
    ">
      <div className="
        mb-6 flex
        items-start gap-3
      ">
        <div className="
          flex size-10 shrink-0
          items-center
          justify-center
          rounded-2xl border
          border-(--border)
          bg-(--bg-input)
          text-(--color-primary)
        ">
          <Icon size={18} />
        </div>

        <div>
          <h2 className="
            text-lg font-black
            tracking-tight
            text-(--text-primary)
          ">
            {title}
          </h2>

          <p className="
            mt-1 text-sm
            text-(--text-muted)
          ">
            {description}
          </p>
        </div>
      </div>

      {children}
    </section>
  )
}

const ProgressBar = ({
  value,
  color,
}) => {
  const safeValue =
    Math.min(
      100,
      Math.max(
        0,
        value || 0,
      ),
    )

  return (
    <div className="
      h-2.5 overflow-hidden
      rounded-full
      bg-(--bg-card)
    ">
      <div
        className="
          h-full rounded-full
          transition-[width]
          duration-500
        "
        style={{
          width:
            `${safeValue}%`,

          backgroundColor:
            color ||
            'var(--color-primary)',
        }}
      />
    </div>
  )
}

const EmptyState = ({
  children,
}) => {
  return (
    <div className="
      flex min-h-24
      items-center
      justify-center
      rounded-2xl border
      border-dashed
      border-(--border)
      bg-(--bg-input)
      px-4 py-6
      text-center text-sm
      font-medium
      text-(--text-muted)
    ">
      {children}
    </div>
  )
}

const AcademicSummary = ({
  summary,
}) => {
  const hasAverageGrade =
    Number.isFinite(
      summary.averageGrade,
    )

  return (
    <SectionCard
      icon={LuGraduationCap}
      title="Academic summary"
      description="Your coursework completion and recorded grades."
    >
      <div className="space-y-4">
        <div className="
          rounded-3xl border
          border-(--border)
          bg-(--bg-input)
          p-6
        ">
          <div className="
            flex items-end
            justify-between gap-4
          ">
            <div>
              <p className="
                text-sm font-semibold
                text-(--text-muted)
              ">
                Coursework completed
              </p>

              <p className="
                mt-2 text-4xl
                font-black
                tracking-tight
                text-(--text-primary)
              ">
                {
                  summary
                    .courseworkProgress
                }%
              </p>
            </div>

            <p className="
              pb-1 text-sm
              font-semibold
              text-(--text-muted)
            ">
              {
                summary
                  .completedCoursework
              }
              {' of '}
              {
                summary
                  .totalCoursework
              }
              {' assignments'}
            </p>
          </div>

          <div className="mt-6">
            <ProgressBar
              value={
                summary
                  .courseworkProgress
              }
            />
          </div>
        </div>

        <div className="
          grid gap-4
          sm:grid-cols-2
        ">
          <div className="
            rounded-3xl border
            border-(--border)
            bg-(--bg-input)
            p-5
          ">
            <p className="
              text-sm font-semibold
              text-(--text-muted)
            ">
              Average grade
            </p>

            <p className="
              mt-2 text-3xl
              font-black
              tracking-tight
              text-(--text-primary)
            ">
              {hasAverageGrade
                ? `${summary.averageGrade}%`
                : '—'}
            </p>

            <p className="
              mt-2 text-xs
              text-(--text-muted)
            ">
              Across graded assignments
            </p>
          </div>

          <div className="
            rounded-3xl border
            border-(--border)
            bg-(--bg-input)
            p-5
          ">
            <p className="
              text-sm font-semibold
              text-(--text-muted)
            ">
              Total assignments
            </p>

            <p className="
              mt-2 text-3xl
              font-black
              tracking-tight
              text-(--text-primary)
            ">
              {
                summary
                  .totalCoursework
              }
            </p>

            <p className="
              mt-2 text-xs
              text-(--text-muted)
            ">
              All recorded coursework
            </p>
          </div>
        </div>
      </div>
    </SectionCard>
  )
}

const ClassProgressCard = ({
  classItem,
}) => {
  const hasAverageGrade =
    Number.isFinite(
      classItem.averageGrade,
    )

  return (
    <article className="
      rounded-3xl border
      border-(--border)
      bg-(--bg-input)
      p-5
    ">
      <div className="
        flex items-start
        justify-between gap-4
      ">
        <div className="min-w-0">
          <div className="
            flex items-center
            gap-2
          ">
            <span
              className="
                size-3 shrink-0
                rounded-full
              "
              style={{
                backgroundColor:
                  classItem.color ||
                  'var(--color-primary)',
              }}
            />

            <h3 className="
              truncate font-black
              text-(--text-primary)
            ">
              {classItem.name}
            </h3>
          </div>

          <p className="
            mt-1 text-xs
            font-semibold uppercase
            tracking-wider
            text-(--text-muted)
          ">
            {classItem.code ||
              'No class code'}
          </p>
        </div>

        <span className="
          rounded-xl border
          border-(--border)
          bg-(--bg-card)
          px-3 py-1.5
          text-sm font-black
          text-(--text-primary)
        ">
          {classItem.progress}%
        </span>
      </div>

      <div className="mt-5">
        <ProgressBar
          value={
            classItem.progress
          }
          color={
            classItem.color
          }
        />
      </div>

      <div className="
        mt-5 grid
        grid-cols-2 gap-3
      ">
        <div className="
          rounded-2xl border
          border-(--border)
          bg-(--bg-card)
          p-3
        ">
          <p className="
            text-xs
            text-(--text-muted)
          ">
            Coursework
          </p>

          <p className="
            mt-1 font-black
            text-(--text-primary)
          ">
            {classItem.completedCount}
            {' / '}
            {classItem.courseworkCount}
          </p>
        </div>

        <div className="
          rounded-2xl border
          border-(--border)
          bg-(--bg-card)
          p-3
        ">
          <p className="
            text-xs
            text-(--text-muted)
          ">
            Average grade
          </p>

          <p className="
            mt-1 font-black
            text-(--text-primary)
          ">
            {hasAverageGrade
              ? `${classItem.averageGrade}%`
              : '—'}
          </p>
        </div>

        <div className="
          rounded-2xl border
          border-(--border)
          bg-(--bg-card)
          p-3
        ">
          <p className="
            text-xs
            text-(--text-muted)
          ">
            Flashcards
          </p>

          <p className="
            mt-1 font-black
            text-(--text-primary)
          ">
            {classItem.flashcardCount}
          </p>
        </div>

        <div className="
          rounded-2xl border
          border-(--border)
          bg-(--bg-card)
          p-3
        ">
          <p className="
            text-xs
            text-(--text-muted)
          ">
            Estimated work
          </p>

          <p className="
            mt-1 font-black
            text-(--text-primary)
          ">
            {classItem.remainingHours}h
          </p>
        </div>
      </div>
    </article>
  )
}

const ReviewProgressGrid = ({
  summary,
  classProgress,
}) => {
  return (
    <section className="
      grid items-start gap-6
      xl:grid-cols-[0.8fr_1.2fr]
    ">
      <AcademicSummary
        summary={summary}
      />

      <SectionCard
        icon={
          LuChartNoAxesColumnIncreasing
        }
        title="Class progress"
        description="A breakdown of coursework, grades and study material by class."
      >
        {classProgress.length ===
        0 ? (
          <EmptyState>
            Create a class to start
            tracking progress.
          </EmptyState>
        ) : (
          <div className="
            grid gap-4
            lg:grid-cols-2
          ">
            {classProgress.map(
              (classItem) => (
                <ClassProgressCard
                  key={
                    classItem.id
                  }
                  classItem={
                    classItem
                  }
                />
              ),
            )}
          </div>
        )}
      </SectionCard>
    </section>
  )
}

export default ReviewProgressGrid