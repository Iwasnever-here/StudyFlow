import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import {
  fetchAllTimeBlocks,
  replaceGeneratedCourseworkBlocks,
  TIME_BLOCK_FIELDS,
} from '../courseworkScheduleService.js'

const {
  supabaseMock,
  queryState,
} = vi.hoisted(() => {
  const state = {
    fetchResult: {
      data: [],
      error: null,
    },
    deleteResult: {
      error: null,
    },
    insertResult: {
      data: [],
      error: null,
    },
    calls: {
      from: [],
      select: [],
      eq: [],
      order: [],
      delete: 0,
      gte: [],
      insert: [],
    },
  }

  const makeFetchBuilder = () => {
    const builder = {
      select: vi.fn((fields) => {
        state.calls.select.push(fields)
        return builder
      }),

      eq: vi.fn((column, value) => {
        state.calls.eq.push([
          column,
          value,
        ])
        return builder
      }),

      order: vi.fn(
        (column, options) => {
          state.calls.order.push([
            column,
            options,
          ])
          return builder
        },
      ),

      then: (resolve, reject) =>
        Promise
          .resolve(
            state.fetchResult,
          )
          .then(resolve, reject),
    }

    return builder
  }

  const makeDeleteBuilder = () => {
    const builder = {
      eq: vi.fn((column, value) => {
        state.calls.eq.push([
          column,
          value,
        ])
        return builder
      }),

      gte: vi.fn((column, value) => {
        state.calls.gte.push([
          column,
          value,
        ])

        return Promise.resolve(
          state.deleteResult,
        )
      }),
    }

    return builder
  }

  const makeInsertBuilder = () => {
    const builder = {
      select: vi.fn((fields) => {
        state.calls.select.push(fields)

        return Promise.resolve(
          state.insertResult,
        )
      }),
    }

    return builder
  }

  const supabase = {
    from: vi.fn((table) => {
      state.calls.from.push(table)

      return {
        select: (fields) =>
          makeFetchBuilder()
            .select(fields),

        delete: () => {
          state.calls.delete += 1
          return makeDeleteBuilder()
        },

        insert: (rows) => {
          state.calls.insert.push(rows)
          return makeInsertBuilder()
        },
      }
    }),
  }

  return {
    supabaseMock: supabase,
    queryState: state,
  }
})

vi.mock(
  '../../lib/supabaseClient',
  () => ({
    supabase: supabaseMock,
  }),
)

const resetState = () => {
  queryState.fetchResult = {
    data: [],
    error: null,
  }

  queryState.deleteResult = {
    error: null,
  }

  queryState.insertResult = {
    data: [],
    error: null,
  }

  queryState.calls.from.length = 0
  queryState.calls.select.length = 0
  queryState.calls.eq.length = 0
  queryState.calls.order.length = 0
  queryState.calls.delete = 0
  queryState.calls.gte.length = 0
  queryState.calls.insert.length = 0

  supabaseMock.from.mockClear()
}

