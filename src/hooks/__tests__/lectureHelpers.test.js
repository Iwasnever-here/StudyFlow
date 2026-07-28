import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../utils/lectureSchedule', () => ({
  sortLectures: vi.fn((lectures) =>
    [...lectures].sort((a, b) =>
      (a.week_number ?? Infinity) -
      (b.week_number ?? Infinity),
    ),
  ),
  getNextLecture: vi.fn((lectures) =>
    lectures.find((lecture) => !lecture.completed) || null,
  ),
}))

import {
  getLectureCollections,
  hasCompleteTimeBlock,
  mergeLectureWithBlock,
  mergeLecturesWithBlocks,
  prepareLectureValues,
} from '../lectureHelpers'

describe('lectureHelpers', () => {
  beforeEach(() => {
    vi.useRealTimers()
  })

  describe('prepareLectureValues', () => {
    it('trims values and converts numeric fields', () => {
      expect(
        prepareLectureValues({
          title: '  Econometrics  ',
          lecture_url: '  https://example.com  ',
          week_number: '3',
          estimated_minutes: '75',
        }),
      ).toEqual({
        title: 'Econometrics',
        lectureUrl: 'https://example.com',
        weekNumber: 3,
        estimatedMinutes: 75,
      })
    })

    it('uses nulls and the fallback duration for blank optional fields', () => {
      expect(
        prepareLectureValues(
          {
            title: 'Lecture',
            lecture_url: ' ',
            week_number: '',
            estimated_minutes: '',
          },
          60,
        ),
      ).toEqual({
        title: 'Lecture',
        lectureUrl: null,
        weekNumber: null,
        estimatedMinutes: 60,
      })
    })

    it('rejects a blank title', () => {
      expect(() =>
        prepareLectureValues({ title: '   ' }),
      ).toThrow('Please enter a lecture title.')
    })

    it.each([0, -1, 'not-a-number'])(
      'rejects invalid week number %s',
      (weekNumber) => {
        expect(() =>
          prepareLectureValues({
            title: 'Lecture',
            week_number: weekNumber,
          }),
        ).toThrow('Week number must be at least 1.')
      },
    )
  })

  it('requires all three timetable fields', () => {
    expect(
      hasCompleteTimeBlock({
        block_date: '2026-07-30',
        start_time: '10:00',
        end_time: '11:00',
      }),
    ).toBe(true)

    expect(
      hasCompleteTimeBlock({
        block_date: '2026-07-30',
        start_time: '10:00',
      }),
    ).toBe(false)
  })

  it('merges blocks onto lectures and ignores unrelated blocks', () => {
    const lectures = [
      { id: 'lecture-2', week_number: 2 },
      { id: 'lecture-1', week_number: 1 },
    ]
    const matchingBlock = {
      id: 'block-1',
      lecture_id: 'lecture-1',
    }

    expect(
      mergeLecturesWithBlocks(lectures, [
        matchingBlock,
        { id: 'unlinked', lecture_id: null },
      ]),
    ).toEqual([
      {
        id: 'lecture-1',
        week_number: 1,
        timeBlock: matchingBlock,
      },
      {
        id: 'lecture-2',
        week_number: 2,
        timeBlock: null,
      },
    ])
  })

  it('merges a single lecture and block without mutation', () => {
    const lecture = { id: 'lecture-1' }
    const block = { id: 'block-1' }

    expect(
      mergeLectureWithBlock(lecture, block),
    ).toEqual({
      id: 'lecture-1',
      timeBlock: block,
    })
    expect(lecture).toEqual({ id: 'lecture-1' })
  })

  it('builds completed, upcoming, and next collections', () => {
    vi.useFakeTimers()
    vi.setSystemTime(
      new Date('2026-07-28T12:00:00'),
    )

    const lectures = [
      {
        id: 'done',
        completed: true,
        timeBlock: {
          block_date: '2026-07-27',
          start_time: '10:00:00',
        },
      },
      {
        id: 'next',
        completed: false,
        timeBlock: {
          block_date: '2026-07-29',
          start_time: '09:30:00',
        },
      },
      {
        id: 'unscheduled',
        completed: false,
        timeBlock: null,
      },
    ]

    const result = getLectureCollections(lectures)

    expect(result.nextLecture?.id).toBe('next')
    expect(
      result.completedLectures.map(({ id }) => id),
    ).toEqual(['done'])
    expect(
      result.upcomingLectures.map(({ id }) => id),
    ).toEqual(['next'])
  })
})
