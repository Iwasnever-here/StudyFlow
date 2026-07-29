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

import useClasses from '../useClasses'

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

const testClasses = [
  {
    id: 1,
    user_id: 'user-1',
    name: 'Economics',
    code: 'EC101',
    lecturer: 'Dr Smith',
    color: '#26371f',
    target_grade: 70,
    credits: 20,
  },
  {
    id: 2,
    user_id: 'user-1',
    name: 'Finance',
    code: 'FN201',
    lecturer: null,
    color: '#7a8357',
    target_grade: 75,
    credits: 20,
  },
]

const createFetchQuery = ({
  data = testClasses,
  error = null,
} = {}) => {
  const query = {
    select: vi.fn(),
    order: vi.fn(),
    then: (
      resolve,
      reject,
    ) =>
      Promise.resolve({
        data,
        error,
      }).then(resolve, reject),
  }

  query.select.mockReturnValue(query)
  query.order.mockReturnValue(query)

  return query
}

const createSingleQuery = ({
  method,
  data = null,
  error = null,
}) => {
  const query = {
    [method]: vi.fn(),
    select: vi.fn(),
    eq: vi.fn(),
    single: vi.fn(),
  }

  query[method].mockReturnValue(query)
  query.select.mockReturnValue(query)
  query.eq.mockReturnValue(query)

  query.single.mockResolvedValue({
    data,
    error,
  })

  return query
}

const setupQueries = ({
  fetchQuery = createFetchQuery(),
  additionalQueries = [],
} = {}) => {
  const queries = [
    fetchQuery,
    ...additionalQueries,
  ]

  mockFrom.mockImplementation(
    (table) => {
      if (table !== 'classes') {
        throw new Error(
          `Unexpected table: ${table}`,
        )
      }

      const query = queries.shift()

      if (!query) {
        throw new Error(
          'No mocked classes query remains.',
        )
      }

      return query
    },
  )

  return fetchQuery
}

const renderLoadedHook = async (
  options,
) => {
  const hook = renderHook(() =>
    useClasses(options),
  )

  await waitFor(() => {
    expect(
      hook.result.current.loading,
    ).toBe(false)
  })

  return hook
}

