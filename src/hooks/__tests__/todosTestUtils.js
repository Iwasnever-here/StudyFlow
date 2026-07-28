import { vi } from 'vitest'

export const mockUser = {
  id: 'user-1',
}

export const makeTodo = ({
  id,
  title,
  due_date,
  class_id = null,
  created_at = '2026-07-20T10:00:00.000Z',
  completed = false,
  completed_at = null,
} = {}) => ({
  id,
  title,
  due_date,
  class_id,
  created_at,
  completed,
  completed_at,
  user_id: mockUser.id,
})

export const makeClass = ({
  id,
  name,
  code,
  color = '#123456',
} = {}) => ({
  id,
  name,
  code,
  color,
})

const createTerminalBuilder = (result) => {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => builder),
    single: vi.fn(async () => result),
    then: (resolve, reject) =>
      Promise.resolve(result).then(resolve, reject),
  }

  return builder
}

export const createSupabaseMock = () => {
  const queues = {
    todosSelect: [],
    classesSelect: [],
    insert: [],
    update: [],
    delete: [],
  }

  const calls = {
    from: [],
    todosSelect: [],
    classesSelect: [],
    insert: [],
    update: [],
    delete: [],
  }

  const enqueue = (queueName, result) => {
    queues[queueName].push(result)
  }

  const shiftResult = (queueName, fallback) => {
    return queues[queueName].length
      ? queues[queueName].shift()
      : fallback
  }

  const createTodosQuery = () => {
    const builder = {
      select: vi.fn((columns = '*') => {
        calls.todosSelect.push({
          columns,
          builder,
        })
        return builder
      }),
      eq: vi.fn(() => builder),
      order: vi.fn(() => builder),
      then: (resolve, reject) => {
        const result = shiftResult(
          'todosSelect',
          {
            data: [],
            error: null,
          },
        )

        return Promise.resolve(result).then(
          resolve,
          reject,
        )
      },
    }

    return builder
  }

  const createClassesQuery = () => {
    const builder = {
      select: vi.fn((columns) => {
        calls.classesSelect.push({
          columns,
          builder,
        })
        return builder
      }),
      order: vi.fn(() => builder),
      then: (resolve, reject) => {
        const result = shiftResult(
          'classesSelect',
          {
            data: [],
            error: null,
          },
        )

        return Promise.resolve(result).then(
          resolve,
          reject,
        )
      },
    }

    return builder
  }

  const createInsertQuery = (payload) => {
    const result = shiftResult(
      'insert',
      {
        data: payload,
        error: null,
      },
    )

    const builder =
      createTerminalBuilder(result)

    calls.insert.push({
      payload,
      builder,
    })

    return builder
  }

  const createUpdateQuery = (payload) => {
    const result = shiftResult(
      'update',
      {
        data: payload,
        error: null,
      },
    )

    const builder =
      createTerminalBuilder(result)

    calls.update.push({
      payload,
      builder,
    })

    return builder
  }

  const createDeleteQuery = () => {
    const result = shiftResult(
      'delete',
      {
        error: null,
      },
    )

    const builder = {
      eq: vi.fn(async () => result),
    }

    calls.delete.push({
      builder,
    })

    return builder
  }

  const supabase = {
    from: vi.fn((table) => {
      calls.from.push(table)

      if (table === 'classes') {
        return createClassesQuery()
      }

      if (table !== 'todos') {
        throw new Error(
          `Unexpected Supabase table: ${table}`,
        )
      }

      return {
        select: (...args) =>
          createTodosQuery().select(...args),

        insert: (payload) =>
          createInsertQuery(payload),

        update: (payload) =>
          createUpdateQuery(payload),

        delete: () =>
          createDeleteQuery(),
      }
    }),
  }

  return {
    supabase,
    calls,

    queueTodosFetch(result) {
      enqueue('todosSelect', result)
    },

    queueClassesFetch(result) {
      enqueue('classesSelect', result)
    },

    queueInsert(result) {
      enqueue('insert', result)
    },

    queueUpdate(result) {
      enqueue('update', result)
    },

    queueDelete(result) {
      enqueue('delete', result)
    },

    reset() {
      Object.values(queues).forEach(
        (queue) => {
          queue.length = 0
        },
      )

      Object.values(calls).forEach(
        (callList) => {
          callList.length = 0
        },
      )

      supabase.from.mockClear()
    },
  }
}

export const waitForInitialLoad = async (
  result,
  waitFor,
) => {
  await waitFor(() => {
    expect(result.current.loading).toBe(
      false,
    )
  })
}
