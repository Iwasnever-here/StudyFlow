import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import {
  getAssignmentPriority,
  getAssignmentUrgency,
  getCandidateScore,
  getScheduledMinutes,
  getTodayString,
  sortAssignmentsForScheduling,
} from '../schedulerScoring'

describe('schedulerScoring', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  describe('assignment scoring', () => {
    it('returns the correct urgency for different due dates', () => {
      const today =
        '2026-07-29'

      expect(
        getAssignmentUrgency(
          {
            due_date:
              '2026-07-29',
          },
          today,
        ),
      ).toBe(120)

      expect(
        getAssignmentUrgency(
          {
            due_date:
              '2026-07-30',
          },
          today,
        ),
      ).toBe(100)

      expect(
        getAssignmentUrgency(
          {
            due_date:
              '2026-08-01',
          },
          today,
        ),
      ).toBe(80)

      expect(
        getAssignmentUrgency(
          {
            due_date:
              '2026-08-20',
          },
          today,
        ),
      ).toBe(15)
    })

    it('adds workload to the assignment priority and caps it', () => {
      const assignment = {
        due_date:
          '2026-08-05',
      }

      expect(
        getAssignmentPriority(
          assignment,
          300,
          '2026-07-29',
        ),
      ).toBe(65)

      expect(
        getAssignmentPriority(
          assignment,
          3000,
          '2026-07-29',
        ),
      ).toBe(105)
    })
  })

  describe('candidate scoring', () => {
    it('rewards earlier daytime candidates with lower daily load', () => {
      const assignment = {
        due_date:
          '2026-08-02',
      }

      const earlierScore =
        getCandidateScore({
          candidate: {
            date:
              '2026-07-29',
            startMinutes:
              10 * 60,
          },
          assignment,
          remainingMinutes: 180,
          scheduledMinutesForDay: 0,
          scheduledMinutesForAssignmentDay: 0,
          todayString:
            '2026-07-29',
        })

      const laterScore =
        getCandidateScore({
          candidate: {
            date:
              '2026-07-31',
            startMinutes:
              19 * 60,
          },
          assignment,
          remainingMinutes: 180,
          scheduledMinutesForDay: 180,
          scheduledMinutesForAssignmentDay: 120,
          todayString:
            '2026-07-29',
        })

      expect(
        earlierScore,
      ).toBeGreaterThan(
        laterScore,
      )
    })
  })

  describe('sorting', () => {
    it('sorts assignments by priority without mutating the input', () => {
      const assignments = [
        {
          id: 1,
          title: 'Later work',
          due_date:
            '2026-08-10',
        },
        {
          id: 2,
          title: 'Urgent work',
          due_date:
            '2026-07-30',
        },
        {
          id: 3,
          title: 'Medium work',
          due_date:
            '2026-08-02',
        },
      ]

      const result =
        sortAssignmentsForScheduling(
          assignments,
          {
            1: 600,
            2: 60,
            3: 180,
          },
          '2026-07-29',
        )

      expect(
        result.map(
          (assignment) =>
            assignment.id,
        ),
      ).toEqual([2, 3, 1])

      expect(
        assignments.map(
          (assignment) =>
            assignment.id,
        ),
      ).toEqual([1, 2, 3])
    })
  })

  describe('scheduled time', () => {
    it('calculates scheduled minutes safely', () => {
      expect(
        getScheduledMinutes({
          start_time:
            '09:00:00',
          end_time:
            '10:30:00',
        }),
      ).toBe(90)

      expect(
        getScheduledMinutes({
          start_time:
            '11:00:00',
          end_time:
            '10:00:00',
        }),
      ).toBe(0)

      expect(
        getScheduledMinutes({
          start_time:
            '09:00:00',
        }),
      ).toBe(0)
    })
  })

  describe('getTodayString', () => {
    it('returns today in local YYYY-MM-DD format', () => {
      vi.useFakeTimers()

      vi.setSystemTime(
        new Date(
          2026,
          6,
          29,
          15,
          30,
        ),
      )

      expect(
        getTodayString(),
      ).toBe('2026-07-29')
    })
  })
})