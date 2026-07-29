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

import useFlashcardSets from '../useFlashcardSets'

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

const testClasses = [
  {
    id: 1,
    name: 'Economics',
    code: 'EC101',
    color: '#123456',
  },
  {
    id: 2,
    name: 'Finance',
    code: 'FN201',
    color: '#654321',
  },
]

const testSets = [
  {
    id: 1,
    class_id: 1,
    title: 'Microeconomics',
    created_at:
      '2026-07-29T10:00:00Z',
    flashcards: [
      {
        id: 10,
      },
      {
        id: 11,
      },
    ],
  },
  {
    id: 2,
    class_id: 2,
    title: 'Corporate finance',
    created_at:
      '2026-07-28T10:00:00Z',
    flashcards: [],
  },
]

const createFetchQuery = (
  result,
) => {
  const query = {
    select: vi.fn(),
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
  classes = testClasses,
  sets = testSets,
  classesError = null,
  setsError = null,
  mutationQuery = null,
} = {}) => {
  const classesQuery =
    createFetchQuery({
      data: classes,
      error: classesError,
    })

  const setsQuery =
    createFetchQuery({
      data: sets,
      error: setsError,
    })

  let setsCallCount = 0

  mockFrom.mockImplementation(
    (table) => {
      if (table === 'classes') {
        return classesQuery
      }

      if (
        table ===
        'flashcard_sets'
      ) {
        setsCallCount += 1

        if (
          setsCallCount === 1 ||
          !mutationQuery
        ) {
          return setsQuery
        }

        return mutationQuery
      }

      throw new Error(
        `Unexpected table: ${table}`,
      )
    },
  )

  return {
    classesQuery,
    setsQuery,
  }
}

const renderLoadedHook =
  async () => {
    const hook =
      renderHook(
        () => useFlashcardSets(),
      )

    await waitFor(() => {
      expect(
        hook.result.current.loading,
      ).toBe(false)
    })

    return hook
  }

describe('useFlashcardSets', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFrom.mockReset()
  })

  it('fetches classes and flashcard sets on mount', async () => {
    const {
      classesQuery,
      setsQuery,
    } = setupQueries()

    const { result } =
      await renderLoadedHook()

    expect(
      mockFrom,
    ).toHaveBeenCalledWith(
      'classes',
    )

    expect(
      mockFrom,
    ).toHaveBeenCalledWith(
      'flashcard_sets',
    )

    expect(
      classesQuery.select,
    ).toHaveBeenCalledWith(
      'id, name, code, color',
    )

    expect(
      classesQuery.order,
    ).toHaveBeenCalledWith(
      'name',
      {
        ascending: true,
      },
    )

    expect(
      setsQuery.order,
    ).toHaveBeenCalledWith(
      'created_at',
      {
        ascending: false,
      },
    )

    expect(
      result.current.classes,
    ).toEqual(testClasses)

    expect(
      result.current
        .flashcardSets,
    ).toEqual(testSets)

    expect(
      result.current.loadingClasses,
    ).toBe(false)

    expect(
      result.current.loadingSets,
    ).toBe(false)
  })

  it('combines class and set loading errors', async () => {
    setupQueries({
      classesError: {
        message:
          'Unable to load classes.',
      },
      setsError: {
        message:
          'Unable to load sets.',
      },
    })

    const { result } =
      await renderLoadedHook()

    expect(
      result.current.classes,
    ).toEqual([])

    expect(
      result.current
        .flashcardSets,
    ).toEqual([])

    expect(
      result.current.error,
    ).toContain(
      'Unable to load classes.',
    )

    expect(
      result.current.error,
    ).toContain(
      'Unable to load sets.',
    )
  })

  it('creates a flashcard set', async () => {
    const createdData = {
      id: 3,
      class_id: 1,
      title: 'Macroeconomics',
      created_at:
        '2026-07-30T10:00:00Z',
    }

    const insertQuery =
      createInsertQuery({
        data: createdData,
        error: null,
      })

    setupQueries({
      mutationQuery:
        insertQuery,
    })

    const { result } =
      await renderLoadedHook()

    let createdSet

    await act(async () => {
      createdSet =
        await result.current
          .createFlashcardSet({
            title:
              '  Macroeconomics  ',
            class_id: 1,
          })
    })

    expect(
      insertQuery.insert,
    ).toHaveBeenCalledWith({
      class_id: 1,
      title: 'Macroeconomics',
    })

    expect(createdSet).toEqual({
      ...createdData,
      flashcards: [],
    })

    expect(
      result.current
        .flashcardSets[0],
    ).toEqual({
      ...createdData,
      flashcards: [],
    })
  })

  it('validates flashcard set creation', async () => {
    setupQueries()

    const { result } =
      await renderLoadedHook()

    await expect(
      result.current
        .createFlashcardSet({
          title: 'Economics',
          class_id: '',
        }),
    ).rejects.toThrow(
      'Please select a class.',
    )

    await expect(
      result.current
        .createFlashcardSet({
          title: '   ',
          class_id: 1,
        }),
    ).rejects.toThrow(
      'Please enter a set title.',
    )
  })

  it('updates a flashcard set', async () => {
    const updatedData = {
      id: 1,
      class_id: 2,
      title: 'Updated economics',
      created_at:
        '2026-07-29T10:00:00Z',
    }

    const updateQuery =
      createUpdateQuery({
        data: updatedData,
        error: null,
      })

    setupQueries({
      mutationQuery:
        updateQuery,
    })

    const { result } =
      await renderLoadedHook()

    let returnedSet

    await act(async () => {
      returnedSet =
        await result.current
          .updateFlashcardSet(
            1,
            {
              title:
                '  Updated economics  ',
              class_id: 2,
            },
          )
    })

    expect(
      updateQuery.update,
    ).toHaveBeenCalledWith({
      title:
        'Updated economics',
      class_id: 2,
    })

    expect(
      updateQuery.eq,
    ).toHaveBeenCalledWith(
      'id',
      1,
    )

    expect(
      returnedSet,
    ).toEqual(updatedData)

    expect(
      result.current
        .flashcardSets.find(
          (set) => set.id === 1,
        ),
    ).toEqual({
      ...testSets[0],
      ...updatedData,
    })
  })

  it('deletes a flashcard set', async () => {
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
        .deleteFlashcardSet(1)
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
      result.current
        .flashcardSets,
    ).toEqual([testSets[1]])
  })

  it('refetches classes and flashcard sets', async () => {
    setupQueries()

    const { result } =
      await renderLoadedHook()

    expect(
      mockFrom,
    ).toHaveBeenCalledTimes(2)

    await act(async () => {
      await result.current.refetch()
    })

    expect(
      mockFrom,
    ).toHaveBeenCalledTimes(4)
  })
})