describe('useClasses', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFrom.mockReset()

    getAuthenticatedUser
      .mockResolvedValue(testUser)
  })

  it('fetches classes on mount', async () => {
    const fetchQuery =
      setupQueries()

    const { result } =
      await renderLoadedHook()

    expect(
      mockFrom,
    ).toHaveBeenCalledWith(
      'classes',
    )

    expect(
      fetchQuery.select,
    ).toHaveBeenCalledWith(
      expect.stringContaining(
        'target_grade',
      ),
    )

    expect(
      fetchQuery.order,
    ).toHaveBeenCalledWith(
      'name',
      {
        ascending: true,
      },
    )

    expect(
      result.current.classes,
    ).toEqual(testClasses)

    expect(
      result.current.error,
    ).toBeNull()
  })

  it('skips the initial fetch when fetchOnMount is false', () => {
    const { result } =
      renderHook(() =>
        useClasses({
          fetchOnMount: false,
        }),
      )

    expect(
      mockFrom,
    ).not.toHaveBeenCalled()

    expect(
      result.current.classes,
    ).toEqual([])

    expect(
      result.current.loading,
    ).toBe(false)
  })

  it('handles a class fetch failure', async () => {
    setupQueries({
      fetchQuery:
        createFetchQuery({
          error: {
            message:
              'Unable to load classes.',
          },
        }),
    })

    const { result } =
      await renderLoadedHook()

    expect(
      result.current.classes,
    ).toEqual([])

    expect(
      result.current.error,
    ).toBe(
      'Unable to load classes.',
    )

    expect(
      result.current.loading,
    ).toBe(false)
  })

  it('manually refetches classes', async () => {
    const refreshedClasses = [
      ...testClasses,
      {
        id: 3,
        user_id: 'user-1',
        name: 'Statistics',
        code: 'ST301',
        lecturer: null,
        color: '#26371f',
        target_grade: null,
        credits: 10,
      },
    ]

    setupQueries({
      additionalQueries: [
        createFetchQuery({
          data: refreshedClasses,
        }),
      ],
    })

    const { result } =
      await renderLoadedHook()

    let returnedClasses

    await act(async () => {
      returnedClasses =
        await result.current
          .fetchClasses()
    })

    expect(
      returnedClasses,
    ).toEqual(refreshedClasses)

    expect(
      result.current.classes,
    ).toEqual(refreshedClasses)

    expect(
      mockFrom,
    ).toHaveBeenCalledTimes(2)
  })

  it('fetches one class by ID for the authenticated user', async () => {
    const fetchByIdQuery =
      createSingleQuery({
        method: 'select',
        data: testClasses[0],
      })

    setupQueries({
      additionalQueries: [
        fetchByIdQuery,
      ],
    })

    const { result } =
      await renderLoadedHook()

    let returnedClass

    await act(async () => {
      returnedClass =
        await result.current
          .fetchClassById(1)
    })

    expect(
      getAuthenticatedUser,
    ).toHaveBeenCalledWith(
      expect.anything(),
      'You must be signed in to manage classes.',
    )

    expect(
      fetchByIdQuery.eq,
    ).toHaveBeenNthCalledWith(
      1,
      'id',
      1,
    )

    expect(
      fetchByIdQuery.eq,
    ).toHaveBeenNthCalledWith(
      2,
      'user_id',
      'user-1',
    )

    expect(returnedClass).toEqual(
      testClasses[0],
    )
  })

  it('rejects fetching a class without an ID', async () => {
    setupQueries()

    const { result } =
      await renderLoadedHook()

    let caughtError

    await act(async () => {
      try {
        await result.current
          .fetchClassById(null)
      } catch (error) {
        caughtError = error
      }
    })

    expect(caughtError).toEqual(
      new Error(
        'A class ID is required.',
      ),
    )

    expect(
      result.current.error,
    ).toBe(
      'A class ID is required.',
    )

    expect(
      getAuthenticatedUser,
    ).not.toHaveBeenCalled()
  })

  it('creates and normalises a class', async () => {
    const createdClass = {
      id: 3,
      user_id: 'user-1',
      name: 'Accounting',
      code: 'AC101',
      lecturer: 'Dr Jones',
      color: '#26371f',
      target_grade: 80,
      credits: 15,
    }

    const insertQuery =
      createSingleQuery({
        method: 'insert',
        data: createdClass,
      })

    setupQueries({
      additionalQueries: [
        insertQuery,
      ],
    })

    const { result } =
      await renderLoadedHook()

    let returnedClass

    await act(async () => {
      returnedClass =
        await result.current
          .createClass({
            name: '  Accounting  ',
            code: '  ac101  ',
            lecturer:
              '  Dr Jones  ',
            color: '',
            target_grade: '80',
            credits: '15',
          })
    })

    expect(
      insertQuery.insert,
    ).toHaveBeenCalledWith({
      user_id: 'user-1',
      name: 'Accounting',
      code: 'AC101',
      lecturer: 'Dr Jones',
      color: '#26371f',
      target_grade: 80,
      credits: 15,
    })

    expect(returnedClass).toEqual(
      createdClass,
    )

    expect(
      result.current.classes.map(
        (classItem) =>
          classItem.name,
      ),
    ).toEqual([
      'Accounting',
      'Economics',
      'Finance',
    ])
  })

  it.each([
    {
      name: '   ',
      code: 'EC101',
      target_grade: '70',
      credits: '20',
      message:
        'Please enter a class name.',
    },
    {
      name: 'Economics',
      code: '   ',
      target_grade: '70',
      credits: '20',
      message:
        'Please enter a class code.',
    },
    {
      name: 'Economics',
      code: 'EC101',
      target_grade: '101',
      credits: '20',
      message:
        'Target grade must be between 0 and 100.',
    },
    {
      name: 'Economics',
      code: 'EC101',
      target_grade: '70',
      credits: '-1',
      message:
        'Credits must be a valid non-negative number.',
    },
  ])(
    'validates invalid class data: $message',
    async ({
      message,
      ...formData
    }) => {
      setupQueries()

      const { result } =
        await renderLoadedHook()

      let caughtError

      await act(async () => {
        try {
          await result.current
            .createClass(formData)
        } catch (error) {
          caughtError = error
        }
      })

      expect(caughtError).toEqual(
        new Error(message),
      )

      expect(
        result.current.error,
      ).toBe(message)
    },
  )

  it('updates a class and keeps the list sorted', async () => {
    const updatedClass = {
      ...testClasses[1],
      name: 'Accounting',
      code: 'AC201',
      lecturer: 'Dr Green',
      target_grade: 82,
      credits: 15,
    }

    const updateQuery =
      createSingleQuery({
        method: 'update',
        data: updatedClass,
      })

    setupQueries({
      additionalQueries: [
        updateQuery,
      ],
    })

    const { result } =
      await renderLoadedHook()

    let returnedClass

    await act(async () => {
      returnedClass =
        await result.current
          .updateClass(
            2,
            {
              name:
                ' Accounting ',
              code: ' ac201 ',
              lecturer:
                ' Dr Green ',
              color: '#7a8357',
              target_grade: '82',
              credits: '15',
            },
          )
    })

    expect(
      updateQuery.update,
    ).toHaveBeenCalledWith({
      name: 'Accounting',
      code: 'AC201',
      lecturer: 'Dr Green',
      color: '#7a8357',
      target_grade: 82,
      credits: 15,
    })

    expect(
      updateQuery.eq,
    ).toHaveBeenNthCalledWith(
      1,
      'id',
      2,
    )

    expect(
      updateQuery.eq,
    ).toHaveBeenNthCalledWith(
      2,
      'user_id',
      'user-1',
    )

    expect(returnedClass).toEqual(
      updatedClass,
    )

    expect(
      result.current.classes.map(
        (classItem) =>
          classItem.name,
      ),
    ).toEqual([
      'Accounting',
      'Economics',
    ])
  })

  it('handles a class mutation failure and allows the error to be cleared', async () => {
    const insertQuery =
      createSingleQuery({
        method: 'insert',
        error: {
          message:
            'Unable to create class.',
        },
      })

    setupQueries({
      additionalQueries: [
        insertQuery,
      ],
    })

    const { result } =
      await renderLoadedHook()

    let caughtError

    await act(async () => {
      try {
        await result.current
          .createClass({
            name: 'Law',
            code: 'LW101',
            lecturer: '',
            color: '',
            target_grade: '',
            credits: '',
          })
      } catch (error) {
        caughtError = error
      }
    })

    expect(caughtError).toEqual({
      message:
        'Unable to create class.',
    })

    expect(
      result.current.error,
    ).toBe(
      'Unable to create class.',
    )

    expect(
      result.current.classes,
    ).toEqual(testClasses)

    act(() => {
      result.current.setError(null)
    })

    expect(
      result.current.error,
    ).toBeNull()
  })
})