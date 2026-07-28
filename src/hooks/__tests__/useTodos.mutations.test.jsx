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
  makeTodo,
  mockUser,
} from './todosTestUtils'

const {
  getAuthenticatedUserMock,
} = vi.hoisted(() => ({
  getAuthenticatedUserMock:
    vi.fn(),
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
  formatLocalDate: vi.fn(() => (
    '2026-07-28'
  )),

  getAuthenticatedUser: (
    ...args
  ) =>
    getAuthenticatedUserMock(...args),
}))

vi.mock(
  '../../config/todoFields',
  () => ({
    initialTodoFields: vi.fn(
      () => [],
    ),
  }),
)

import useTodos from '../useTodos'

const queueEmptyInitialFetch = () => {
  supabaseHarness.queueTodosFetch({
    data: [],
    error: null,
  })
  supabaseHarness.queueClassesFetch({
    data: [],
    error: null,
  })
}

const renderLoadedHook = async () => {
  const rendered = renderHook(
    () => useTodos(),
  )

  await waitFor(() => {
    expect(
      rendered.result.current.loading,
    ).toBe(false)
  })

  return rendered
}

describe('useTodos mutations', () => {
  beforeEach(() => {
    supabaseHarness.reset()
    getAuthenticatedUserMock.mockReset()
    getAuthenticatedUserMock
      .mockResolvedValue(mockUser)
    queueEmptyInitialFetch()
    vi.useRealTimers()
  })

  describe('creating todos', () => {
    it('creates a todo with a trimmed title and expected payload', async () => {
      const createdTodo = makeTodo({
        id: 'todo-1',
        title: 'Read chapter',
        due_date: '2026-07-31',
        class_id: 'class-1',
      })

      supabaseHarness.queueInsert({
        data: createdTodo,
        error: null,
      })

      const { result } =
        await renderLoadedHook()

      act(() => {
        result.current.openCreateModal()
      })

      await act(async () => {
        await result.current
          .handleTodoSubmit({
            title: '  Read chapter  ',
            due_date: '2026-07-31',
            class_id: 'class-1',
          })
      })

      expect(
        supabaseHarness.calls.insert[0]
          .payload,
      ).toEqual({
        title: 'Read chapter',
        due_date: '2026-07-31',
        class_id: 'class-1',
        completed: false,
        completed_at: null,
        user_id: mockUser.id,
      })

      expect(
        result.current.todos,
      ).toEqual([createdTodo])
      expect(
        result.current.isModalOpen,
      ).toBe(false)
      expect(
        result.current.editingTodo,
      ).toBeNull()
    })

    it('stores an empty class selection as null', async () => {
      const createdTodo = makeTodo({
        id: 'todo-1',
        title: 'General task',
        due_date: '2026-07-31',
      })

      supabaseHarness.queueInsert({
        data: createdTodo,
        error: null,
      })

      const { result } =
        await renderLoadedHook()

      await act(async () => {
        await result.current
          .handleTodoSubmit({
            title: 'General task',
            due_date: '2026-07-31',
            class_id: '',
          })
      })

      expect(
        supabaseHarness.calls.insert[0]
          .payload.class_id,
      ).toBeNull()
    })

    it('rejects a blank todo title without querying Supabase', async () => {
      const { result } =
        await renderLoadedHook()

      let thrownError

      await act(async () => {
        try {
          await result.current
            .handleTodoSubmit({
              title: '   ',
              due_date: '2026-07-31',
              class_id: '',
            })
        } catch (error) {
          thrownError = error
        }
      })

      expect(thrownError).toEqual(
        new Error(
          'Please enter a task.',
        ),
      )
      expect(
        result.current.pageError,
      ).toBe('Please enter a task.')
      expect(
        supabaseHarness.calls.insert,
      ).toHaveLength(0)
    })

    it('rejects a missing due date', async () => {
      const { result } =
        await renderLoadedHook()

      let thrownError

      await act(async () => {
        try {
          await result.current
            .handleTodoSubmit({
              title: 'Valid title',
              due_date: '',
              class_id: '',
            })
        } catch (error) {
          thrownError = error
        }
      })

      expect(thrownError).toEqual(
        new Error(
          'Please choose a due date.',
        ),
      )

      expect(
        result.current.pageError,
      ).toBe(
        'Please choose a due date.',
      )
    })

    it('reports insert failures and keeps the modal open', async () => {
      supabaseHarness.queueInsert({
        data: null,
        error: new Error(
          'Insert failed',
        ),
      })

      const { result } =
        await renderLoadedHook()

      act(() => {
        result.current.openCreateModal()
      })

      let thrownError

      await act(async () => {
        try {
          await result.current
            .handleTodoSubmit({
              title: 'Task',
              due_date: '2026-07-31',
              class_id: '',
            })
        } catch (error) {
          thrownError = error
        }
      })

      expect(thrownError).toEqual(
        new Error('Insert failed'),
      )

      expect(
        result.current.pageError,
      ).toBe('Insert failed')
      expect(
        result.current.isModalOpen,
      ).toBe(true)
    })
  })

  describe('updating todos', () => {
    it('updates the selected todo and closes the modal', async () => {
      const originalTodo = makeTodo({
        id: 'todo-1',
        title: 'Original',
        due_date: '2026-07-30',
      })

      const updatedTodo = makeTodo({
        id: 'todo-1',
        title: 'Updated',
        due_date: '2026-08-01',
        class_id: 'class-2',
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
      supabaseHarness.queueUpdate({
        data: updatedTodo,
        error: null,
      })

      const { result } =
        await renderLoadedHook()

      act(() => {
        result.current.openEditModal(
          originalTodo,
        )
      })

      await act(async () => {
        await result.current
          .handleTodoSubmit({
            title: ' Updated ',
            due_date: '2026-08-01',
            class_id: 'class-2',
          })
      })

      expect(
        supabaseHarness.calls.update[0]
          .payload,
      ).toEqual({
        title: 'Updated',
        due_date: '2026-08-01',
        class_id: 'class-2',
      })

      expect(
        supabaseHarness.calls.update[0]
          .builder.eq,
      ).toHaveBeenCalledWith(
        'id',
        originalTodo.id,
      )

      expect(
        result.current.todos,
      ).toEqual([updatedTodo])
      expect(
        result.current.isModalOpen,
      ).toBe(false)
    })

    it('reports update failures and keeps existing state', async () => {
      const originalTodo = makeTodo({
        id: 'todo-1',
        title: 'Original',
        due_date: '2026-07-30',
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
      supabaseHarness.queueUpdate({
        data: null,
        error: new Error(
          'Update failed',
        ),
      })

      const { result } =
        await renderLoadedHook()

      act(() => {
        result.current.openEditModal(
          originalTodo,
        )
      })

      let thrownError

      await act(async () => {
        try {
          await result.current
            .handleTodoSubmit({
              title: 'Updated',
              due_date: '2026-08-01',
              class_id: '',
            })
        } catch (error) {
          thrownError = error
        }
      })

      expect(thrownError).toEqual(
        new Error('Update failed'),
      )

      expect(
        result.current.todos,
      ).toEqual([originalTodo])
      expect(
        result.current.pageError,
      ).toBe('Update failed')
      expect(
        result.current.isModalOpen,
      ).toBe(true)
    })
  })

  describe('deleting todos', () => {
    it('deletes a todo and removes it from state', async () => {
      const firstTodo = makeTodo({
        id: 'todo-1',
        title: 'First',
        due_date: '2026-07-30',
      })

      const secondTodo = makeTodo({
        id: 'todo-2',
        title: 'Second',
        due_date: '2026-07-31',
      })

      supabaseHarness.reset()
      supabaseHarness.queueTodosFetch({
        data: [firstTodo, secondTodo],
        error: null,
      })
      supabaseHarness.queueClassesFetch({
        data: [],
        error: null,
      })
      supabaseHarness.queueDelete({
        error: null,
      })

      const { result } =
        await renderLoadedHook()

      await act(async () => {
        await result.current.deleteTodo(
          firstTodo,
        )
      })

      expect(
        supabaseHarness.calls.delete[0]
          .builder.eq,
      ).toHaveBeenCalledWith(
        'id',
        firstTodo.id,
      )

      expect(
        result.current.todos,
      ).toEqual([secondTodo])
    })

    it('ignores an empty delete request', async () => {
      const { result } =
        await renderLoadedHook()

      await act(async () => {
        await result.current.deleteTodo(
          null,
        )
      })

      expect(
        supabaseHarness.calls.delete,
      ).toHaveLength(0)
    })

    it('reports delete failures without removing the todo', async () => {
      const todo = makeTodo({
        id: 'todo-1',
        title: 'Keep me',
        due_date: '2026-07-30',
      })

      supabaseHarness.reset()
      supabaseHarness.queueTodosFetch({
        data: [todo],
        error: null,
      })
      supabaseHarness.queueClassesFetch({
        data: [],
        error: null,
      })
      supabaseHarness.queueDelete({
        error: {
          message: 'Delete failed',
        },
      })

      const { result } =
        await renderLoadedHook()

      await act(async () => {
        await result.current.deleteTodo(
          todo,
        )
      })

      expect(
        result.current.pageError,
      ).toBe('Delete failed')
      expect(
        result.current.todos,
      ).toEqual([todo])
    })
  })

  describe('completing todos', () => {
    it('waits two seconds before deleting a completed todo', async () => {
      const todo = makeTodo({
        id: 'todo-1',
        title: 'Complete me',
        due_date: '2026-07-30',
      })

      supabaseHarness.reset()
      supabaseHarness.queueTodosFetch({
        data: [todo],
        error: null,
      })
      supabaseHarness.queueClassesFetch({
        data: [],
        error: null,
      })
      supabaseHarness.queueDelete({
        error: null,
      })

      const { result } =
        await renderLoadedHook()

      vi.useFakeTimers()

      let completionPromise

      act(() => {
        completionPromise =
          result.current.completeTodo(todo)
      })

      expect(
        supabaseHarness.calls.delete,
      ).toHaveLength(0)

      await act(async () => {
        await vi.advanceTimersByTimeAsync(
          1999,
        )
      })

      expect(
        supabaseHarness.calls.delete,
      ).toHaveLength(0)

      await act(async () => {
        await vi.advanceTimersByTimeAsync(
          1,
        )
        await completionPromise
      })

      expect(
        supabaseHarness.calls.delete[0]
          .builder.eq,
      ).toHaveBeenCalledWith(
        'id',
        todo.id,
      )

      expect(
        result.current.todos,
      ).toEqual([])

      vi.useRealTimers()
    })

    it('throws completion delete failures and keeps the todo', async () => {
      const todo = makeTodo({
        id: 'todo-1',
        title: 'Complete me',
        due_date: '2026-07-30',
      })

      const deleteError =
        new Error(
          'Completion delete failed',
        )

      supabaseHarness.reset()
      supabaseHarness.queueTodosFetch({
        data: [todo],
        error: null,
      })
      supabaseHarness.queueClassesFetch({
        data: [],
        error: null,
      })
      supabaseHarness.queueDelete({
        error: deleteError,
      })

      const { result } =
        await renderLoadedHook()

      vi.useFakeTimers()

      let caughtError

      const completionPromise =
        result.current
          .completeTodo(todo)
          .catch((error) => {
            caughtError = error
          })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(
          2000,
        )

        await completionPromise
      })

      expect(caughtError).toBe(
        deleteError,
      )

      expect(
        result.current.pageError,
      ).toBe(
        'Completion delete failed',
      )

      expect(
        result.current.todos,
      ).toEqual([todo])

      vi.useRealTimers()
    })

    it('ignores an empty completion request', async () => {
      const { result } =
        await renderLoadedHook()

      await act(async () => {
        await result.current.completeTodo(
          null,
        )
      })

      expect(
        supabaseHarness.calls.delete,
      ).toHaveLength(0)
    })
  })
})