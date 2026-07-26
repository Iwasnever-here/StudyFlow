import {
  LuCheck,
  LuX,
} from 'react-icons/lu'

export const QuizProgress = ({
  progress,
  classColor,
}) => {
  return (
    <div className="border-b border-(--border) px-5 py-4">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-semibold text-(--text-primary)">
          Quiz progress
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
  )
}

export const QuizAnswerOption = ({
  option,
  optionIndex,
  selectedAnswer,
  correctAnswer,
  hasAnswered,
  onSelect,
}) => {
  const isCorrect =
    option === correctAnswer

  const isSelected =
    option === selectedAnswer

  const getOptionClasses = () => {
    const baseClasses = `
      flex w-full items-start gap-3
      rounded-xl border px-4 py-4
      text-left text-sm font-medium
      transition
    `

    if (!hasAnswered) {
      return `
        ${baseClasses}
        border-(--border)
        bg-(--bg-page)
        text-(--text-primary)
        hover:bg-(--bg-hover)
      `
    }

    if (isCorrect) {
      return `
        ${baseClasses}
        border-emerald-500/40
        bg-emerald-500/10
        text-emerald-700
      `
    }

    if (isSelected) {
      return `
        ${baseClasses}
        border-(--error-border)
        bg-(--error-bg)
        text-(--error-text)
      `
    }

    return `
      ${baseClasses}
      border-(--border)
      bg-(--bg-page)
      text-(--text-muted)
      opacity-60
    `
  }

  return (
    <button
      type="button"
      disabled={hasAnswered}
      onClick={() => onSelect(option)}
      className={getOptionClasses()}
    >
      <span
        className="
          flex h-7 w-7 shrink-0
          items-center justify-center
          rounded-lg border
          border-current
          text-xs font-bold
        "
      >
        {String.fromCharCode(
          65 + optionIndex,
        )}
      </span>

      <span className="whitespace-pre-wrap pt-1">
        {option}
      </span>

      {hasAnswered && isCorrect && (
        <LuCheck className="ml-auto mt-1 shrink-0" />
      )}

      {hasAnswered &&
        isSelected &&
        !isCorrect && (
          <LuX className="ml-auto mt-1 shrink-0" />
        )}
    </button>
  )
}