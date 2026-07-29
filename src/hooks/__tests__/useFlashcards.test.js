import {
  act,
  renderHook,
  waitFor,
} from '@testing-library/react'

import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import useFlashcards from '../useFlashcards'
import {
  getAuthenticatedUser,
} from '../hookUtils'

const mockFrom = vi.fn()

vi.mock(
  '../../lib/supabaseClient',
  () => ({
    supabase: {
      from: (...args) =>
        mockFrom(...args),
    },
  }),
)

vi.mock('../hookUtils', () => ({
  getAuthenticatedUser: vi.fn(),
}))

const testUser = {
  id: 'user-1',
}

const testCards = [
  {
    id: 1,
    set_id: 10,
    class_id: 2,
    front: 'What is inflation?',
    back: 'A sustained rise in prices.',
    created_at:
      '2026-07-29T10:00:00Z',
  },
  {
    id: 2,
    set_id: 10,
    class_id: 2,
    front: 'What is GDP?',
    back: 'Gross domestic product.',
    created_at:
      '2026-07-29T11:00:00Z',
  },
]

const createFetchQuery = (
  result,
) => {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    then: (
      resolve,
      reject,
    ) =>
      Promise.resolve(result).then(
        resolve,
        reject,
      ),
  }

  query.select.mockReturnValue(query)
  query.eq.mockReturnValue(query)
  query.order.mockReturnValue(query)

  return query
}

const createInsertQuery = (
  result,
) => {
  const query = {
    insert: vi.fn(),
    select: vi.fn(),
    single: vi.fn(),
  }

  query.insert.mockReturnValue(query)
  query.select.mockReturnValue(query)
  query.single.mockResolvedValue(
    result,
  )

  return query
}

const createUpdateQuery = (
  result,
) => {
  const query = {
    update: vi.fn(),
    eq: vi.fn(),
    select: vi.fn(),
    single: vi.fn(),
  }

  query.update.mockReturnValue(query)
  query.eq.mockReturnValue(query)
  query.select.mockReturnValue(query)
  query.single.mockResolvedValue(
    result,
  )

  return query
}

const createDeleteQuery = (
  result = {
    error: null,
  },
) => {
  const query = {
    delete: vi.fn(),
    eq: vi.fn(),
  }

  query.delete.mockReturnValue(query)
  query.eq.mockResolvedValue(result)

  return query
}

const setupQueries = ({
  cards = testCards,
  fetchError = null,
  mutationQuery = null,
} = {}) => {
  const fetchQuery =
    createFetchQuery({
      data: cards,
      error: fetchError,
    })

  let callCount = 0

  mockFrom.mockImplementation(
    (table) => {
      if (table !== 'flashcards') {
        throw new Error(
          `Unexpected table: ${table}`,
        )
      }

      callCount += 1

      if (
        callCount === 1 ||
        !mutationQuery
      ) {
        return fetchQuery
      }

      return mutationQuery
    },
  )

  return {
    fetchQuery,
  }
}

const renderLoadedHook =
  async (setId = 10) => {
    const hook =
      renderHook(() =>
        useFlashcards(setId),
      )

    await waitFor(() => {
      expect(
        hook.result.current
          .loadingCards,
      ).toBe(false)
    })

    return hook
  }

