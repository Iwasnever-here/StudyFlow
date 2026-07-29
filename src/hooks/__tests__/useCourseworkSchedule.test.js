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

import useCourseworkSchedule from '../useCourseworkSchedule'

import {
  getAuthenticatedUser,
} from '../hookUtils'

import {
  buildCourseworkSchedule,
  getCourseworkScheduleSummary,
} from '../../utils/courseworkScheduler'

import {
  fetchAllTimeBlocks,
  replaceGeneratedCourseworkBlocks,
} from '../../services/courseworkScheduleService'

import {
  formatDate,
} from '../../utils/datetime'

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
  '../../utils/courseworkScheduler',
  () => ({
    buildCourseworkSchedule:
      vi.fn(),
    getCourseworkScheduleSummary:
      vi.fn(),
  }),
)

vi.mock(
  '../../services/courseworkScheduleService',
  () => ({
    fetchAllTimeBlocks:
      vi.fn(),
    replaceGeneratedCourseworkBlocks:
      vi.fn(),
  }),
)

vi.mock(
  '../../utils/datetime',
  () => ({
    formatDate: vi.fn(),
  }),
)

const testUser = {
  id: 'user-1',
}

const assignments = [
  {
    id: 1,
    title: 'Economics essay',
    due_date: '2026-08-05',
    status: 'not started',
    hours: 4,
  },
  {
    id: 2,
    title: 'Finance report',
    due_date: '2026-08-10',
    status: 'in progress',
    hours: 3,
  },
]

const initialBlocks = [
  {
    id: 1,
    user_id: 'user-1',
    title: 'Economics lecture',
    block_date: '2026-07-30',
    start_time: '09:00',
    end_time: '10:00',
    auto_generated: false,
  },
]

const generatedBlocks = [
  {
    user_id: 'user-1',
    coursework_id: 1,
    title:
      'Study: Economics essay',
    block_date: '2026-07-31',
    start_time: '10:00',
    end_time: '11:00',
    auto_generated: true,
  },
]

const refreshedBlocks = [
  ...initialBlocks,
  {
    id: 2,
    ...generatedBlocks[0],
  },
]

const unscheduledAssignments = [
  {
    id: 2,
    title: 'Finance report',
  },
]

const scheduleResult = {
  generatedBlocks,
  unscheduledAssignments,
}

const scheduleSummary = {
  1: {
    scheduledMinutes: 60,
    scheduledHours: 1,
  },
  2: {
    scheduledMinutes: 0,
    scheduledHours: 0,
  },
}

const renderLoadedHook = async (
  hookAssignments = assignments,
) => {
  const hook = renderHook(() =>
    useCourseworkSchedule(
      hookAssignments,
    ),
  )

  await waitFor(() => {
    expect(
      hook.result.current
        .loadingSchedule,
    ).toBe(false)
  })

  return hook
}

