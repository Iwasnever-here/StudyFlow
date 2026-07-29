import {
  act,
  renderHook,
  waitFor,
} from '@testing-library/react'

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import useTodos, {
  TODO_INITIAL_VALUES,
} from '../useTodos'

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
  formatLocalDate: vi.fn(
    (date) => {
      const year =
        date.getFullYear()

      const month = String(
        date.getMonth() + 1,
      ).padStart(2, '0')

      const day = String(
        date.getDate(),
      ).padStart(2, '0')

      return `${year}-${month}-${day}`
    },
  ),

  getAuthenticatedUser:
    vi.fn(),
}))

vi.mock(
  '../../config/todoFields',
  () => ({
    initialTodoFields: vi.fn(
      (classes) => [
        {
          name: 'class_id',
          options: classes,
        },
      ],
    ),
  }),
)

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

const testTodos = [
  {
    id: 1,
    user_id: 'user-1',
    title: 'Overdue task',
    due_date: '2026-07-28',
    class_id: 1,
  },
  {
    id: 2,
    user_id: 'user-1',
    title: 'Today task',
    due_date: '2026-07-29',
    class_id: 1,
  },
  {
    id: 3,
    user_id: 'user-1',
    title: 'Friday task',
    due_date: '2026-07-31',
    class_id: 2,
  },
  {
    id: 4,
    user_id: 'user-1',
    title: 'Later task',
    due_date: '2026-08-10',
    class_id: null,
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
  todos = testTodos,
  classes = testClasses,
  todosError = null,
  classesError = null,
  todoMutationQuery = null,
} = {}) => {
  const todosFetchQuery =
    createFetchQuery({
      data: todos,
      error: todosError,
    })

  const classesFetchQuery =
    createFetchQuery({
      data: classes,
      error: classesError,
    })

  let todosCallCount = 0

  mockFrom.mockImplementation(
    (table) => {
      if (table === 'classes') {
        return classesFetchQuery
      }

      if (table === 'todos') {
        todosCallCount += 1

        if (
          todosCallCount === 1 ||
          !todoMutationQuery
        ) {
          return todosFetchQuery
        }

        return todoMutationQuery
      }

      throw new Error(
        `Unexpected table: ${table}`,
      )
    },
  )

  return {
    todosFetchQuery,
    classesFetchQuery,
  }
}

const renderLoadedHook =
  async () => {
    const hook =
      renderHook(() => useTodos())

    await waitFor(() => {
      expect(
        hook.result.current.loading,
      ).toBe(false)
    })

    return hook
  }

