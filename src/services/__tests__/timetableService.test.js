import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import {
  deleteTimeBlockRow,
  fetchTimetableData,
  insertTimeBlock,
  replaceFutureAutoBlocks,
  TIME_BLOCK_FIELDS,
  updateTimeBlockRow,
} from '../timetableService'

const {
  supabaseMock,
  state,
} = vi.hoisted(() => {
  const queryState = {
    tableResults: {
      time_blocks: {
        data: [],
        error: null,
      },
      classes: {
        data: [],
        error: null,
      },
      assignments: {
        data: [],
        error: null,
      },
    },

    mutationResults: {
      insert: {
        data: null,
        error: null,
      },
      update: {
        data: null,
        error: null,
      },
      delete: {
        error: null,
      },
      replaceDelete: {
        error: null,
      },
      replaceInsert: {
        data: [],
        error: null,
      },
    },

    calls: {
      from: [],
      select: [],
      eq: [],
      neq: [],
      order: [],
      insert: [],
      update: [],
      delete: 0,
      gte: [],
      single: 0,
    },
  }

  const makeFetchBuilder = (
    table,
  ) => {
    const builder = {
      select: vi.fn((fields) => {
        queryState.calls.select.push([
          table,
          fields,
        ])

        return builder
      }),

      eq: vi.fn((column, value) => {
        queryState.calls.eq.push([
          table,
          column,
          value,
        ])

        return builder
      }),

      neq: vi.fn((column, value) => {
        queryState.calls.neq.push([
          table,
          column,
          value,
        ])

        return builder
      }),

      order: vi.fn(
        (column, options) => {
          queryState.calls.order.push([
            table,
            column,
            options,
          ])

          return builder
        },
      ),

      then: (resolve, reject) =>
        Promise
          .resolve(
            queryState
              .tableResults[table],
          )
          .then(resolve, reject),
    }

    return builder
  }

  const makeMutationBuilder = (
    type,
  ) => {
    const builder = {
      eq: vi.fn((column, value) => {
        queryState.calls.eq.push([
          'time_blocks',
          column,
          value,
        ])

        return builder
      }),

      gte: vi.fn((column, value) => {
        queryState.calls.gte.push([
          column,
          value,
        ])

        if (
          type ===
          'replaceDelete'
        ) {
          return Promise.resolve(
            queryState
              .mutationResults
              .replaceDelete,
          )
        }

        return builder
      }),

      select: vi.fn((fields) => {
        queryState.calls.select.push([
          'time_blocks',
          fields,
        ])

        if (
          type ===
          'replaceInsert'
        ) {
          return Promise.resolve(
            queryState
              .mutationResults
              .replaceInsert,
          )
        }

        return builder
      }),

      single: vi.fn(async () => {
        queryState.calls.single += 1

        return queryState
          .mutationResults[type]
      }),

      then: (resolve, reject) =>
        Promise
          .resolve(
            queryState
              .mutationResults[type],
          )
          .then(resolve, reject),
    }

    return builder
  }

  const supabase = {
    from: vi.fn((table) => {
      queryState.calls.from.push(
        table,
      )

      return {
        select: (fields) =>
          makeFetchBuilder(table)
            .select(fields),

        insert: (payload) => {
          queryState.calls.insert.push(
            payload,
          )

          const type =
            Array.isArray(payload)
              ? 'replaceInsert'
              : 'insert'

          return makeMutationBuilder(
            type,
          )
        },

        update: (updates) => {
          queryState.calls.update.push(
            updates,
          )

          return makeMutationBuilder(
            'update',
          )
        },

        delete: () => {
          queryState.calls.delete += 1

          const type =
            queryState.calls.delete > 1
              ? 'replaceDelete'
              : 'delete'

          return makeMutationBuilder(
            type,
          )
        },
      }
    }),
  }

  return {
    supabaseMock: supabase,
    state: queryState,
  }
})

vi.mock(
  '../../lib/supabaseClient',
  () => ({
    supabase: supabaseMock,
  }),
)

