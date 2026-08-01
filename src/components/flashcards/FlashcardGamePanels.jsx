export const PiecesPanel = ({
  pieces,
  selectedPiece,
  setSelectedPiece,
  setHoverCell,
  setFeedback,
  classColor,
}) => (
  <div className="rounded-2xl border border-(--border) bg-(--bg-page) p-5">
    <p className="text-sm font-semibold text-(--text-primary)">
      Available pieces
    </p>

    <p className="mt-1 text-sm text-(--text-muted)">
      Choose one, then click where it should start.
    </p>

    <div className="mt-5 flex flex-col gap-3">
      {pieces.map((piece) => {
        const isSelected =
          selectedPiece?.instanceId === piece.instanceId

        return (
          <button
            key={piece.instanceId}
            type="button"
            onClick={() => {
              setSelectedPiece(piece)
              setHoverCell(null)
              setFeedback(
                'Hover over the board to preview placement.',
              )
            }}
            className="w-full rounded-xl border p-4 text-left transition hover:bg-(--bg-hover)"
            style={{
              borderColor: isSelected
                ? classColor
                : 'var(--border)',
              backgroundColor: isSelected
                ? 'var(--bg-hover)'
                : 'var(--bg-card)',
            }}
          >
            <div className="flex items-center justify-between gap-4">
              <PiecePreview piece={piece} />
              <span className="text-xs font-bold uppercase tracking-wider text-(--text-muted)">
                {piece.cells.length} blocks
              </span>
            </div>
          </button>
        )
      })}
    </div>
  </div>
)

export const QuestionPanel = ({
  currentCard,
  options,
  selectedAnswer,
  savingAnswer,
  onAnswer,
  cards,
  classColor,
}) => (
  <div className="rounded-2xl border border-(--border) bg-(--bg-page) p-5">
    <p
      className="text-xs font-bold uppercase tracking-wider"
      style={{ color: classColor }}
    >
      Question
    </p>

    <h2 className="mt-4 whitespace-pre-wrap text-xl font-bold leading-8 text-(--text-primary)">
      {currentCard.front}
    </h2>

    <div className="mt-5 grid gap-3">
      {options.map((option, index) => {
        const isSelected = selectedAnswer === option
        const isCorrect = option === currentCard.back

        let optionStyle = {
          borderColor: 'var(--border)',
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-primary)',
        }

        if (selectedAnswer && isCorrect) {
          optionStyle = {
            borderColor: classColor,
            backgroundColor: 'var(--bg-hover)',
            color: 'var(--text-primary)',
          }
        } else if (selectedAnswer && isSelected) {
          optionStyle = {
            borderColor: 'var(--error-border)',
            backgroundColor: 'var(--error-bg)',
            color: 'var(--error-text)',
          }
        }

        return (
          <button
            key={`${option}-${index}`}
            type="button"
            disabled={Boolean(selectedAnswer) || savingAnswer}
            onClick={() => onAnswer(option)}
            className="rounded-xl border px-4 py-3 text-left text-sm font-semibold transition hover:bg-(--bg-hover) disabled:cursor-not-allowed"
            style={optionStyle}
          >
            {option}
          </button>
        )
      })}
    </div>

    {cards.length < 4 && (
      <p className="mt-4 rounded-xl border border-(--border) bg-(--bg-card) px-4 py-3 text-xs font-medium text-(--text-muted)">
        Add at least four cards for stronger multiple-choice questions.
      </p>
    )}
  </div>
)

const PiecePreview = ({ piece }) => {
  const maxRow = Math.max(...piece.cells.map(([row]) => row))
  const maxColumn = Math.max(
    ...piece.cells.map(([, column]) => column),
  )

  return (
    <div
      className="inline-grid gap-1"
      style={{
        gridTemplateColumns: `repeat(${maxColumn + 1}, 24px)`,
        gridTemplateRows: `repeat(${maxRow + 1}, 24px)`,
      }}
    >
      {Array.from({
        length: (maxRow + 1) * (maxColumn + 1),
      }).map((_, index) => {
        const row = Math.floor(index / (maxColumn + 1))
        const column = index % (maxColumn + 1)
        const isActive = piece.cells.some(
          ([pieceRow, pieceColumn]) =>
            pieceRow === row && pieceColumn === column,
        )

        return (
          <div
            key={index}
            className="rounded-md"
            style={{
              width: 24,
              height: 24,
              backgroundColor: isActive
                ? piece.color
                : 'transparent',
            }}
          />
        )
      })}
    </div>
  )
}