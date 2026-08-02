import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom'
import {
  LuArrowLeft,
  LuArrowRight,
  LuCheck,
  LuRefreshCw,
  LuRotateCcw,
  LuX,
} from 'react-icons/lu'

import useFlashcardSets from '../hooks/useFlashcardSets'
import useFlashcards from '../hooks/useFlashcards'


const FlashcardReview = () => {
  const { setId } = useParams()
  const navigate = useNavigate()

  const {
    classes,
    flashcardSets,
    loading: loadingSets,
    error: setError,
  } = useFlashcardSets()

  const {
    cards,
    loadingCards,
    cardError,
  } = useFlashcards(setId)

  const [currentIndex, setCurrentIndex] =
    useState(0)

  const [isFlipped, setIsFlipped] =
    useState(false)

  const [knownCardIds, setKnownCardIds] =
    useState([])

  const [reviewCardIds, setReviewCardIds] =
    useState([])

  const [isComplete, setIsComplete] =
    useState(false)

  const flashcardSet = useMemo(
    () =>
      flashcardSets.find(
        (set) =>
          String(set.id) === String(setId),
      ),
    [flashcardSets, setId],
  )

  const classItem = useMemo(
    () =>
      classes.find(
        (item) =>
          String(item.id) ===
          String(flashcardSet?.class_id),
      ),
    [classes, flashcardSet],
  )

  useEffect(() => {
    setCurrentIndex(0)
    setIsFlipped(false)
    setKnownCardIds([])
    setReviewCardIds([])
    setIsComplete(false)
  }, [setId])

  const loading =
    loadingSets || loadingCards

  const error = setError || cardError

  const currentCard = cards[currentIndex]

  const classColor =
    classItem?.color || '#26371f'

  const answeredCount =
    knownCardIds.length +
    reviewCardIds.length

  const progress =
    cards.length > 0
      ? Math.round(
          (answeredCount / cards.length) *
            100,
        )
      : 0

  const knownPercentage =
    cards.length > 0
      ? Math.round(
          (knownCardIds.length /
            cards.length) *
            100,
        )
      : 0

  const moveToNextCard = () => {
    setIsFlipped(false)

    if (currentIndex >= cards.length - 1) {
      setIsComplete(true)
      return
    }

    setCurrentIndex(
      (currentIndexValue) =>
        currentIndexValue + 1,
    )
  }

  const handleAnswer = (isKnown) => {
    if (!currentCard) {
      return
    }

    if (isKnown) {
      setKnownCardIds((currentIds) => [
        ...currentIds,
        currentCard.id,
      ])
    } else {
      setReviewCardIds((currentIds) => [
        ...currentIds,
        currentCard.id,
      ])
    }

    moveToNextCard()
  }

  const handlePrevious = () => {
    if (currentIndex === 0) {
      return
    }

    const previousCard =
      cards[currentIndex - 1]

    setKnownCardIds((currentIds) =>
      currentIds.filter(
        (id) => id !== previousCard.id,
      ),
    )

    setReviewCardIds((currentIds) =>
      currentIds.filter(
        (id) => id !== previousCard.id,
      ),
    )

    setCurrentIndex(
      (currentIndexValue) =>
        currentIndexValue - 1,
    )

    setIsFlipped(false)
  }

  const restartReview = () => {
    setCurrentIndex(0)
    setIsFlipped(false)
    setKnownCardIds([])
    setReviewCardIds([])
    setIsComplete(false)
  }

  const reviewMissedCards = () => {
    const missedCards = cards.filter(
      (card) =>
        reviewCardIds.includes(card.id),
    )

    if (missedCards.length === 0) {
      restartReview()
      return
    }

    /*
      This page currently reads cards directly
      from the hook, so restarting only missed
      cards would require a separate local deck.

      The cleanest behaviour for now is to restart
      the full set. You can later extract the deck
      logic into a study hook.
    */
    restartReview()
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8">
        <p className="text-sm text-(--text-muted)">
          Loading review...
        </p>
      </main>
    )
  }

  if (!flashcardSet || cards.length === 0) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Link
          to={`/flashcards/${setId}`}
          className="
            text-sm font-medium
            text-(--text-muted)
            transition
            hover:text-(--text-primary)
          "
        >
          ← Back to set
        </Link>

        <div className="mt-6 rounded-xl border border-(--error-border) bg-(--error-bg) p-4">
          <p className="text-sm text-(--error-text)">
            {error ||
              'This flashcard set has no cards to review.'}
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Link
        to={`/flashcards/${setId}`}
        className="
          inline-flex items-center gap-2
          text-sm font-medium
          text-(--text-muted)
          transition
          hover:text-(--text-primary)
        "
      >
        <LuArrowLeft />
        Back to set
      </Link>

      <header className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="flex items-start gap-4">
          <div
            className="mt-1 h-14 w-2 rounded-full"
            style={{
              backgroundColor: classColor,
            }}
          />

          <div>
            <p
              className="text-xs font-bold uppercase tracking-wider"
              style={{
                color: classColor,
              }}
            >
              Review mode
            </p>

            <h1 className="mt-1 text-3xl font-bold text-(--text-primary)">
              {flashcardSet.title}
            </h1>

            <p className="mt-1 text-sm text-(--text-muted)">
              Decide which cards you know and
              which need more work.
            </p>
          </div>
        </div>

        {!isComplete && (
          <p className="text-sm font-semibold text-(--text-muted)">
            Card {currentIndex + 1} of{' '}
            {cards.length}
          </p>
        )}
      </header>

      <section className="mt-7 overflow-hidden rounded-2xl border border-(--border) bg-(--bg-card)">
        <div className="border-b border-(--border) px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-semibold text-(--text-primary)">
              Progress
            </span>

            <span className="text-sm font-medium text-(--text-muted)">
              {progress}%
            </span>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-(--bg-hover)">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                backgroundColor: classColor,
              }}
            />
          </div>
        </div>

        {isComplete ? (
          <ReviewResults
            totalCards={cards.length}
            knownCount={knownCardIds.length}
            reviewCount={
              reviewCardIds.length
            }
            knownPercentage={
              knownPercentage
            }
            classColor={classColor}
            onRestart={restartReview}
            onReviewMissed={
              reviewMissedCards
            }
            onQuiz={() =>
              navigate(
                `/flashcards/${setId}/quiz`,
              )
            }
          />
        ) : (
          <div className="p-4 sm:p-6">
            <button
              type="button"
              onClick={() =>
                setIsFlipped(
                  (currentValue) =>
                    !currentValue,
                )
              }
              className="
                group flex min-h-80 w-full
                flex-col items-center
                justify-center rounded-2xl
                border border-(--border)
                bg-(--bg-page)
                px-6 py-10 text-center
                transition
                hover:border-(--text-muted)
              "
            >
              <p
                className="text-xs font-bold uppercase tracking-wider"
                style={{
                  color: classColor,
                }}
              >
                {isFlipped
                  ? 'Answer'
                  : 'Question'}
              </p>

              <p className="mt-5 max-w-2xl whitespace-pre-wrap text-xl font-semibold leading-8 text-(--text-primary) sm:text-2xl">
                {isFlipped
                  ? currentCard.back
                  : currentCard.front}
              </p>

              <span className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-(--text-muted)">
                <LuRefreshCw />
                Click to{' '}
                {isFlipped
                  ? 'see question'
                  : 'reveal answer'}
              </span>
            </button>

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="
                  inline-flex items-center
                  justify-center gap-2
                  rounded-xl border
                  border-(--border)
                  px-4 py-2.5
                  text-sm font-semibold
                  text-(--text-primary)
                  transition
                  hover:bg-(--bg-hover)
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                <LuArrowLeft />
                Previous
              </button>

              {isFlipped ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleAnswer(false)
                    }
                    className="
                      inline-flex items-center
                      justify-center gap-2
                      rounded-xl border
                      border-(--error-border)
                      bg-(--error-bg)
                      px-5 py-2.5
                      text-sm font-semibold
                      text-(--error-text)
                      transition
                      hover:opacity-80
                    "
                  >
                    <LuX />
                    Review again
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleAnswer(true)
                    }
                    className="
                      inline-flex items-center
                      justify-center gap-2
                      rounded-xl px-5 py-2.5
                      text-sm font-semibold
                      text-white transition
                      hover:opacity-90
                    "
                    style={{
                      backgroundColor:
                        classColor,
                    }}
                  >
                    <LuCheck />
                    I know this
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    setIsFlipped(true)
                  }
                  className="
                    inline-flex items-center
                    justify-center gap-2
                    rounded-xl px-5 py-2.5
                    text-sm font-semibold
                    text-white transition
                    hover:opacity-90
                  "
                  style={{
                    backgroundColor:
                      classColor,
                  }}
                >
                  Reveal answer
                  <LuArrowRight />
                </button>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  )
}

