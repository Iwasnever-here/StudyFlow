import HeaderSection from '../components/pages/HeaderSection'
import ReviewStatsGrid from '../components/review/ReviewStatsGrid'
import ReviewProgressGrid from '../components/review/ReviewProgressGrid'

import useReview from '../hooks/useReview'

const LoadingState = () => {
  return (
    <div className="space-y-6">
      <div className="
        grid gap-4
        sm:grid-cols-2
        xl:grid-cols-4
      ">
        {[1, 2, 3, 4].map(
          (item) => (
            <div
              key={item}
              className="
                h-40 animate-pulse
                rounded-3xl border
                border-(--border)
                bg-(--bg-card)
                opacity-60
              "
            />
          ),
        )}
      </div>

      <div className="
        grid gap-6
        xl:grid-cols-[0.8fr_1.2fr]
      ">
        {[1, 2].map(
          (item) => (
            <div
              key={item}
              className="
                h-96 animate-pulse
                rounded-4xl border
                border-(--border)
                bg-(--bg-card)
                opacity-60
              "
            />
          ),
        )}
      </div>
    </div>
  )
}

const Review = () => {
  const {
    summary,
    classProgress,
    overdueCoursework,
    overdueTodos,
    loading,
    error,
  } = useReview()

  return (
    <main className="
      space-y-6
      bg-(--bg-page)
    ">
      <HeaderSection
        eyebrow="Review"
        title="Your progress"
        description="See what needs attention and how your classes are progressing."
      />

      {error && (
        <div className="
          rounded-2xl border
          border-(--error-border)
          bg-(--error-bg)
          px-5 py-4
          text-sm font-medium
          text-(--error-text)
        ">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingState />
      ) : (
        <>
          <ReviewStatsGrid
            summary={summary}
            overdueCoursework={
              overdueCoursework
            }
            overdueTodos={
              overdueTodos
            }
          />

          <ReviewProgressGrid
            summary={summary}
            classProgress={
              classProgress
            }
          />
        </>
      )}
    </main>
  )
}

export default Review