const resetState = () => {
  state.tableResults = {
    time_blocks: {
      data: [],
      error: null,
    },
    classes: {
      data: [],
      error: null,
    },
    assignments: {
      data: [],
      error: null,
    },
  }

  state.mutationResults = {
    insert: {
      data: null,
      error: null,
    },
    update: {
      data: null,
      error: null,
    },
    delete: {
      error: null,
    },
    replaceDelete: {
      error: null,
    },
    replaceInsert: {
      data: [],
      error: null,
    },
  }

  state.calls.from.length = 0
  state.calls.select.length = 0
  state.calls.eq.length = 0
  state.calls.neq.length = 0
  state.calls.order.length = 0
  state.calls.insert.length = 0
  state.calls.update.length = 0
  state.calls.delete = 0
  state.calls.gte.length = 0
  state.calls.single = 0

  supabaseMock.from.mockClear()
}

describe(
  'timetableService',
  () => {
    beforeEach(() => {
      resetState()
    })

    describe(
      'fetchTimetableData',
      () => {
        it(
          'fetches blocks, classes, and incomplete assignments',
          async () => {
            state.tableResults = {
              time_blocks: {
                data: [
                  {
                    id: 'block-1',
                  },
                ],
                error: null,
              },
              classes: {
                data: [
                  {
                    id: 'class-1',
                  },
                ],
                error: null,
              },
              assignments: {
                data: [
                  {
                    id:
                      'assignment-1',
                  },
                ],
                error: null,
              },
            }

            await expect(
              fetchTimetableData(
                'user-1',
              ),
            ).resolves.toEqual({
              blocks: [
                {
                  id: 'block-1',
                },
              ],
              classes: [
                {
                  id: 'class-1',
                },
              ],
              assignments: [
                {
                  id:
                    'assignment-1',
                },
              ],
            })

            expect(
              state.calls.from,
            ).toEqual([
              'time_blocks',
              'classes',
              'assignments',
            ])

            expect(
              state.calls.eq,
            ).toEqual(
              expect.arrayContaining([
                [
                  'time_blocks',
                  'user_id',
                  'user-1',
                ],
                [
                  'classes',
                  'user_id',
                  'user-1',
                ],
                [
                  'assignments',
                  'user_id',
                  'user-1',
                ],
              ]),
            )

            expect(
              state.calls.neq,
            ).toContainEqual([
              'assignments',
              'status',
              'Completed',
            ])
          },
        )

        it(
          'returns empty arrays for null query data',
          async () => {
            state.tableResults = {
              time_blocks: {
                data: null,
                error: null,
              },
              classes: {
                data: null,
                error: null,
              },
              assignments: {
                data: null,
                error: null,
              },
            }

            await expect(
              fetchTimetableData(
                'user-1',
              ),
            ).resolves.toEqual({
              blocks: [],
              classes: [],
              assignments: [],
            })
          },
        )

        it.each([
          [
            'time_blocks',
            'Blocks failed',
          ],
          [
            'classes',
            'Classes failed',
          ],
          [
            'assignments',
            'Assignments failed',
          ],
        ])(
          'throws when the %s query fails',
          async (
            table,
            message,
          ) => {
            const error =
              new Error(message)

            state.tableResults[
              table
            ] = {
              data: null,
              error,
            }

            await expect(
              fetchTimetableData(
                'user-1',
              ),
            ).rejects.toBe(error)
          },
        )
      },
    )

    describe(
      'insertTimeBlock',
      () => {
        it(
          'inserts and returns one timetable block',
          async () => {
            const block = {
              title: 'Revision',
            }

            const inserted = {
              id: 'block-1',
              ...block,
            }

            state.mutationResults
              .insert = {
                data: inserted,
                error: null,
              }

            await expect(
              insertTimeBlock(
                block,
              ),
            ).resolves.toEqual(
              inserted,
            )

            expect(
              state.calls.insert,
            ).toEqual([block])

            expect(
              state.calls.select,
            ).toContainEqual([
              'time_blocks',
              TIME_BLOCK_FIELDS,
            ])

            expect(
              state.calls.single,
            ).toBe(1)
          },
        )

        it(
          'throws insert errors',
          async () => {
            const error =
              new Error(
                'Insert failed',
              )

            state.mutationResults
              .insert = {
                data: null,
                error,
              }

            await expect(
              insertTimeBlock({}),
            ).rejects.toBe(error)
          },
        )
      },
    )

    describe(
      'updateTimeBlockRow',
      () => {
        it(
          'updates only the matching user block',
          async () => {
            const updated = {
              id: 'block-1',
              title: 'Updated',
            }

            state.mutationResults
              .update = {
                data: updated,
                error: null,
              }

            await expect(
              updateTimeBlockRow(
                'block-1',
                'user-1',
                {
                  title: 'Updated',
                },
              ),
            ).resolves.toEqual(
              updated,
            )

            expect(
              state.calls.update,
            ).toEqual([
              {
                title: 'Updated',
              },
            ])

            expect(
              state.calls.eq,
            ).toEqual(
              expect.arrayContaining([
                [
                  'time_blocks',
                  'id',
                  'block-1',
                ],
                [
                  'time_blocks',
                  'user_id',
                  'user-1',
                ],
              ]),
            )
          },
        )

        it(
          'throws update errors',
          async () => {
            const error =
              new Error(
                'Update failed',
              )

            state.mutationResults
              .update = {
                data: null,
                error,
              }

            await expect(
              updateTimeBlockRow(
                'block-1',
                'user-1',
                {},
              ),
            ).rejects.toBe(error)
          },
        )
      },
    )

    describe(
      'deleteTimeBlockRow',
      () => {
        it(
          'deletes only the matching user block',
          async () => {
            await expect(
              deleteTimeBlockRow(
                'block-1',
                'user-1',
              ),
            ).resolves.toBeUndefined()

            expect(
              state.calls.eq,
            ).toEqual(
              expect.arrayContaining([
                [
                  'time_blocks',
                  'id',
                  'block-1',
                ],
                [
                  'time_blocks',
                  'user_id',
                  'user-1',
                ],
              ]),
            )
          },
        )

        it(
          'throws delete errors',
          async () => {
            const error =
              new Error(
                'Delete failed',
              )

            state.mutationResults
              .delete = {
                error,
              }

            await expect(
              deleteTimeBlockRow(
                'block-1',
                'user-1',
              ),
            ).rejects.toBe(error)
          },
        )
      },
    )

    describe(
      'replaceFutureAutoBlocks',
      () => {
        it(
          'deletes matching generated coursework blocks and inserts replacements',
          async () => {
            /*
             * This service performs another delete
             * operation in this test file, so mark
             * the first delete slot as already used.
             */
            state.calls.delete = 1

            const blocks = [
              {
                block_date:
                  '2026-07-29',
              },
            ]

            state.mutationResults
              .replaceInsert = {
                data: [
                  {
                    id: 'block-1',
                  },
                ],
                error: null,
              }

            await expect(
              replaceFutureAutoBlocks({
                userId:
                  'user-1',
                fromDate:
                  '2026-07-28',
                blocks,
              }),
            ).resolves.toEqual([
              {
                id: 'block-1',
              },
            ])

            expect(
              state.calls.gte,
            ).toContainEqual([
              'block_date',
              '2026-07-28',
            ])

            expect(
              state.calls.insert,
            ).toContainEqual(
              blocks,
            )
          },
        )

        it(
          'returns early after deletion when there are no blocks',
          async () => {
            state.calls.delete = 1

            await expect(
              replaceFutureAutoBlocks({
                userId:
                  'user-1',
                fromDate:
                  '2026-07-28',
                blocks: [],
              }),
            ).resolves.toEqual([])

            expect(
              state.calls.insert,
            ).toEqual([])
          },
        )

        it(
          'throws replacement delete errors',
          async () => {
            state.calls.delete = 1

            const error =
              new Error(
                'Replacement delete failed',
              )

            state.mutationResults
              .replaceDelete = {
                error,
              }

            await expect(
              replaceFutureAutoBlocks({
                userId:
                  'user-1',
                fromDate:
                  '2026-07-28',
                blocks: [],
              }),
            ).rejects.toBe(error)
          },
        )

        it(
          'throws replacement insert errors',
          async () => {
            state.calls.delete = 1

            const error =
              new Error(
                'Replacement insert failed',
              )

            state.mutationResults
              .replaceInsert = {
                data: null,
                error,
              }

            await expect(
              replaceFutureAutoBlocks({
                userId:
                  'user-1',
                fromDate:
                  '2026-07-28',
                blocks: [
                  {
                    block_date:
                      '2026-07-29',
                  },
                ],
              }),
            ).rejects.toBe(error)
          },
        )
      },
    )
  },
)
