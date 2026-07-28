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

import {
  createSupabaseMock,
  makeClass,
  makeTodo,
  mockUser,
} from './todosTestUtils'

const {
  getAuthenticatedUserMock,
  initialTodoFieldsMock,
} = vi.hoisted(() => ({
  getAuthenticatedUserMock:
    vi.fn(),
  initialTodoFieldsMock:
    vi.fn((classes) => [
      {
        name: 'class_id',
        options: classes,
      },
    ]),
}))

const {
  supabaseRef,
} = vi.hoisted(() => ({
  supabaseRef: {
    current: null,
  },
}))

const supabaseHarness =
  createSupabaseMock()

supabaseRef.current =
  supabaseHarness

vi.mock('../../lib/supabaseClient', () => ({
  supabase: new Proxy(
    {},
    {
      get(_target, property) {
        return supabaseRef
          .current.supabase[property]
      },
    },
  ),
}))

vi.mock('../hookUtils', () => ({
  formatLocalDate: vi.fn((date) => {
    const year = date.getFullYear()
    const month = String(
      date.getMonth() + 1,
    ).padStart(2, '0')
    const day = String(
      date.getDate(),
    ).padStart(2, '0')

    return `${year}-${month}-${day}`
  }),

  getAuthenticatedUser: (
    ...args
  ) =>
    getAuthenticatedUserMock(...args),
}))

vi.mock(
  '../../config/todoFields',
  () => ({
    initialTodoFields: (
      ...args
    ) =>
      initialTodoFieldsMock(...args),
  }),
)

import useTodos, {
  TODO_INITIAL_VALUES,
} from '../useTodos'