describe(
  'useCourseworkSchedule',
  () => {
    beforeEach(() => {
      vi.clearAllMocks()

      getAuthenticatedUser
        .mockResolvedValue(testUser)

      fetchAllTimeBlocks
        .mockResolvedValue(
          initialBlocks,
        )

      getCourseworkScheduleSummary
        .mockReturnValue(
          scheduleSummary,
        )

      buildCourseworkSchedule
        .mockReturnValue(
          scheduleResult,
        )

      replaceGeneratedCourseworkBlocks
        .mockResolvedValue(
          undefined,
        )

      formatDate.mockReturnValue(
        '2026-07-29',
      )
    })

    it('fetches the current schedule on mount', async () => {
      const { result } =
        await renderLoadedHook()

      expect(
        getAuthenticatedUser,
      ).toHaveBeenCalledWith(
        expect.anything(),
        'You must be signed in to schedule coursework.',
      )

      expect(
        fetchAllTimeBlocks,
      ).toHaveBeenCalledWith(
        'user-1',
      )

      expect(
        result.current.blocks,
      ).toEqual(initialBlocks)

      expect(
        result.current
          .loadingSchedule,
      ).toBe(false)

      expect(
        result.current.scheduleError,
      ).toBeNull()
    })

    it('creates a schedule summary from assignments and blocks', async () => {
      const { result } =
        await renderLoadedHook()

      expect(
        getCourseworkScheduleSummary,
      ).toHaveBeenLastCalledWith({
        assignments,
        blocks: initialBlocks,
      })

      expect(
        result.current
          .scheduleSummaryByCoursework,
      ).toEqual(scheduleSummary)
    })

    it('handles an initial loading error', async () => {
      fetchAllTimeBlocks
        .mockRejectedValue(
          new Error(
            'Unable to fetch blocks.',
          ),
        )

      const { result } =
        await renderLoadedHook()

      expect(
        result.current.blocks,
      ).toEqual([])

      expect(
        result.current.scheduleError,
      ).toBe(
        'Unable to fetch blocks.',
      )

      expect(
        result.current
          .loadingSchedule,
      ).toBe(false)
    })

    it('manually refetches the schedule', async () => {
      const { result } =
        await renderLoadedHook()

      fetchAllTimeBlocks
        .mockResolvedValueOnce(
          refreshedBlocks,
        )

      let returnedBlocks

      await act(async () => {
        returnedBlocks =
          await result.current
            .fetchSchedule()
      })

      expect(
        returnedBlocks,
      ).toEqual(refreshedBlocks)

      expect(
        result.current.blocks,
      ).toEqual(refreshedBlocks)

      expect(
        fetchAllTimeBlocks,
      ).toHaveBeenCalledTimes(2)

      expect(
        result.current.scheduleError,
      ).toBeNull()
    })

    it('rebuilds and saves the coursework schedule', async () => {
      fetchAllTimeBlocks
        .mockResolvedValueOnce(
          initialBlocks,
        )
        .mockResolvedValueOnce(
          initialBlocks,
        )
        .mockResolvedValueOnce(
          refreshedBlocks,
        )

      const { result } =
        await renderLoadedHook()

      let returnedResult

      await act(async () => {
        returnedResult =
          await result.current
            .rebuildCourseworkSchedule()
      })

      expect(
        buildCourseworkSchedule,
      ).toHaveBeenCalledWith({
        assignments,
        existingBlocks:
          initialBlocks,
        userId: 'user-1',
      })

      expect(
        formatDate,
      ).toHaveBeenCalledWith(
        expect.any(Date),
      )

      expect(
        replaceGeneratedCourseworkBlocks,
      ).toHaveBeenCalledWith({
        userId: 'user-1',
        fromDate: '2026-07-29',
        blocks: generatedBlocks,
      })

      expect(
        fetchAllTimeBlocks,
      ).toHaveBeenCalledTimes(3)

      expect(
        result.current.blocks,
      ).toEqual(refreshedBlocks)

      expect(
        result.current
          .unscheduledAssignments,
      ).toEqual(
        unscheduledAssignments,
      )

      expect(
        result.current.scheduling,
      ).toBe(false)

      expect(
        result.current.scheduleError,
      ).toBeNull()

      expect(
        returnedResult,
      ).toEqual({
        ...scheduleResult,
        savedBlocks:
          refreshedBlocks,
      })
    })

    it('uses empty arrays when the scheduler omits result arrays', async () => {
      buildCourseworkSchedule
        .mockReturnValue({
          generatedBlocks:
            undefined,
          unscheduledAssignments:
            undefined,
        })

      fetchAllTimeBlocks
        .mockResolvedValueOnce(
          initialBlocks,
        )
        .mockResolvedValueOnce(
          initialBlocks,
        )
        .mockResolvedValueOnce(
          refreshedBlocks,
        )

      const { result } =
        await renderLoadedHook()

      await act(async () => {
        await result.current
          .rebuildCourseworkSchedule()
      })

      expect(
        replaceGeneratedCourseworkBlocks,
      ).toHaveBeenCalledWith({
        userId: 'user-1',
        fromDate: '2026-07-29',
        blocks: [],
      })

      expect(
        result.current
          .unscheduledAssignments,
      ).toEqual([])
    })

    it('handles a rebuild error and resets scheduling', async () => {
      fetchAllTimeBlocks
        .mockResolvedValueOnce(
          initialBlocks,
        )
        .mockRejectedValueOnce(
          new Error(
            'Unable to rebuild schedule.',
          ),
        )

      const { result } =
        await renderLoadedHook()

      let caughtError

      await act(async () => {
        try {
          await result.current
            .rebuildCourseworkSchedule()
        } catch (error) {
          caughtError = error
        }
      })

      expect(caughtError).toEqual(
        new Error(
          'Unable to rebuild schedule.',
        ),
      )

      expect(
        result.current.scheduleError,
      ).toBe(
        'Unable to rebuild schedule.',
      )

      expect(
        result.current.scheduling,
      ).toBe(false)

      expect(
        replaceGeneratedCourseworkBlocks,
      ).not.toHaveBeenCalled()
    })

    it('uses an empty assignment array when null is supplied', async () => {
      const { result } =
        await renderLoadedHook(null)

      expect(
        getCourseworkScheduleSummary,
      ).toHaveBeenLastCalledWith({
        assignments: [],
        blocks: initialBlocks,
      })

      expect(
        result.current
          .scheduleSummaryByCoursework,
      ).toEqual(scheduleSummary)
    })

    it('allows the schedule error to be cleared manually', async () => {
      fetchAllTimeBlocks
        .mockRejectedValue(
          new Error(
            'Schedule failed.',
          ),
        )

      const { result } =
        await renderLoadedHook()

      expect(
        result.current.scheduleError,
      ).toBe(
        'Schedule failed.',
      )

      act(() => {
        result.current
          .setScheduleError(null)
      })

      expect(
        result.current.scheduleError,
      ).toBeNull()
    })
  },
)