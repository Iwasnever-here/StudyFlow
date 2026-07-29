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

import useTimetable from '../useTimetable'
import {
  getAuthenticatedUser,
} from '../hookUtils'

import {
  getTimetableFields,
} from '../../config/timetableFields'

import {
  findBlockClash,
} from '../../utils/timetable'

import {
  normaliseTime,
} from '../../utils/datetime'

import {
  deleteTimeBlockRow,
  fetchTimetableData,
  insertTimeBlock,
  updateTimeBlockRow,
} from '../../services/timetableService'

vi.mock(
  '../../lib/supabaseClient',
  () => ({
    supabase: {
      auth: {},
    },
  }),
)

vi.mock('../hookUtils', () => ({
  getAuthenticatedUser: vi.fn(),
}))

vi.mock(
  '../../config/timetableFields',
  () => ({
    getTimetableFields: vi.fn(),
  }),
)

vi.mock(
  '../../utils/timetable',
  () => ({
    findBlockClash: vi.fn(),
  }),
)

vi.mock(
  '../../utils/datetime',
  () => ({
    normaliseTime: vi.fn(
      (time) => time?.slice(0, 5),
    ),
  }),
)

vi.mock(
  '../../services/timetableService',
  () => ({
    fetchTimetableData: vi.fn(),
    insertTimeBlock: vi.fn(),
    updateTimeBlockRow: vi.fn(),
    deleteTimeBlockRow: vi.fn(),
  }),
)

const testUser = {
  id: 'user-1',
}

const testClasses = [
  {
    id: 1,
    name: 'Economics',
  },
]

const testAssignments = [
  {
    id: 20,
    title: 'Essay',
  },
]

const testBlocks = [
  {
    id: 1,
    title: 'Lecture',
    block_date: '2026-07-29',
    start_time: '09:00',
    end_time: '10:00',
    lecture_id: 10,
  },
  {
    id: 2,
    title: 'Study',
    block_date: '2026-07-29',
    start_time: '11:00',
    end_time: '12:00',
    lecture_id: null,
  },
]

const pageData = {
  blocks: testBlocks,
  classes: testClasses,
  assignments: testAssignments,
}

const renderLoadedHook = async () => {
  const hook =
    renderHook(() => useTimetable())

  await waitFor(() => {
    expect(
      hook.result.current.loading,
    ).toBe(false)
  })

  return hook
}