describe('useTodos state and derived data', () => {
  beforeEach(() => {
    supabaseHarness.reset()
    getAuthenticatedUserMock.mockReset()
    initialTodoFieldsMock.mockClear()

    getAuthenticatedUserMock
      .mockResolvedValue(mockUser)

    supabaseHarness.queueTodosFetch({
      data: [],
      error: null,
    })

    supabaseHarness.queueClassesFetch({
      data: [],
      error: null,
    })
  })

  it('loads todos and classes on mount', async () => {
    const classItem = makeClass({
      id: 'class-1',
      name: 'Economics',
      code: 'EC101',
    })

    const todo = makeTodo({
      id: 'todo-1',
      title: 'Read chapter',
      due_date: '2026-07-29',
      class_id: classItem.id,
    })

    supabaseHarness.reset()
    supabaseHarness.queueTodosFetch({
      data: [todo],
      error: null,
    })
    supabaseHarness.queueClassesFetch({
      data: [classItem],
      error: null,
    })

    const { result } = renderHook(
      () => useTodos(),
    )

    expect(result.current.loading).toBe(
      true,
    )

    await waitFor(() => {
      expect(
        result.current.loading,
      ).toBe(false)
    })

    expect(result.current.todos).toEqual(
      [todo],
    )
    expect(
      result.current.classes,
    ).toEqual([classItem])
    expect(
      result.current.pageError,
    ).toBeNull()
  })

  it('queries todos for the authenticated user', async () => {
    const { result } = renderHook(
      () => useTodos(),
    )

    await waitFor(() => {
      expect(
        result.current.loading,
      ).toBe(false)
    })

    expect(
      getAuthenticatedUserMock,
    ).toHaveBeenCalledTimes(1)

    expect(
      getAuthenticatedUserMock
        .mock.calls[0][1],
    ).toBe(
      'You must be signed in to manage your tasks.',
    )

    const query =
      supabaseHarness.calls
        .todosSelect[0].builder

    expect(query.eq).toHaveBeenCalledWith(
      'user_id',
      mockUser.id,
    )
    expect(
      query.order,
    ).toHaveBeenNthCalledWith(
      1,
      'due_date',
      {
        ascending: true,
        nullsFirst: false,
      },
    )
    expect(
      query.order,
    ).toHaveBeenNthCalledWith(
      2,
      'created_at',
      {
        ascending: false,
      },
    )
  })

  it('loads the class fields from fetched classes', async () => {
    const classes = [
      makeClass({
        id: 'class-1',
        name: 'Economics',
        code: 'EC101',
      }),
      makeClass({
        id: 'class-2',
        name: 'Statistics',
        code: 'ST101',
      }),
    ]

    supabaseHarness.reset()
    supabaseHarness.queueTodosFetch({
      data: [],
      error: null,
    })
    supabaseHarness.queueClassesFetch({
      data: classes,
      error: null,
    })

    const { result } = renderHook(
      () => useTodos(),
    )

    await waitFor(() => {
      expect(
        result.current.loading,
      ).toBe(false)
    })

    expect(
      initialTodoFieldsMock,
    ).toHaveBeenCalledWith(classes)
    expect(
      result.current.todoFields,
    ).toEqual([
      {
        name: 'class_id',
        options: classes,
      },
    ])
  })

  it('creates a class lookup keyed by string IDs', async () => {
    const firstClass = makeClass({
      id: 1,
      name: 'Economics',
      code: 'EC101',
    })

    const secondClass = makeClass({
      id: '2',
      name: 'Statistics',
      code: 'ST101',
    })

    supabaseHarness.reset()
    supabaseHarness.queueTodosFetch({
      data: [],
      error: null,
    })
    supabaseHarness.queueClassesFetch({
      data: [
        firstClass,
        secondClass,
      ],
      error: null,
    })

    const { result } = renderHook(
      () => useTodos(),
    )

    await waitFor(() => {
      expect(
        result.current.loading,
      ).toBe(false)
    })

    expect(
      result.current.classesById,
    ).toEqual({
      1: firstClass,
      2: secondClass,
    })
  })

  it('shows every todo when the selected class is all', async () => {
    const todos = [
      makeTodo({
        id: 'todo-1',
        title: 'Task one',
        due_date: '2026-07-29',
        class_id: 'class-1',
      }),
      makeTodo({
        id: 'todo-2',
        title: 'Task two',
        due_date: '2026-07-30',
      }),
    ]

    supabaseHarness.reset()
    supabaseHarness.queueTodosFetch({
      data: todos,
      error: null,
    })
    supabaseHarness.queueClassesFetch({
      data: [],
      error: null,
    })

    const { result } = renderHook(
      () => useTodos(),
    )

    await waitFor(() => {
      expect(
        result.current.loading,
      ).toBe(false)
    })

    const groupedTodos =
      result.current.groupedTodos

    const allGrouped = [
      ...groupedTodos.overdue,
      ...groupedTodos.today,
      ...groupedTodos.thisWeek,
      ...groupedTodos.other,
    ]

    expect(allGrouped).toHaveLength(2)
  })

  it('filters to unassigned todos', async () => {
    const unassigned = makeTodo({
      id: 'todo-1',
      title: 'Unassigned task',
      due_date: '2026-08-20',
    })

    const assigned = makeTodo({
      id: 'todo-2',
      title: 'Assigned task',
      due_date: '2026-08-21',
      class_id: 'class-1',
    })

    supabaseHarness.reset()
    supabaseHarness.queueTodosFetch({
      data: [unassigned, assigned],
      error: null,
    })
    supabaseHarness.queueClassesFetch({
      data: [],
      error: null,
    })

    const { result } = renderHook(
      () => useTodos(),
    )

    await waitFor(() => {
      expect(
        result.current.loading,
      ).toBe(false)
    })

    act(() => {
      result.current.setSelectedClassId(
        'unassigned',
      )
    })

    expect(
      result.current.groupedTodos.other,
    ).toEqual([unassigned])
  })

  it('filters by class using string-compatible IDs', async () => {
    const matching = makeTodo({
      id: 'todo-1',
      title: 'Matching task',
      due_date: '2026-08-20',
      class_id: 1,
    })

    const nonMatching = makeTodo({
      id: 'todo-2',
      title: 'Other task',
      due_date: '2026-08-21',
      class_id: 2,
    })

    supabaseHarness.reset()
    supabaseHarness.queueTodosFetch({
      data: [matching, nonMatching],
      error: null,
    })
    supabaseHarness.queueClassesFetch({
      data: [],
      error: null,
    })

    const { result } = renderHook(
      () => useTodos(),
    )

    await waitFor(() => {
      expect(
        result.current.loading,
      ).toBe(false)
    })

    act(() => {
      result.current.setSelectedClassId(
        '1',
      )
    })

    expect(
      result.current.groupedTodos.other,
    ).toEqual([matching])
  })

  it('groups todos by overdue, today, this week, and other', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(
      new Date('2026-07-28T12:00:00'),
    )

    const overdue = makeTodo({
      id: 'overdue',
      title: 'Overdue',
      due_date: '2026-07-27',
    })

    const today = makeTodo({
      id: 'today',
      title: 'Today',
      due_date: '2026-07-28',
    })

    const thisWeek = makeTodo({
      id: 'week',
      title: 'This week',
      due_date: '2026-07-30',
    })

    const other = makeTodo({
      id: 'other',
      title: 'Later',
      due_date: '2026-08-10',
    })

    const noDate = makeTodo({
      id: 'no-date',
      title: 'No date',
      due_date: '',
    })

    supabaseHarness.reset()
    supabaseHarness.queueTodosFetch({
      data: [
        other,
        today,
        noDate,
        overdue,
        thisWeek,
      ],
      error: null,
    })
    supabaseHarness.queueClassesFetch({
      data: [],
      error: null,
    })

    const { result } = renderHook(
      () => useTodos(),
    )

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    expect(
      result.current.groupedTodos,
    ).toEqual({
      overdue: [overdue],
      today: [today],
      thisWeek: [thisWeek],
      other: [other, noDate],
    })

    vi.useRealTimers()
  })

  it('sorts equal due dates alphabetically and puts undated todos last', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(
      new Date('2026-07-28T12:00:00'),
    )

    const beta = makeTodo({
      id: 'beta',
      title: 'Beta',
      due_date: '2026-08-10',
    })

    const alpha = makeTodo({
      id: 'alpha',
      title: 'Alpha',
      due_date: '2026-08-10',
    })

    const undated = makeTodo({
      id: 'undated',
      title: 'Aardvark',
      due_date: '',
    })

    supabaseHarness.reset()
    supabaseHarness.queueTodosFetch({
      data: [beta, undated, alpha],
      error: null,
    })
    supabaseHarness.queueClassesFetch({
      data: [],
      error: null,
    })

    const { result } = renderHook(
      () => useTodos(),
    )

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    expect(
      result.current.groupedTodos.other,
    ).toEqual([
      alpha,
      beta,
      undated,
    ])

    vi.useRealTimers()
  })

  it('opens and closes the create modal', async () => {
    const { result } = renderHook(
      () => useTodos(),
    )

    await waitFor(() => {
      expect(
        result.current.loading,
      ).toBe(false)
    })

    act(() => {
      result.current.openCreateModal()
    })

    expect(
      result.current.isModalOpen,
    ).toBe(true)
    expect(
      result.current.editingTodo,
    ).toBeNull()
    expect(
      result.current.modalInitialValues,
    ).toBe(TODO_INITIAL_VALUES)

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

  it('opens the edit modal and exposes safe initial values', async () => {
    const todo = {
      id: 'todo-1',
      title: 'Edit me',
      due_date: null,
      class_id: null,
    }

    const { result } = renderHook(
      () => useTodos(),
    )

    await waitFor(() => {
      expect(
        result.current.loading,
      ).toBe(false)
    })

    act(() => {
      result.current.openEditModal(todo)
    })

    expect(
      result.current.isModalOpen,
    ).toBe(true)
    expect(
      result.current.editingTodo,
    ).toBe(todo)
    expect(
      result.current.modalInitialValues,
    ).toEqual({
      title: 'Edit me',
      due_date: '',
      class_id: '',
    })
  })

  it('reports authentication failures and stops loading', async () => {
    getAuthenticatedUserMock
      .mockRejectedValue(
        new Error('Not signed in'),
      )

    const { result } = renderHook(
      () => useTodos(),
    )

    await waitFor(() => {
      expect(
        result.current.loading,
      ).toBe(false)
    })

    expect(
      result.current.pageError,
    ).toBe('Not signed in')
    expect(
      supabaseHarness.supabase.from,
    ).not.toHaveBeenCalled()
  })

  it('combines todo and class fetch errors', async () => {
    supabaseHarness.reset()
    supabaseHarness.queueTodosFetch({
      data: null,
      error: {
        message: 'Todo fetch failed.',
      },
    })
    supabaseHarness.queueClassesFetch({
      data: null,
      error: {
        message: 'Class fetch failed.',
      },
    })

    const { result } = renderHook(
      () => useTodos(),
    )

    await waitFor(() => {
      expect(
        result.current.loading,
      ).toBe(false)
    })

    expect(
      result.current.pageError,
    ).toBe(
      'Todo fetch failed. Class fetch failed.',
    )
  })

  it('refetches page data when requested', async () => {
    const originalTodo = makeTodo({
      id: 'todo-1',
      title: 'Original',
      due_date: '2026-08-10',
    })

    const refreshedTodo = makeTodo({
      id: 'todo-2',
      title: 'Refreshed',
      due_date: '2026-08-11',
    })

    supabaseHarness.reset()
    supabaseHarness.queueTodosFetch({
      data: [originalTodo],
      error: null,
    })
    supabaseHarness.queueClassesFetch({
      data: [],
      error: null,
    })
    supabaseHarness.queueTodosFetch({
      data: [refreshedTodo],
      error: null,
    })
    supabaseHarness.queueClassesFetch({
      data: [],
      error: null,
    })

    const { result } = renderHook(
      () => useTodos(),
    )

    await waitFor(() => {
      expect(
        result.current.todos,
      ).toEqual([originalTodo])
    })

    await act(async () => {
      await result.current.refetchTodos()
    })

    expect(
      result.current.todos,
    ).toEqual([refreshedTodo])
  })
})
