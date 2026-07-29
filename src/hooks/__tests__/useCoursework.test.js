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

import useCoursework from '../useCoursework'

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

const testCoursework = [
  {
    id: 1,
    class_id: 1,
    title: 'Economics essay',
    description: 'Write an essay',
    due_date: '2026-08-05',
    status: 'not_started',
    hours: 4,
    grade: null,
  },
  {
    id: 2,
    class_id: 2,
    title: 'Finance report',
    description: null,
    due_date: '2026-08-10',
    status: 'in_progress',
    hours: 3,
    grade: 72,
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

  query.eq.mockImplementation(
    () => query,
  )

  query.then = (
    resolve,
    reject,
  ) =>
    Promise.resolve(result).then(
      resolve,
      reject,
    )

  return query
}

const setupInitialFetch = ({
  classes = testClasses,
  coursework = testCoursework,
  classesError = null,
  courseworkError = null,
  assignmentMutation = null,
  timeBlocksMutation = null,
} = {}) => {
  const classesQuery =
    createFetchQuery({
      data: classes,
      error: classesError,
    })

  const courseworkQuery =
    createFetchQuery({
      data: coursework,
      error: courseworkError,
    })

  let assignmentsCallCount = 0

  mockFrom.mockImplementation(
    (table) => {
      if (table === 'classes') {
        return classesQuery
      }

      if (table === 'assignments') {
        assignmentsCallCount += 1

        if (
          assignmentsCallCount === 1 ||
          !assignmentMutation
        ) {
          return courseworkQuery
        }

        return assignmentMutation
      }

      if (
        table === 'time_blocks' &&
        timeBlocksMutation
      ) {
        return timeBlocksMutation
      }

      throw new Error(
        `Unexpected table: ${table}`,
      )
    },
  )

  return {
    classesQuery,
    courseworkQuery,
  }
}

const renderLoadedHook = async () => {
  const hook = renderHook(() =>
    useCoursework(),
  )

  await waitFor(() => {
    expect(
      hook.result.current.loading,
    ).toBe(false)
  })

  return hook
}

describe('useCoursework', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFrom.mockReset()

    getAuthenticatedUser
      .mockResolvedValue(testUser)
  })

  it('fetches classes and coursework on mount', async () => {
    const {
      classesQuery,
      courseworkQuery,
    } = setupInitialFetch()

    const { result } =
      await renderLoadedHook()

    expect(
      getAuthenticatedUser,
    ).toHaveBeenCalledWith(
      expect.anything(),
      'You must be signed in to view coursework.',
    )

    expect(
      mockFrom,
    ).toHaveBeenCalledWith(
      'classes',
    )

    expect(
      mockFrom,
    ).toHaveBeenCalledWith(
      'assignments',
    )

    expect(
      classesQuery.eq,
    ).toHaveBeenCalledWith(
      'user_id',
      'user-1',
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
      courseworkQuery.eq,
    ).toHaveBeenCalledWith(
      'user_id',
      'user-1',
    )

    expect(
      courseworkQuery.order,
    ).toHaveBeenCalledWith(
      'due_date',
      {
        ascending: true,
      },
    )

    expect(
      result.current.classes,
    ).toEqual(testClasses)

    expect(
      result.current.coursework,
    ).toEqual(testCoursework)

    expect(
      result.current.error,
    ).toBeNull()
  })

  it('handles a classes loading error', async () => {
    setupInitialFetch({
      classesError: {
        message:
          'Unable to load classes.',
      },
    })

    const { result } =
      await renderLoadedHook()

    expect(
      result.current.classes,
    ).toEqual([])

    expect(
      result.current.coursework,
    ).toEqual([])

    expect(
      result.current.error,
    ).toBe(
      'Unable to load classes.',
    )
  })

  it('handles a coursework loading error', async () => {
    setupInitialFetch({
      courseworkError: {
        message:
          'Unable to load coursework.',
      },
    })

    const { result } =
      await renderLoadedHook()

    expect(
      result.current.classes,
    ).toEqual([])

    expect(
      result.current.coursework,
    ).toEqual([])

    expect(
      result.current.error,
    ).toBe(
      'Unable to load coursework.',
    )
  })

  it('creates coursework and sorts it by due date', async () => {
    const createdCoursework = {
      id: 3,
      class_id: 1,
      title: 'New assignment',
      description: 'Description',
      due_date: '2026-08-01',
      status: 'not_started',
      hours: 2,
      grade: null,
    }

    const insertQuery =
      createInsertQuery({
        data: createdCoursework,
        error: null,
      })

    setupInitialFetch({
      assignmentMutation:
        insertQuery,
    })

    const { result } =
      await renderLoadedHook()

    let returnedCoursework

    await act(async () => {
      returnedCoursework =
        await result.current
          .createCoursework({
            class_id: 1,
            title:
              '  New assignment  ',
            description:
              '  Description  ',
            due_date:
              '2026-08-01',
            status: '',
            hours: '2',
            grade: '',
          })
    })

    expect(
      insertQuery.insert,
    ).toHaveBeenCalledWith({
      class_id: 1,
      title: 'New assignment',
      description:
        'Description',
      due_date: '2026-08-01',
      status: 'not_started',
      hours: 2,
      grade: null,
      user_id: 'user-1',
    })

    expect(
      returnedCoursework,
    ).toEqual(createdCoursework)

    expect(
      result.current.coursework.map(
        (assignment) =>
          assignment.id,
      ),
    ).toEqual([3, 1, 2])

    expect(
      result.current.saving,
    ).toBe(false)
  })

  it('validates coursework creation', async () => {
    setupInitialFetch()

    const { result } =
      await renderLoadedHook()

    await expect(
      result.current
        .createCoursework({
          title: '   ',
          class_id: 1,
          due_date:
            '2026-08-01',
          hours: '',
          grade: '',
        }),
    ).rejects.toThrow(
      'Please enter an assignment title.',
    )

    await expect(
      result.current
        .createCoursework({
          title: 'Assignment',
          class_id: '',
          due_date:
            '2026-08-01',
          hours: '',
          grade: '',
        }),
    ).rejects.toThrow(
      'Please select a class.',
    )

    await expect(
      result.current
        .createCoursework({
          title: 'Assignment',
          class_id: 1,
          due_date: '',
          hours: '',
          grade: '',
        }),
    ).rejects.toThrow(
      'Please select a due date.',
    )
  })

  it('validates hours and grade values', async () => {
    setupInitialFetch()

    const { result } =
      await renderLoadedHook()

    await expect(
      result.current
        .createCoursework({
          title: 'Assignment',
          class_id: 1,
          due_date:
            '2026-08-01',
          hours: '-1',
          grade: '',
        }),
    ).rejects.toThrow(
      'Estimated hours cannot be negative.',
    )

    await expect(
      result.current
        .createCoursework({
          title: 'Assignment',
          class_id: 1,
          due_date:
            '2026-08-01',
          hours: '2',
          grade: '101',
        }),
    ).rejects.toThrow(
      'Grade must be between 0 and 100.',
    )
  })

  it('updates coursework and keeps it sorted', async () => {
    const updatedCoursework = {
      ...testCoursework[1],
      title:
        'Updated finance report',
      due_date: '2026-08-02',
      hours: 5,
      grade: 80,
    }

    const updateQuery =
      createUpdateQuery({
        data: updatedCoursework,
        error: null,
      })

    setupInitialFetch({
      assignmentMutation:
        updateQuery,
    })

    const { result } =
      await renderLoadedHook()

    let returnedCoursework

    await act(async () => {
      returnedCoursework =
        await result.current
          .updateCoursework(
            2,
            {
              class_id: 2,
              title:
                '  Updated finance report  ',
              description: '',
              due_date:
                '2026-08-02',
              status:
                'in_progress',
              hours: '5',
              grade: '80',
            },
          )
    })

    expect(
      updateQuery.update,
    ).toHaveBeenCalledWith({
      class_id: 2,
      title:
        'Updated finance report',
      description: null,
      due_date: '2026-08-02',
      status: 'in_progress',
      hours: 5,
      grade: 80,
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

    expect(
      returnedCoursework,
    ).toEqual(updatedCoursework)

    expect(
      result.current.coursework.map(
        (assignment) =>
          assignment.id,
      ),
    ).toEqual([2, 1])
  })

  it('deletes related time blocks before deleting coursework', async () => {
    const timeBlocksDeleteQuery =
      createDeleteQuery()

    const assignmentDeleteQuery =
      createDeleteQuery()

    setupInitialFetch({
      assignmentMutation:
        assignmentDeleteQuery,
      timeBlocksMutation:
        timeBlocksDeleteQuery,
    })

    const { result } =
      await renderLoadedHook()

    await act(async () => {
      await result.current
        .deleteCoursework(1)
    })

    expect(
      timeBlocksDeleteQuery.delete,
    ).toHaveBeenCalled()

    expect(
      timeBlocksDeleteQuery.eq,
    ).toHaveBeenNthCalledWith(
      1,
      'coursework_id',
      1,
    )

    expect(
      timeBlocksDeleteQuery.eq,
    ).toHaveBeenNthCalledWith(
      2,
      'user_id',
      'user-1',
    )

    expect(
      assignmentDeleteQuery.delete,
    ).toHaveBeenCalled()

    expect(
      assignmentDeleteQuery.eq,
    ).toHaveBeenNthCalledWith(
      1,
      'id',
      1,
    )

    expect(
      assignmentDeleteQuery.eq,
    ).toHaveBeenNthCalledWith(
      2,
      'user_id',
      'user-1',
    )

    expect(
      result.current.coursework,
    ).toEqual([
      testCoursework[1],
    ])

    expect(
      result.current.deletingId,
    ).toBeNull()
  })

  it('stops deletion when removing time blocks fails', async () => {
    const timeBlocksDeleteQuery =
      createDeleteQuery({
        error: {
          message:
            'Unable to delete blocks.',
        },
      })

    const assignmentDeleteQuery =
      createDeleteQuery()

    setupInitialFetch({
      assignmentMutation:
        assignmentDeleteQuery,
      timeBlocksMutation:
        timeBlocksDeleteQuery,
    })

    const { result } =
      await renderLoadedHook()

    let caughtError

    await act(async () => {
      try {
        await result.current
          .deleteCoursework(1)
      } catch (error) {
        caughtError = error
      }
    })

    expect(caughtError).toEqual({
      message:
        'Unable to delete blocks.',
    })

    expect(
      assignmentDeleteQuery.delete,
    ).not.toHaveBeenCalled()

    expect(
      result.current.coursework,
    ).toEqual(testCoursework)

    expect(
      result.current.error,
    ).toBe(
      'Unable to delete blocks.',
    )

    expect(
      result.current.deletingId,
    ).toBeNull()
  })

  it('handles an assignment deletion error', async () => {
    const timeBlocksDeleteQuery =
      createDeleteQuery()

    const assignmentDeleteQuery =
      createDeleteQuery({
        error: {
          message:
            'Unable to delete assignment.',
        },
      })

    setupInitialFetch({
      assignmentMutation:
        assignmentDeleteQuery,
      timeBlocksMutation:
        timeBlocksDeleteQuery,
    })

    const { result } =
      await renderLoadedHook()

    let caughtError

    await act(async () => {
      try {
        await result.current
          .deleteCoursework(1)
      } catch (error) {
        caughtError = error
      }
    })

    expect(caughtError).toEqual({
      message:
        'Unable to delete assignment.',
    })

    expect(
      result.current.coursework,
    ).toEqual(testCoursework)

    expect(
      result.current.error,
    ).toBe(
      'Unable to delete assignment.',
    )

    expect(
      result.current.deletingId,
    ).toBeNull()
  })

  it('manually refetches coursework data', async () => {
    setupInitialFetch()

    const { result } =
      await renderLoadedHook()

    expect(
      getAuthenticatedUser,
    ).toHaveBeenCalledTimes(1)

    await act(async () => {
      await result.current.fetchData()
    })

    expect(
      getAuthenticatedUser,
    ).toHaveBeenCalledTimes(2)

    expect(
      mockFrom,
    ).toHaveBeenCalledTimes(4)
  })
})