export const BOARD_SIZE = 8

export const PIECES = [
  { id: 'line4', cells: [[0, 0], [0, 1], [0, 2], [0, 3]], color: '#3f6b35' },
  { id: 'line3', cells: [[0, 0], [0, 1], [0, 2]], color: '#6f8d50' },
  { id: 'square', cells: [[0, 0], [0, 1], [1, 0], [1, 1]], color: '#7f9657' },
  { id: 'lshape', cells: [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]], color: '#9a8f4f' },
  { id: 'corner', cells: [[0, 0], [1, 0], [1, 1]], color: '#b08a3c' },
  { id: 'single', cells: [[0, 0]], color: '#4d7c3f' },
]

export const createEmptyBoard = () =>
  Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => null),
  )

export const getRandomItem = (items) =>
  items.length ? items[Math.floor(Math.random() * items.length)] : null

export const shuffleItems = (items) =>
  [...items].sort(() => Math.random() - 0.5)

export const canPlacePiece = (piece, row, col, currentBoard) => {
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

export const clearLines = (newBoard) => {
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

export const getRandomPieces = () =>
  Array.from({ length: 3 }, (_, index) => {
    const base = getRandomItem(PIECES)

    return {
      ...base,
      instanceId: `${base.id}-${Date.now()}-${index}`,
    }
  })