describe('useTodos', () => {
  beforeEach(() => {
    mockFrom.mockReset()

    getAuthenticatedUser
      .mockReset()
      .mockResolvedValue(
        testUser,
      )
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('fetches todos and classes on mount', async () => {
    const {
      todosFetchQuery,
      classesFetchQuery,
    } = setupQueries()

    const { result } =
      await renderLoadedHook()

    expect(
      getAuthenticatedUser,
    ).toHaveBeenCalled()

    expect(
      todosFetchQuery.eq,
    ).toHaveBeenCalledWith(
      'user_id',
      'user-1',
    )

    expect(
      classesFetchQuery.order,
    ).toHaveBeenCalledWith(
      'name',
      {
        ascending: true,
      },
    )

    expect(
      result.current.todos,
    ).toEqual(testTodos)

    expect(
      result.current.classes,
    ).toEqual(testClasses)

    expect(
      result.current.classesById,
    ).toEqual({
      1: testClasses[0],
      2: testClasses[1],
    })
  })

  it('shows an error when loading fails', async () => {
    setupQueries({
      todosError: {
        message:
          'Unable to fetch todos.',
      },
    })

    const { result } =
      await renderLoadedHook()

    expect(
      result.current.pageError,
    ).toBe(
      'Unable to fetch todos.',
    )

    expect(
      result.current.todos,
    ).toEqual([])
  })

  it('groups todos and filters them by class', async () => {
    vi.useFakeTimers({
      shouldAdvanceTime: true,
    })

    vi.setSystemTime(
      new Date(
        2026,
        6,
        29,
        10,
        0,
      ),
    )

    setupQueries()

    const { result } =
      await renderLoadedHook()

    expect(
      result.current.groupedTodos
        .overdue.map(
          (todo) => todo.id,
        ),
    ).toEqual([1])

    expect(
      result.current.groupedTodos
        .today.map(
          (todo) => todo.id,
        ),
    ).toEqual([2])

    expect(
      result.current.groupedTodos
        .thisWeek.map(
          (todo) => todo.id,
        ),
    ).toEqual([3])

    expect(
      result.current.groupedTodos
        .other.map(
          (todo) => todo.id,
        ),
    ).toEqual([4])

    act(() => {
      result.current
        .setSelectedClassId(1)
    })

    expect(
      result.current.groupedTodos
        .today.map(
          (todo) => todo.id,
        ),
    ).toEqual([2])

    expect(
      result.current.groupedTodos
        .thisWeek,
    ).toEqual([])

    act(() => {
      result.current
        .setSelectedClassId(
          'unassigned',
        )
    })

    expect(
      result.current.groupedTodos
        .other.map(
          (todo) => todo.id,
        ),
    ).toEqual([4])
  })

  it('opens and closes create and edit modals', async () => {
    setupQueries()

    const { result } =
      await renderLoadedHook()

    act(() => {
      result.current
        .openCreateModal()
    })

    expect(
      result.current.isModalOpen,
    ).toBe(true)

    expect(
      result.current.editingTodo,
    ).toBeNull()

    expect(
      result.current
        .modalInitialValues,
    ).toEqual(
      TODO_INITIAL_VALUES,
    )

    act(() => {
      result.current.openEditModal(
        testTodos[1],
      )
    })

    expect(
      result.current.editingTodo,
    ).toEqual(testTodos[1])

    expect(
      result.current
        .modalInitialValues,
    ).toEqual({
      title: 'Today task',
      due_date: '2026-07-29',
      class_id: 1,
    })

    act(() => {
      result.current.closeTodoModal()
    })

    expect(
      result.current.isModalOpen,
    ).toBe(false)

    expect(
      result.current.editingTodo,
    ).toBeNull()
  })

  it('creates a todo and closes the modal', async () => {
    const createdTodo = {
      id: 5,
      user_id: 'user-1',
      title: 'Read chapter',
      due_date: '2026-08-01',
      class_id: 1,
      completed: false,
      completed_at: null,
    }

    const insertQuery =
      createInsertQuery({
        data: createdTodo,
        error: null,
      })

    setupQueries({
      todoMutationQuery:
        insertQuery,
    })

    const { result } =
      await renderLoadedHook()

    act(() => {
      result.current
        .openCreateModal()
    })

    await act(async () => {
      await result.current
        .handleTodoSubmit({
          title:
            '  Read chapter  ',
          due_date:
            '2026-08-01',
          class_id: 1,
        })
    })

    expect(
      insertQuery.insert,
    ).toHaveBeenCalledWith({
      title: 'Read chapter',
      due_date: '2026-08-01',
      class_id: 1,
      completed: false,
      completed_at: null,
      user_id: 'user-1',
    })

    expect(
      result.current.todos[0],
    ).toEqual(createdTodo)

    expect(
      result.current.isModalOpen,
    ).toBe(false)
  })

  it('updates an existing todo', async () => {
    const updatedTodo = {
      ...testTodos[1],
      title: 'Updated task',
      class_id: 2,
    }

    const updateQuery =
      createUpdateQuery({
        data: updatedTodo,
        error: null,
      })

    setupQueries({
      todoMutationQuery:
        updateQuery,
    })

    const { result } =
      await renderLoadedHook()

    act(() => {
      result.current.openEditModal(
        testTodos[1],
      )
    })

    await act(async () => {
      await result.current
        .handleTodoSubmit({
          title: 'Updated task',
          due_date:
            '2026-07-29',
          class_id: 2,
        })
    })

    expect(
      updateQuery.update,
    ).toHaveBeenCalledWith({
      title: 'Updated task',
      due_date: '2026-07-29',
      class_id: 2,
    })

    expect(
      updateQuery.eq,
    ).toHaveBeenCalledWith(
      'id',
      2,
    )

    expect(
      result.current.todos.find(
        (todo) => todo.id === 2,
      ),
    ).toEqual(updatedTodo)
  })

  it('deletes a todo', async () => {
    const deleteQuery =
      createDeleteQuery()

    setupQueries({
      todoMutationQuery:
        deleteQuery,
    })

    const { result } =
      await renderLoadedHook()

    await act(async () => {
      await result.current.deleteTodo(
        testTodos[0],
      )
    })

    expect(
      deleteQuery.eq,
    ).toHaveBeenCalledWith(
      'id',
      1,
    )

    expect(
      result.current.todos.some(
        (todo) => todo.id === 1,
      ),
    ).toBe(false)
  })

  it('deletes a completed todo after the delay', async () => {
    const deleteQuery =
      createDeleteQuery()

    setupQueries({
      todoMutationQuery:
        deleteQuery,
    })

    const { result } =
      await renderLoadedHook()

    vi.useFakeTimers()

    let completionPromise

    act(() => {
      completionPromise =
        result.current.completeTodo(
          testTodos[1],
        )
    })

    expect(
      deleteQuery.delete,
    ).not.toHaveBeenCalled()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(
        2000,
      )

      await completionPromise
    })

    expect(
      deleteQuery.eq,
    ).toHaveBeenCalledWith(
      'id',
      2,
    )

    expect(
      result.current.todos.some(
        (todo) => todo.id === 2,
      ),
    ).toBe(false)
  })
})