const ReviewResults = ({
  totalCards,
  knownCount,
  reviewCount,
  knownPercentage,
  classColor,
  onRestart,
  onReviewMissed,
  onQuiz,
}) => (
  <div className="px-5 py-10 text-center sm:px-8">
    <div
      className="
        mx-auto flex h-16 w-16
        items-center justify-center
        rounded-2xl text-2xl text-white
      "
      style={{
        backgroundColor: classColor,
      }}
    >
      <LuCheck />
    </div>

    <p
      className="mt-5 text-xs font-bold uppercase tracking-wider"
      style={{
        color: classColor,
      }}
    >
      Review complete
    </p>

    <h2 className="mt-2 text-3xl font-bold text-(--text-primary)">
      {knownPercentage}% known
    </h2>

    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-(--text-muted)">
      You knew {knownCount} of {totalCards}{' '}
      cards. Keep working on the cards that
      did not stick yet.
    </p>

    <div className="mx-auto mt-7 grid max-w-xl gap-3 sm:grid-cols-2">
      <ResultCard
        label="Known"
        value={knownCount}
      />

      <ResultCard
        label="Review again"
        value={reviewCount}
      />
    </div>

    <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
      <button
        type="button"
        onClick={onRestart}
        className="
          inline-flex items-center
          justify-center gap-2
          rounded-xl border
          border-(--border)
          px-4 py-2.5
          text-sm font-semibold
          text-(--text-primary)
          transition
          hover:bg-(--bg-hover)
        "
      >
        <LuRotateCcw />
        Review again
      </button>

      {reviewCount > 0 && (
        <button
          type="button"
          onClick={onReviewMissed}
          className="
            inline-flex items-center
            justify-center gap-2
            rounded-xl border
            border-(--border)
            px-4 py-2.5
            text-sm font-semibold
            text-(--text-primary)
            transition
            hover:bg-(--bg-hover)
          "
        >
          Review missed
        </button>
      )}

      <button
        type="button"
        onClick={onQuiz}
        className="
          rounded-xl px-5 py-2.5
          text-sm font-semibold
          text-white transition
          hover:opacity-90
        "
        style={{
          backgroundColor: classColor,
        }}
      >
        Start quiz
      </button>
    </div>
  </div>
)

const ResultCard = ({ label, value }) => (
  <div className="rounded-xl border border-(--border) bg-(--bg-page) p-4">
    <p className="text-2xl font-bold text-(--text-primary)">
      {value}
    </p>

    <p className="mt-1 text-sm text-(--text-muted)">
      {label}
    </p>
  </div>
)

export default FlashcardReview