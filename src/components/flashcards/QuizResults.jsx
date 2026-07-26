import {
  LuCheck,
  LuRotateCcw,
} from 'react-icons/lu'

const QuizResults = ({
  score,
  questions,
  answers,
  percentage,
  classColor,
  onRestart,
  onReview,
}) => {
  const incorrectAnswers =
    answers.filter(
      (answer) => !answer.isCorrect,
    )

  return (
    <div className="px-5 py-10 sm:px-8">
      <div className="text-center">
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
          Quiz complete
        </p>

        <h2 className="mt-2 text-3xl font-bold text-(--text-primary)">
          {score} / {questions.length}
        </h2>

        <p className="mt-2 text-sm text-(--text-muted)">
          You scored {percentage}%.
        </p>

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
            Try again
          </button>

          <button
            type="button"
            onClick={onReview}
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
            Review cards
          </button>
        </div>
      </div>

      {incorrectAnswers.length === 0 ? (
        <PerfectScoreMessage />
      ) : (
        <IncorrectAnswers
          answers={incorrectAnswers}
          questions={questions}
        />
      )}
    </div>
  )
}

const PerfectScoreMessage = () => (
  <div className="mt-10 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center">
    <p className="font-semibold text-emerald-700">
      Perfect score. You answered every
      question correctly.
    </p>
  </div>
)

const IncorrectAnswers = ({
  answers,
  questions,
}) => (
  <div className="mt-10 border-t border-(--border) pt-7">
    <h3 className="font-bold text-(--text-primary)">
      Questions to revisit
    </h3>

    <p className="mt-1 text-sm text-(--text-muted)">
      Review the questions you missed
      before attempting the quiz again.
    </p>

    <div className="mt-4 grid gap-3">
      {answers.map((answer) => {
        const question = questions.find(
          (item) =>
            String(item.id) ===
            String(answer.questionId),
        )

        return (
          <article
            key={answer.questionId}
            className="rounded-xl border border-(--border) bg-(--bg-page) p-4"
          >
            <p className="font-semibold text-(--text-primary)">
              {question?.question ||
                'Question unavailable'}
            </p>

            <p className="mt-3 text-sm text-(--error-text)">
              Your answer:{' '}
              {answer.selectedAnswer}
            </p>

            <p className="mt-1 text-sm text-emerald-700">
              Correct answer:{' '}
              {answer.correctAnswer}
            </p>
          </article>
        )
      })}
    </div>
  </div>
)

export default QuizResults