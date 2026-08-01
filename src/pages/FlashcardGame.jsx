import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { LuArrowLeft, LuBlocks, LuRotateCcw } from 'react-icons/lu'

import useFlashcardSets from '../hooks/useFlashcardSets'
import useFlashcards from '../hooks/useFlashcards'

const BOARD_SIZE = 8

const PIECES = [
  { id: 'line4', cells: [[0, 0], [0, 1], [0, 2], [0, 3]], color: '#3f6b35' },
  { id: 'line3', cells: [[0, 0], [0, 1], [0, 2]], color: '#6f8d50' },
  { id: 'square', cells: [[0, 0], [0, 1], [1, 0], [1, 1]], color: '#7f9657' },
  { id: 'lshape', cells: [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]], color: '#9a8f4f' },
  { id: 'corner', cells: [[0, 0], [1, 0], [1, 1]], color: '#b08a3c' },
  { id: 'single', cells: [[0, 0]], color: '#4d7c3f' },
]

const createEmptyBoard = () =>
  Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => null),
  )

const getRandomItem = (items) =>
  items.length ? items[Math.floor(Math.random() * items.length)] : null

const shuffleItems = (items) =>
  [...items].sort(() => Math.random() - 0.5)

const FlashcardGame = () => {
  const { setId } = useParams()

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

  const [board, setBoard] = useState(createEmptyBoard)
  const [pieces, setPieces] = useState([])
  const [selectedPiece, setSelectedPiece] = useState(null)
  const [hoverCell, setHoverCell] = useState(null)
  const [score, setScore] = useState(0)
  const [needsQuestion, setNeedsQuestion] = useState(true)
  const [currentCard, setCurrentCard] = useState(null)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [usedCardIds, setUsedCardIds] = useState([])
  const [feedback, setFeedback] = useState(
    'Answer a question to unlock blocks.',
  )

  const flashcardSet = useMemo(
    () => flashcardSets.find(
      (set) => String(set.id) === String(setId),
    ),
    [flashcardSets, setId],
  )

  const classItem = useMemo(
    () => classes.find(
      (item) => String(item.id) === String(flashcardSet?.class_id),
    ),
    [classes, flashcardSet],
  )

  const classColor = classItem?.color || '#26371f'
  const loading = loadingSets || loadingCards
  const error = setError || cardError

  useEffect(() => {
    if (!cards.length) {
      setCurrentCard(null)
      return
    }

    setCurrentCard((existingCard) => {
      const stillExists = cards.some(
        (card) => card.id === existingCard?.id,
      )

      return stillExists ? existingCard : getRandomItem(cards)
    })
  }, [cards])

  useEffect(() => {
    setBoard(createEmptyBoard())
    setPieces([])
    setSelectedPiece(null)
    setHoverCell(null)
    setScore(0)
    setNeedsQuestion(true)
    setSelectedAnswer(null)
    setUsedCardIds([])
    setFeedback('Answer a question to unlock blocks.')
  }, [setId])

  const options = useMemo(() => {
    if (!currentCard) return []

    const wrongAnswers = shuffleItems(
      cards
        .filter((card) => card.id !== currentCard.id)
        .map((card) => card.back)
        .filter(
          (answer, index, answers) =>
            answer &&
            answer !== currentCard.back &&
            answers.indexOf(answer) === index,
        ),
    ).slice(0, 3)

    return shuffleItems([currentCard.back, ...wrongAnswers])
  }, [currentCard, cards])

  const chooseRandomCard = (usedIds = usedCardIds) => {
    if (!cards.length) return

    let availableCards = cards.filter(
      (card) => !usedIds.includes(card.id),
    )

    if (!availableCards.length) {
      availableCards = cards
      setUsedCardIds([])
    }

    setCurrentCard(getRandomItem(availableCards))
    setSelectedAnswer(null)
  }


  const getRandomPieces = () =>
    Array.from({ length: 3 }, (_, index) => {
      const base = getRandomItem(PIECES)

      return {
        ...base,
        instanceId: `${base.id}-${Date.now()}-${index}`,
      }
    })

  const canPlacePiece = (
    piece,
    row,
    col,
    currentBoard = board,
  ) => {
    if (!piece) return false

    return piece.cells.every(([r, c]) => {
      const nextRow = row + r
      const nextCol = col + c

      return (
        nextRow >= 0 &&
        nextRow < BOARD_SIZE &&
        nextCol >= 0 &&
        nextCol < BOARD_SIZE &&
        !currentBoard[nextRow][nextCol]
      )
    })
  }

  const isPreviewCell = (row, col) => {
    if (!selectedPiece || !hoverCell) return false

    return selectedPiece.cells.some(
      ([r, c]) =>
        hoverCell.row + r === row &&
        hoverCell.col + c === col,
    )
  }

  const clearLines = (newBoard) => {
    const fullRows = newBoard
      .map((row, index) => (row.every(Boolean) ? index : null))
      .filter((index) => index !== null)

    const fullColumns = []

    for (let column = 0; column < BOARD_SIZE; column += 1) {
      if (newBoard.every((row) => Boolean(row[column]))) {
        fullColumns.push(column)
      }
    }

    if (!fullRows.length && !fullColumns.length) {
      return { board: newBoard, cleared: 0 }
    }

    const clearedBoard = newBoard.map((row, rowIndex) =>
      row.map((cell, columnIndex) => {
        const shouldClear =
          fullRows.includes(rowIndex) ||
          fullColumns.includes(columnIndex)

        return shouldClear ? null : cell
      }),
    )

    return {
      board: clearedBoard,
      cleared: fullRows.length + fullColumns.length,
    }
  }

  const handleAnswer = (answer) => {
    if (
      !needsQuestion ||
      selectedAnswer ||
      !currentCard
    ) {
      return
    }

    const wasCorrect =
      answer === currentCard.back

    setSelectedAnswer(answer)

    if (!wasCorrect) {
      setFeedback(
        'Incorrect. A new card is coming next.',
      )

      window.setTimeout(() => {
        chooseRandomCard()
        setFeedback(
          'Answer a question to unlock blocks.',
        )
      }, 700)

      return
    }

    setUsedCardIds((currentIds) => [
      ...currentIds,
      currentCard.id,
    ])
    setPieces(getRandomPieces())
    setNeedsQuestion(false)
    setSelectedPiece(null)
    setHoverCell(null)
    setFeedback(
      'Correct. Pick a piece, then place it on the board.',
    )
  }

  const placePiece = (row, col) => {
    if (!selectedPiece) {
      setFeedback('Pick a piece first.')
      return
    }

    if (!canPlacePiece(selectedPiece, row, col)) {
      setFeedback('That piece does not fit there.')
      return
    }

    const newBoard = board.map((boardRow) => [...boardRow])

    selectedPiece.cells.forEach(([r, c]) => {
      newBoard[row + r][col + c] = selectedPiece.color
    })

    const result = clearLines(newBoard)
    const remainingPieces = pieces.filter(
      (piece) => piece.instanceId !== selectedPiece.instanceId,
    )

    setBoard(result.board)
    setPieces(remainingPieces)
    setSelectedPiece(null)
    setHoverCell(null)

    const placementPoints = selectedPiece.cells.length * 10
    const clearBonus = result.cleared * 100

    setScore(
      (currentScore) =>
        currentScore + placementPoints + clearBonus,
    )

    if (!remainingPieces.length) {
      setNeedsQuestion(true)
      chooseRandomCard()
      setFeedback(
        'Answer another question to unlock more blocks.',
      )
      return
    }

    setFeedback(
      result.cleared
        ? 'Line cleared. Bonus added.'
        : 'Piece placed.',
    )
  }

  const resetGame = () => {
    setBoard(createEmptyBoard())
    setPieces([])
    setSelectedPiece(null)
    setHoverCell(null)
    setScore(0)
    setNeedsQuestion(true)
    setSelectedAnswer(null)
    setUsedCardIds([])
    setCurrentCard(getRandomItem(cards))
    setFeedback('Answer a question to unlock blocks.')
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-sm text-(--text-muted)">
          Loading game...
        </p>
      </main>
    )
  }

  if (!flashcardSet || !cards.length || !currentCard) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Link
          to={`/flashcards/${setId}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-(--text-muted) transition hover:text-(--text-primary)"
        >
          <LuArrowLeft />
          Back to set
        </Link>

        <div className="mt-6 rounded-xl border border-(--error-border) bg-(--error-bg) p-4">
          <p className="text-sm text-(--error-text)">
            {error ||
              'This set needs at least one card before you can play.'}
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <Link
        to={`/flashcards/${setId}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-(--text-muted) transition hover:text-(--text-primary)"
      >
        <LuArrowLeft />
        Back to set
      </Link>

      <header className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="flex items-start gap-4">
          <div
            className="mt-1 h-14 w-2 rounded-full"
            style={{ backgroundColor: classColor }}
          />

          <div>
            <p
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: classColor }}
            >
              Flashcard game
            </p>

            <h1 className="mt-1 text-3xl font-bold text-(--text-primary)">
              {flashcardSet.title}
            </h1>

            <p className="mt-1 text-sm text-(--text-muted)">
              Answer correctly to unlock blocks and clear the board.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={resetGame}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-(--border) px-4 py-2.5 text-sm font-semibold text-(--text-primary) transition hover:bg-(--bg-hover)"
        >
          <LuRotateCcw />
          Reset game
        </button>
      </header>

      <section className="mt-7 overflow-hidden rounded-2xl border border-(--border) bg-(--bg-card)">
        <div className="flex flex-col gap-4 border-b border-(--border) px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-(--text-primary)">
              {needsQuestion
                ? 'Answer a question'
                : 'Place your blocks'}
            </p>

            <p className="mt-1 text-sm text-(--text-muted)">
              {feedback}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 self-start rounded-xl border border-(--border) bg-(--bg-page) px-4 py-2 sm:self-auto">
            <LuBlocks style={{ color: classColor }} />
            <span className="text-sm font-bold text-(--text-primary)">
              {score} points
            </span>
          </div>
        </div>

        {error && (
          <div className="mx-5 mt-5 rounded-xl border border-(--error-border) bg-(--error-bg) p-4">
            <p className="text-sm text-(--error-text)">
              {error}
            </p>
          </div>
        )}

        <div className="grid gap-5 p-4 sm:p-6 xl:grid-cols-[340px_1fr]">
          <aside>
            {needsQuestion ? (
              <QuestionPanel
                currentCard={currentCard}
                options={options}
                selectedAnswer={selectedAnswer}
                onAnswer={handleAnswer}
                cards={cards}
                classColor={classColor}
              />
            ) : (
              <PiecesPanel
                pieces={pieces}
                selectedPiece={selectedPiece}
                setSelectedPiece={setSelectedPiece}
                setHoverCell={setHoverCell}
                setFeedback={setFeedback}
                classColor={classColor}
              />
            )}
          </aside>

          <div className="rounded-2xl border border-(--border) bg-(--bg-page) p-4 sm:p-5">
            <div className="mb-4">
              <p className="text-sm font-semibold text-(--text-primary)">
                Board
              </p>
              <p className="mt-1 text-sm text-(--text-muted)">
                Select a piece and hover over the grid to preview it.
              </p>
            </div>

            <div className="flex justify-center overflow-x-auto pb-1">
              <div
                onMouseLeave={() => setHoverCell(null)}
                className="grid grid-cols-8 gap-1.5 rounded-2xl border border-(--border) bg-(--bg-hover) p-2"
              >
                {board.map((rowItems, row) =>
                  rowItems.map((cell, column) => {
                    const preview = isPreviewCell(row, column)
                    const validPreview =
                      selectedPiece && hoverCell
                        ? canPlacePiece(
                            selectedPiece,
                            hoverCell.row,
                            hoverCell.col,
                          )
                        : false

                    return (
                      <button
                        key={`${row}-${column}`}
                        type="button"
                        aria-label={`Board row ${row + 1}, column ${column + 1}`}
                        onMouseEnter={() =>
                          setHoverCell({ row, col: column })
                        }
                        onClick={() => placePiece(row, column)}
                        className="h-9 w-9 rounded-lg border transition sm:h-12 sm:w-12 md:h-14 md:w-14"
                        style={{
                          backgroundColor:
                            cell ||
                            (preview
                              ? validPreview
                                ? selectedPiece.color
                                : 'var(--error-text)'
                              : 'var(--bg-card)'),
                          borderColor: preview
                            ? classColor
                            : 'var(--border)',
                          opacity: preview && !cell ? 0.78 : 1,
                        }}
                      />
                    )
                  }),
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

const PiecesPanel = ({
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

const QuestionPanel = ({
  currentCard,
  options,
  selectedAnswer,
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
            disabled={Boolean(selectedAnswer)}
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

export default FlashcardGame