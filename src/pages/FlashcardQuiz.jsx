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
  LuCircleHelp,
} from 'react-icons/lu'

import {
  QuizAnswerOption,
  QuizProgress,
} from '../components/flashcards/QuizComponents'

import QuizResults from '../components/flashcards/QuizResults'

import useFlashcardSets from '../hooks/useFlashcardSets'
import useFlashcards from '../hooks/useFlashcards'

import {
  buildQuizQuestions,
  calculatePercentage,
} from '../utils/quizUtils'

const FlashcardQuiz = () => {
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

  const [quizAttempt, setQuizAttempt] =
    useState(0)

  const [currentIndex, setCurrentIndex] =
    useState(0)

  const [
    selectedAnswer,
    setSelectedAnswer,
  ] = useState(null)

  const [score, setScore] = useState(0)

  const [answers, setAnswers] =
    useState([])

  const [isComplete, setIsComplete] =
    useState(false)

  const flashcardSet = useMemo(
    () =>
      flashcardSets.find(
        (set) =>
          String(set.id) ===
          String(setId),
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

  const questions = useMemo(
    () => buildQuizQuestions(cards),
    [cards, quizAttempt],
  )

  useEffect(() => {
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setScore(0)
    setAnswers([])
    setIsComplete(false)
  }, [setId])

  const loading =
    loadingSets || loadingCards

  const error = setError || cardError

  const currentQuestion =
    questions[currentIndex] || null

  const classColor =
    classItem?.color || '#26371f'

  const hasAnswered =
    selectedAnswer !== null

  const isAnswerCorrect =
    selectedAnswer ===
    currentQuestion?.correctAnswer

  const progress = isComplete
    ? 100
    : calculatePercentage(
        answers.length,
        questions.length,
      )

  const percentage =
    calculatePercentage(
      score,
      questions.length,
    )

  const handleSelectAnswer = (answer) => {
    if (
      hasAnswered ||
      !currentQuestion
    ) {
      return
    }

    const isCorrect =
      answer ===
      currentQuestion.correctAnswer

    setSelectedAnswer(answer)

    if (isCorrect) {
      setScore(
        (currentScore) =>
          currentScore + 1,
      )
    }

    setAnswers((currentAnswers) => [
      ...currentAnswers,
      {
        questionId:
          currentQuestion.id,
        selectedAnswer: answer,
        correctAnswer:
          currentQuestion.correctAnswer,
        isCorrect,
      },
    ])
  }

  const handleNextQuestion = () => {
    if (
      !hasAnswered ||
      !currentQuestion
    ) {
      return
    }

    const isLastQuestion =
      currentIndex ===
      questions.length - 1

    if (isLastQuestion) {
      setIsComplete(true)
      return
    }

    setCurrentIndex(
      (currentValue) =>
        currentValue + 1,
    )

    setSelectedAnswer(null)
  }

  const restartQuiz = () => {
    setQuizAttempt(
      (currentAttempt) =>
        currentAttempt + 1,
    )

    setCurrentIndex(0)
    setSelectedAnswer(null)
    setScore(0)
    setAnswers([])
    setIsComplete(false)
  }

  if (loading) {
    return (
      <QuizMessage>
        Loading quiz...
      </QuizMessage>
    )
  }

  if (error) {
    return (
      <QuizError
        setId={setId}
        message={error}
      />
    )
  }

  if (!flashcardSet) {
    return (
      <QuizError
        message="Flashcard set not found."
        backTo="/flashcards"
      />
    )
  }

  if (!cards?.length) {
    return (
      <QuizError
        setId={setId}
        message="Add flashcards to this set before starting a quiz."
      />
    )
  }

  if (
    !questions.length ||
    (!isComplete && !currentQuestion)
  ) {
    return (
      <QuizError
        setId={setId}
        message="The quiz could not be created from these flashcards."
      />
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

      <QuizHeader
        title={flashcardSet.title}
        currentIndex={currentIndex}
        totalQuestions={
          questions.length
        }
        isComplete={isComplete}
        classColor={classColor}
      />

      <section className="mt-7 overflow-hidden rounded-2xl border border-(--border) bg-(--bg-card)">
        <QuizProgress
          progress={progress}
          classColor={classColor}
        />

        {isComplete ? (
          <QuizResults
            score={score}
            questions={questions}
            answers={answers}
            percentage={percentage}
            classColor={classColor}
            onRestart={restartQuiz}
            onReview={() =>
              navigate(
                `/flashcards/${setId}/review`,
              )
            }
          />
        ) : (
          <div className="p-4 sm:p-6">
            <QuestionCard
              question={
                currentQuestion.question
              }
              classColor={classColor}
            />

            <div className="mt-4 grid gap-3">
              {currentQuestion.options.map(
                (option, index) => (
                  <QuizAnswerOption
                    key={`${currentQuestion.id}-${option}`}
                    option={option}
                    optionIndex={index}
                    selectedAnswer={
                      selectedAnswer
                    }
                    correctAnswer={
                      currentQuestion.correctAnswer
                    }
                    hasAnswered={
                      hasAnswered
                    }
                    onSelect={
                      handleSelectAnswer
                    }
                  />
                ),
              )}
            </div>

            {hasAnswered && (
              <AnswerFeedback
                isCorrect={
                  isAnswerCorrect
                }
              />
            )}

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                disabled={!hasAnswered}
                onClick={
                  handleNextQuestion
                }
                className="
                  inline-flex items-center
                  justify-center gap-2
                  rounded-xl px-5 py-2.5
                  text-sm font-semibold
                  text-white transition
                  hover:opacity-90
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
                style={{
                  backgroundColor:
                    classColor,
                }}
              >
                {currentIndex ===
                questions.length - 1
                  ? 'View results'
                  : 'Next question'}

                <LuArrowRight />
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}

const QuizHeader = ({
  title,
  currentIndex,
  totalQuestions,
  isComplete,
  classColor,
}) => (
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
          Quiz mode
        </p>

        <h1 className="mt-1 text-3xl font-bold text-(--text-primary)">
          {title}
        </h1>

        <p className="mt-1 text-sm text-(--text-muted)">
          Select the correct answer for
          each question.
        </p>
      </div>
    </div>

    {!isComplete && (
      <p className="text-sm font-semibold text-(--text-muted)">
        Question {currentIndex + 1} of{' '}
        {totalQuestions}
      </p>
    )}
  </header>
)

const QuestionCard = ({
  question,
  classColor,
}) => (
  <div className="rounded-2xl border border-(--border) bg-(--bg-page) px-5 py-7 sm:px-7">
    <div className="flex items-center gap-2">
      <LuCircleHelp
        style={{
          color: classColor,
        }}
      />

      <p
        className="text-xs font-bold uppercase tracking-wider"
        style={{
          color: classColor,
        }}
      >
        Question
      </p>
    </div>

    <h2 className="mt-4 whitespace-pre-wrap text-xl font-bold leading-8 text-(--text-primary) sm:text-2xl">
      {question}
    </h2>
  </div>
)

const AnswerFeedback = ({
  isCorrect,
}) => (
  <div
    className={`
      mt-5 rounded-xl border px-4 py-3
      ${
        isCorrect
          ? `
            border-emerald-500/40
            bg-emerald-500/10
            text-emerald-700
          `
          : `
            border-(--error-border)
            bg-(--error-bg)
            text-(--error-text)
          `
      }
    `}
  >
    <p className="text-sm font-semibold">
      {isCorrect
        ? 'Correct answer.'
        : 'Not quite. The correct answer is highlighted above.'}
    </p>
  </div>
)

const QuizMessage = ({ children }) => (
  <main className="mx-auto max-w-5xl px-4 py-8">
    <p className="text-sm text-(--text-muted)">
      {children}
    </p>
  </main>
)

const QuizError = ({
  setId,
  message,
  backTo,
}) => (
  <main className="mx-auto max-w-5xl px-4 py-8">
    <Link
      to={
        backTo ||
        `/flashcards/${setId}`
      }
      className="
        inline-flex items-center gap-2
        text-sm font-medium
        text-(--text-muted)
        transition
        hover:text-(--text-primary)
      "
    >
      <LuArrowLeft />
      Back
    </Link>

    <div className="mt-6 rounded-xl border border-(--error-border) bg-(--error-bg) p-4">
      <p className="text-sm text-(--error-text)">
        {message}
      </p>
    </div>
  </main>
)

export default FlashcardQuiz