describe('useFlashcards', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFrom.mockReset()

    getAuthenticatedUser
      .mockResolvedValue(testUser)
  })

  it('fetches cards for the selected set', async () => {
    const { fetchQuery } =
      setupQueries()

    const { result } =
      await renderLoadedHook(10)

    expect(
      mockFrom,
    ).toHaveBeenCalledWith(
      'flashcards',
    )

    expect(
      fetchQuery.eq,
    ).toHaveBeenCalledWith(
      'set_id',
      10,
    )

    expect(
      fetchQuery.order,
    ).toHaveBeenCalledWith(
      'created_at',
      {
        ascending: true,
      },
    )

    expect(
      result.current.cards,
    ).toEqual(testCards)

    expect(
      result.current.cardError,
    ).toBeNull()
  })

  it('does not fetch when no set id is provided', async () => {
    const { result } =
      await renderLoadedHook(null)

    expect(
      mockFrom,
    ).not.toHaveBeenCalled()

    expect(
      result.current.cards,
    ).toEqual([])

    expect(
      result.current.loadingCards,
    ).toBe(false)
  })

  it('shows an error when loading cards fails', async () => {
    setupQueries({
      fetchError: {
        message:
          'Unable to load cards.',
      },
    })

    const { result } =
      await renderLoadedHook()

    expect(
      result.current.cards,
    ).toEqual([])

    expect(
      result.current.cardError,
    ).toBe(
      'Unable to load cards.',
    )
  })

  it('creates a flashcard', async () => {
    const createdCard = {
      id: 3,
      set_id: 10,
      class_id: 2,
      front: 'What is demand?',
      back: 'The willingness to buy.',
      created_at:
        '2026-07-29T12:00:00Z',
    }

    const insertQuery =
      createInsertQuery({
        data: createdCard,
        error: null,
      })

    setupQueries({
      mutationQuery:
        insertQuery,
    })

    const { result } =
      await renderLoadedHook()

    let returnedCard

    await act(async () => {
      returnedCard =
        await result.current
          .createFlashcard({
            front:
              '  What is demand?  ',
            back:
              '  The willingness to buy.  ',
            classId: 2,
          })
    })

    expect(
      getAuthenticatedUser,
    ).toHaveBeenCalledWith(
      expect.anything(),
      'You must be signed in.',
    )

    expect(
      insertQuery.insert,
    ).toHaveBeenCalledWith({
      user_id: 'user-1',
      set_id: 10,
      class_id: 2,
      front: 'What is demand?',
      back:
        'The willingness to buy.',
    })

    expect(
      returnedCard,
    ).toEqual(createdCard)

    expect(
      result.current.cards,
    ).toEqual([
      ...testCards,
      createdCard,
    ])
  })

  it('validates flashcard creation', async () => {
    setupQueries()

    const { result } =
      await renderLoadedHook()

    await expect(
      result.current
        .createFlashcard({
          front: '   ',
          back: 'Answer',
          classId: 2,
        }),
    ).rejects.toThrow(
      'Please enter a question.',
    )

    await expect(
      result.current
        .createFlashcard({
          front: 'Question',
          back: '   ',
          classId: 2,
        }),
    ).rejects.toThrow(
      'Please enter an answer.',
    )
  })

  it('rejects creation when the set is missing', async () => {
    const { result } =
      await renderLoadedHook(null)

    await expect(
      result.current
        .createFlashcard({
          front: 'Question',
          back: 'Answer',
          classId: 2,
        }),
    ).rejects.toThrow(
      'Flashcard set could not be found.',
    )

    expect(
      getAuthenticatedUser,
    ).not.toHaveBeenCalled()
  })

  it('updates a flashcard', async () => {
    const updatedCard = {
      ...testCards[0],
      front: 'Updated question',
      back: 'Updated answer',
    }

    const updateQuery =
      createUpdateQuery({
        data: updatedCard,
        error: null,
      })

    setupQueries({
      mutationQuery:
        updateQuery,
    })

    const { result } =
      await renderLoadedHook()

    let returnedCard

    await act(async () => {
      returnedCard =
        await result.current
          .updateFlashcard(
            1,
            {
              front:
                '  Updated question  ',
              back:
                '  Updated answer  ',
            },
          )
    })

    expect(
      updateQuery.update,
    ).toHaveBeenCalledWith({
      front: 'Updated question',
      back: 'Updated answer',
    })

    expect(
      updateQuery.eq,
    ).toHaveBeenCalledWith(
      'id',
      1,
    )

    expect(
      returnedCard,
    ).toEqual(updatedCard)

    expect(
      result.current.cards.find(
        (card) => card.id === 1,
      ),
    ).toEqual(updatedCard)
  })

  it('deletes a flashcard', async () => {
    const deleteQuery =
      createDeleteQuery()

    setupQueries({
      mutationQuery:
        deleteQuery,
    })

    const { result } =
      await renderLoadedHook()

    await act(async () => {
      await result.current
        .deleteFlashcard(1)
    })

    expect(
      deleteQuery.delete,
    ).toHaveBeenCalled()

    expect(
      deleteQuery.eq,
    ).toHaveBeenCalledWith(
      'id',
      1,
    )

    expect(
      result.current.cards,
    ).toEqual([testCards[1]])
  })

  it('refetches cards', async () => {
    setupQueries()

    const { result } =
      await renderLoadedHook()

    expect(
      mockFrom,
    ).toHaveBeenCalledTimes(1)

    await act(async () => {
      await result.current
        .refetchCards()
    })

    expect(
      mockFrom,
    ).toHaveBeenCalledTimes(2)
  })
})