describe(
  'courseworkScheduleService',
  () => {
    beforeEach(() => {
      resetState()
    })

    describe(
      'fetchAllTimeBlocks',
      () => {
        it(
          'requires a user ID',
          async () => {
            await expect(
              fetchAllTimeBlocks(),
            ).rejects.toThrow(
              'A user ID is required to fetch timetable blocks.',
            )

            expect(
              supabaseMock.from,
            ).not.toHaveBeenCalled()
          },
        )

        it(
          'fetches and orders all user timetable blocks',
          async () => {
            const blocks = [
              {
                id: 'block-1',
              },
            ]

            queryState.fetchResult = {
              data: blocks,
              error: null,
            }

            await expect(
              fetchAllTimeBlocks(
                'user-1',
              ),
            ).resolves.toEqual(
              blocks,
            )

            expect(
              queryState.calls.from,
            ).toEqual([
              'time_blocks',
            ])

            expect(
              queryState.calls.select,
            ).toContain(
              TIME_BLOCK_FIELDS,
            )

            expect(
              queryState.calls.eq,
            ).toContainEqual([
              'user_id',
              'user-1',
            ])

            expect(
              queryState.calls.order,
            ).toEqual([
              [
                'block_date',
                {
                  ascending: true,
                },
              ],
              [
                'start_time',
                {
                  ascending: true,
                },
              ],
            ])
          },
        )

        it(
          'returns an empty array when Supabase returns null data',
          async () => {
            queryState.fetchResult = {
              data: null,
              error: null,
            }

            await expect(
              fetchAllTimeBlocks(
                'user-1',
              ),
            ).resolves.toEqual([])
          },
        )

        it(
          'throws fetch errors',
          async () => {
            const fetchError =
              new Error(
                'Fetch failed',
              )

            queryState.fetchResult = {
              data: null,
              error: fetchError,
            }

            await expect(
              fetchAllTimeBlocks(
                'user-1',
              ),
            ).rejects.toBe(
              fetchError,
            )
          },
        )
      },
    )

    describe(
      'replaceGeneratedCourseworkBlocks',
      () => {
        it(
          'requires a user ID',
          async () => {
            await expect(
              replaceGeneratedCourseworkBlocks(
                {
                  fromDate:
                    '2026-07-28',
                },
              ),
            ).rejects.toThrow(
              'A user ID is required to rebuild the schedule.',
            )
          },
        )

        it(
          'requires a start date',
          async () => {
            await expect(
              replaceGeneratedCourseworkBlocks(
                {
                  userId:
                    'user-1',
                },
              ),
            ).rejects.toThrow(
              'A start date is required to rebuild the schedule.',
            )
          },
        )

        it(
          'deletes future generated coursework blocks before inserting replacements',
          async () => {
            const blocks = [
              {
                block_date:
                  '2026-07-29',
                start_time:
                  '10:00',
                end_time:
                  '11:00',
              },
            ]

            const inserted = [
              {
                id: 'block-1',
                ...blocks[0],
              },
            ]

            queryState.insertResult = {
              data: inserted,
              error: null,
            }

            await expect(
              replaceGeneratedCourseworkBlocks(
                {
                  userId:
                    'user-1',
                  fromDate:
                    '2026-07-28',
                  blocks,
                },
              ),
            ).resolves.toEqual(
              inserted,
            )

            expect(
              queryState.calls.delete,
            ).toBe(1)

            expect(
              queryState.calls.eq,
            ).toEqual(
              expect.arrayContaining([
                [
                  'user_id',
                  'user-1',
                ],
                [
                  'auto_generated',
                  true,
                ],
                [
                  'block_type',
                  'Coursework',
                ],
              ]),
            )

            expect(
              queryState.calls.gte,
            ).toContainEqual([
              'block_date',
              '2026-07-28',
            ])

            expect(
              queryState.calls.insert,
            ).toEqual([
              blocks,
            ])
          },
        )

        it(
          'returns early when there are no replacement blocks',
          async () => {
            await expect(
              replaceGeneratedCourseworkBlocks(
                {
                  userId:
                    'user-1',
                  fromDate:
                    '2026-07-28',
                  blocks: [],
                },
              ),
            ).resolves.toEqual([])

            expect(
              queryState.calls.delete,
            ).toBe(1)

            expect(
              queryState.calls.insert,
            ).toEqual([])
          },
        )

        it(
          'filters invalid replacement blocks before insertion',
          async () => {
            const validBlock = {
              block_date:
                '2026-07-29',
              start_time:
                '10:00',
              end_time:
                '11:00',
            }

            queryState.insertResult = {
              data: [validBlock],
              error: null,
            }

            await replaceGeneratedCourseworkBlocks(
              {
                userId: 'user-1',
                fromDate:
                  '2026-07-28',
                blocks: [
                  null,
                  {
                    block_date:
                      '2026-07-29',
                  },
                  validBlock,
                ],
              },
            )

            expect(
              queryState.calls.insert,
            ).toEqual([
              [validBlock],
            ])
          },
        )

        it(
          'does not insert when every replacement block is invalid',
          async () => {
            await expect(
              replaceGeneratedCourseworkBlocks(
                {
                  userId:
                    'user-1',
                  fromDate:
                    '2026-07-28',
                  blocks: [
                    null,
                    {
                      block_date:
                        '2026-07-29',
                    },
                  ],
                },
              ),
            ).resolves.toEqual([])

            expect(
              queryState.calls.insert,
            ).toEqual([])
          },
        )

        it(
          'throws delete errors and does not attempt insertion',
          async () => {
            const deleteError =
              new Error(
                'Delete failed',
              )

            queryState.deleteResult = {
              error: deleteError,
            }

            await expect(
              replaceGeneratedCourseworkBlocks(
                {
                  userId:
                    'user-1',
                  fromDate:
                    '2026-07-28',
                  blocks: [
                    {
                      block_date:
                        '2026-07-29',
                      start_time:
                        '10:00',
                      end_time:
                        '11:00',
                    },
                  ],
                },
              ),
            ).rejects.toBe(
              deleteError,
            )

            expect(
              queryState.calls.insert,
            ).toEqual([])
          },
        )

        it(
          'throws insert errors',
          async () => {
            const insertError =
              new Error(
                'Insert failed',
              )

            queryState.insertResult = {
              data: null,
              error: insertError,
            }

            await expect(
              replaceGeneratedCourseworkBlocks(
                {
                  userId:
                    'user-1',
                  fromDate:
                    '2026-07-28',
                  blocks: [
                    {
                      block_date:
                        '2026-07-29',
                      start_time:
                        '10:00',
                      end_time:
                        '11:00',
                    },
                  ],
                },
              ),
            ).rejects.toBe(
              insertError,
            )
          },
        )
      },
    )
  },
)