describe('useTimetable', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    getAuthenticatedUser
      .mockResolvedValue(testUser)

    fetchTimetableData
      .mockResolvedValue(pageData)

    getTimetableFields
      .mockReturnValue([
        {
          name: 'class_id',
        },
      ])

    findBlockClash
      .mockReturnValue(null)

    normaliseTime
      .mockImplementation(
        (time) => time?.slice(0, 5),
      )
  })

  it('fetches timetable data on mount', async () => {
    const { result } =
      await renderLoadedHook()

    expect(
      getAuthenticatedUser,
    ).toHaveBeenCalledWith(
      expect.anything(),
      'You must be signed in to view your timetable.',
    )

    expect(
      fetchTimetableData,
    ).toHaveBeenCalledWith(
      'user-1',
    )

    expect(
      result.current.blocks,
    ).toEqual(testBlocks)

    expect(
      result.current.classes,
    ).toEqual(testClasses)

    expect(
      result.current.assignments,
    ).toEqual(testAssignments)

    expect(
      result.current.loadingOptions,
    ).toBe(false)

    expect(
      getTimetableFields,
    ).toHaveBeenCalledWith({
      classes: testClasses,
      assignments:
        testAssignments,
    })

    expect(
      result.current.timetableFields,
    ).toEqual([
      {
        name: 'class_id',
      },
    ])
  })

  it('shows an error when timetable loading fails', async () => {
    fetchTimetableData
      .mockRejectedValue(
        new Error(
          'Unable to load timetable.',
        ),
      )

    const { result } =
      await renderLoadedHook()

    expect(
      result.current.pageError,
    ).toBe(
      'Unable to load timetable.',
    )

    expect(
      result.current.blocks,
    ).toEqual([])
  })

  it('creates a timetable block', async () => {
    const createdBlock = {
      id: 3,
      title: 'Revision',
      block_date: '2026-07-30',
      start_time: '14:00',
      end_time: '15:00',
      class_id: 1,
      coursework_id: 20,
      lecture_id: null,
      block_type: 'Study',
      is_recurring: false,
      recurrence_type: 'none',
      recurrence_end_date: null,
      auto_generated: false,
      completed: false,
      user_id: 'user-1',
    }

    insertTimeBlock
      .mockResolvedValue(
        createdBlock,
      )

    const { result } =
      await renderLoadedHook()

    let returnedBlock

    await act(async () => {
      returnedBlock =
        await result.current
          .createTimetableBlock({
            title:
              '  Revision  ',
            class_id: 1,
            coursework_id: 20,
            block_date:
              '2026-07-30',
            start_time:
              '14:00:00',
            end_time:
              '15:00:00',
            block_type: 'Study',
            is_recurring: false,
          })
    })

    expect(
      normaliseTime,
    ).toHaveBeenCalledWith(
      '14:00:00',
    )

    expect(
      normaliseTime,
    ).toHaveBeenCalledWith(
      '15:00:00',
    )

    expect(
      findBlockClash,
    ).toHaveBeenCalledWith({
      blocks: testBlocks,
      blockDate:
        '2026-07-30',
      startTime: '14:00',
      endTime: '15:00',
    })

    expect(
      insertTimeBlock,
    ).toHaveBeenCalledWith({
      user_id: 'user-1',
      title: 'Revision',
      class_id: 1,
      coursework_id: 20,
      lecture_id: null,
      block_date: '2026-07-30',
      start_time: '14:00',
      end_time: '15:00',
      block_type: 'Study',
      is_recurring: false,
      recurrence_type: 'none',
      recurrence_end_date: null,
      auto_generated: false,
      completed: false,
    })

    expect(
      returnedBlock,
    ).toEqual(createdBlock)

    expect(
      result.current.blocks,
    ).toEqual([
      ...testBlocks,
      createdBlock,
    ])

    expect(
      result.current.saving,
    ).toBe(false)
  })

  it('rejects a create request when the block clashes', async () => {
    findBlockClash.mockReturnValue(
        'This event overlaps another event.',
    )

    const { result } =
        await renderLoadedHook()

    let caughtError

    await act(async () => {
        try {
        await result.current
            .createTimetableBlock({
            title: 'Revision',
            block_date: '2026-07-29',
            start_time: '09:30',
            end_time: '10:30',
            block_type: 'Study',
            })
        } catch (error) {
        caughtError = error
        }
    })

    expect(caughtError).toEqual(
        new Error(
        'This event overlaps another event.',
        ),
    )

    expect(
        insertTimeBlock,
    ).not.toHaveBeenCalled()

    expect(
        result.current.pageError,
    ).toBe(
        'This event overlaps another event.',
    )

    expect(
        result.current.saving,
    ).toBe(false)
    })

  it('updates an existing timetable block', async () => {
    const updatedBlock = {
      ...testBlocks[1],
      title: 'Updated study',
      start_time: '13:00',
      end_time: '14:00',
    }

    updateTimeBlockRow
      .mockResolvedValue(
        updatedBlock,
      )

    const { result } =
      await renderLoadedHook()

    let returnedBlock

    await act(async () => {
      returnedBlock =
        await result.current
          .updateTimetableBlock(
            2,
            {
              title:
                '  Updated study  ',
              class_id: '',
              coursework_id: '',
              block_date:
                '2026-07-29',
              start_time:
                '13:00:00',
              end_time:
                '14:00:00',
              block_type:
                'Personal',
              is_recurring: true,
              recurrence_type:
                'weekly',
              recurrence_end_date:
                '2026-08-30',
            },
          )
    })

    expect(
      findBlockClash,
    ).toHaveBeenCalledWith({
      blocks: testBlocks,
      blockDate:
        '2026-07-29',
      startTime: '13:00',
      endTime: '14:00',
      ignoreBlockId: 2,
    })

    expect(
      updateTimeBlockRow,
    ).toHaveBeenCalledWith(
      2,
      'user-1',
      {
        title: 'Updated study',
        class_id: null,
        coursework_id: null,
        block_date:
          '2026-07-29',
        start_time: '13:00',
        end_time: '14:00',
        block_type: 'Personal',
        is_recurring: true,
        recurrence_type:
          'weekly',
        recurrence_end_date:
          '2026-08-30',
      },
    )

    expect(
      returnedBlock,
    ).toEqual(updatedBlock)

    expect(
      result.current.blocks.find(
        (block) => block.id === 2,
      ),
    ).toEqual(updatedBlock)
  })

  it('prevents lecture blocks from being updated', async () => {
    const { result } =
        await renderLoadedHook()

    let caughtError

    await act(async () => {
        try {
        await result.current
            .updateTimetableBlock(
            1,
            {
                title: 'Changed lecture',
                block_date: '2026-07-29',
                start_time: '09:00',
                end_time: '10:00',
                block_type: 'Lecture',
            },
            )
        } catch (error) {
        caughtError = error
        }
    })

    expect(caughtError).toEqual(
        new Error(
        'Edit lecture events from the class page.',
        ),
    )

    expect(
        updateTimeBlockRow,
    ).not.toHaveBeenCalled()

    expect(
        result.current.pageError,
    ).toBe(
        'Edit lecture events from the class page.',
    )

    expect(
        result.current.saving,
    ).toBe(false)
    })

  it('deletes a normal block but prevents lecture deletion', async () => {
    deleteTimeBlockRow
      .mockResolvedValue()

    const { result } =
      await renderLoadedHook()

    await act(async () => {
      await result.current
        .deleteTimetableBlock(
          testBlocks[1],
        )
    })

    expect(
      deleteTimeBlockRow,
    ).toHaveBeenCalledWith(
      2,
      'user-1',
    )

    expect(
      result.current.blocks.some(
        (block) => block.id === 2,
      ),
    ).toBe(false)

    await act(async () => {
      await result.current
        .deleteTimetableBlock(
          testBlocks[0],
        )
    })

    expect(
      deleteTimeBlockRow,
    ).toHaveBeenCalledTimes(1)

    expect(
      result.current.pageError,
    ).toBe(
      'Delete lecture events from the class page.',
    )
  })
})