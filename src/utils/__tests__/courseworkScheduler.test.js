import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import {
  buildCourseworkSchedule,
  getCourseworkScheduleSummary,
} from '../courseworkScheduler'

import {
  findBestCandidate,
} from '../schedulerCandidates'

vi.mock('../datetime', () => ({
  minutesToTime: (minutes) => {
    const hours = Math.floor(
      minutes / 60,
    )
    const remainingMinutes =
      minutes % 60

    return `${String(hours).padStart(
      2,
      '0',
    )}:${String(
      remainingMinutes,
    ).padStart(2, '0')}`
  },
}))

vi.mock('../schedulerScoring', () => ({
  getTodayString: () =>
    '2026-07-29',

  sortAssignmentsForScheduling: (
    assignments,
  ) => assignments,

  getScheduledMinutes: (block) => {
    const toMinutes = (time) => {
      const [hours, minutes] =
        time.split(':').map(Number)

      return hours * 60 + minutes
    }

    return Math.max(
      0,
      toMinutes(block.end_time) -
        toMinutes(block.start_time),
    )
  },
}))

vi.mock(
  '../schedulerCandidates',
  () => ({
    findBestCandidate:
      vi.fn(),
  }),
)

describe('courseworkScheduler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('buildCourseworkSchedule', () => {
    it('creates a generated block for an active assignment', () => {
      findBestCandidate.mockReturnValue({
        date: '2026-07-30',
        startMinutes: 600,
        endMinutes: 660,
        duration: 60,
      })

      const result =
        buildCourseworkSchedule({
          assignments: [
            {
              id: 1,
              class_id: 4,
              title: 'Economics essay',
              status: 'In Progress',
              hours: 1,
              due_date: '2026-08-02',
            },
          ],
          existingBlocks: [],
          userId: 'user-1',
        })

      expect(
        result.generatedBlocks,
      ).toEqual([
        expect.objectContaining({
          user_id: 'user-1',
          class_id: 4,
          coursework_id: 1,
          title:
            'Study: Economics essay',
          block_date: '2026-07-30',
          start_time: '10:00',
          end_time: '11:00',
          block_type: 'Coursework',
          auto_generated: true,
          completed: false,
        }),
      ])

      expect(
        result.remainingMinutesById,
      ).toEqual({
        1: 0,
      })

      expect(
        result.unscheduledAssignments,
      ).toEqual([])
    })

    it('subtracts manually scheduled time from the required time', () => {
      findBestCandidate.mockReturnValue({
        date: '2026-07-30',
        startMinutes: 660,
        endMinutes: 690,
        duration: 30,
      })

      const result =
        buildCourseworkSchedule({
          assignments: [
            {
              id: 2,
              class_id: 5,
              title: 'Data report',
              status: 'Not Started',
              hours: 1,
              due_date: '2026-08-03',
            },
          ],
          existingBlocks: [
            {
              coursework_id: '2',
              start_time: '09:00',
              end_time: '09:30',
              auto_generated: false,
            },
          ],
          userId: 'user-1',
        })

      expect(
        findBestCandidate,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          remainingMinutes: 30,
        }),
      )

      expect(
        result.generatedBlocks,
      ).toHaveLength(1)

      expect(
        result.remainingMinutesById[2],
      ).toBe(0)
    })

    it('removes old generated coursework blocks but keeps other timetable blocks as blockers', () => {
      findBestCandidate.mockReturnValue({
        date: '2026-07-30',
        startMinutes: 660,
        endMinutes: 720,
        duration: 60,
      })

      const oldGeneratedCoursework = {
        id: 'old-coursework',
        block_type: 'Coursework',
        auto_generated: true,
      }

      const generatedLecture = {
        id: 'lecture-1',
        block_type: 'Lecture',
        auto_generated: true,
      }

      const personalBlock = {
        id: 'personal-1',
        block_type: 'Personal',
        auto_generated: false,
      }

      buildCourseworkSchedule({
        assignments: [
          {
            id: 3,
            title: 'Revision',
            status: 'Not Started',
            hours: 1,
            due_date: '2026-08-04',
          },
        ],
        existingBlocks: [
          oldGeneratedCoursework,
          generatedLecture,
          personalBlock,
        ],
        userId: 'user-1',
      })

      expect(
        findBestCandidate,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          blocks: [
            generatedLecture,
            personalBlock,
          ],
        }),
      )
    })

    it('returns an assignment as unscheduled when no candidate is available', () => {
      findBestCandidate.mockReturnValue(
        null,
      )

      const result =
        buildCourseworkSchedule({
          assignments: [
            {
              id: 4,
              title: 'Final project',
              status: 'Not Started',
              hours: 2,
              due_date: '2026-08-01',
            },
          ],
          existingBlocks: [],
          userId: 'user-1',
        })

      expect(
        result.generatedBlocks,
      ).toEqual([])

      expect(
        result.unscheduledAssignments,
      ).toEqual([
        {
          id: 4,
          title: 'Final project',
          remainingMinutes: 120,
        },
      ])
    })

    it('ignores completed, overdue, and invalid assignments', () => {
      const result =
        buildCourseworkSchedule({
          assignments: [
            {
              id: 1,
              title: 'Completed work',
              status: ' completed ',
              hours: 2,
              due_date: '2026-08-01',
            },
            {
              id: 2,
              title: 'Overdue work',
              status: 'Not Started',
              hours: 2,
              due_date: '2026-07-28',
            },
            {
              id: 3,
              title: 'No estimate',
              status: 'Not Started',
              hours: 0,
              due_date: '2026-08-01',
            },
          ],
          existingBlocks: [],
          userId: 'user-1',
        })

      expect(
        findBestCandidate,
      ).not.toHaveBeenCalled()

      expect(result).toEqual({
        generatedBlocks: [],
        remainingMinutesById: {},
        unscheduledAssignments: [],
      })
    })
  })

  describe('getCourseworkScheduleSummary', () => {
    it('calculates totals and selects the next session', () => {
      const pastSession = {
        coursework_id: '10',
        block_date: '2026-07-28',
        start_time: '09:00',
        end_time: '09:30',
      }

      const nextSession = {
        coursework_id: 10,
        block_date: '2026-07-30',
        start_time: '11:00',
        end_time: '12:00',
      }

      const summary =
        getCourseworkScheduleSummary({
          assignments: [
            {
              id: 10,
              title: 'Research task',
              hours: 1.5,
            },
          ],
          blocks: [
            nextSession,
            pastSession,
          ],
        })

      expect(summary[10]).toEqual({
        scheduledMinutes: 90,
        estimatedMinutes: 90,
        remainingMinutes: 0,
        nextSession,
        sessionCount: 2,
        fullyScheduled: true,
        overScheduledMinutes: 0,
      })
    })
  })
})