import {
  describe,
  expect,
  it,
} from 'vitest'

import {
  formatDateForDisplay,
  formatDateLocal,
  formatTime,
  generateWeeklyLectures,
  getDaysBetween,
  getLectureStartDate,
  getNextLecture,
  isPastLecture,
  parseLocalDate,
  sortLectures,
} from '../lectureSchedule'

describe('lectureSchedule', () => {
  describe('date and time helpers', () => {
    it('parses and formats local dates safely', () => {
      const date =
        parseLocalDate('2026-07-29')

      expect(date).toBeInstanceOf(Date)

      expect(
        formatDateLocal(date),
      ).toBe('2026-07-29')

      expect(
        parseLocalDate(''),
      ).toBeNull()

      expect(
        parseLocalDate('invalid'),
      ).toBeNull()

      expect(
        formatDateLocal(null),
      ).toBe('')
    })

    it('formats dates and times for display', () => {
      expect(
        formatDateForDisplay(
          '2026-07-29',
        ),
      ).toBe('29 Jul 2026')

      expect(
        formatDateForDisplay(''),
      ).toBe('Date not set')

      expect(
        formatTime('09:30:00'),
      ).toBe('09:30')

      expect(
        formatTime(null),
      ).toBe('')
    })

    it('calculates whole calendar days between dates', () => {
      const startDate = new Date(
        2026,
        6,
        27,
        23,
      )

      const currentDate = new Date(
        2026,
        6,
        29,
        1,
      )

      expect(
        getDaysBetween(
          startDate,
          currentDate,
        ),
      ).toBe(2)

      expect(
        getDaysBetween(
          null,
          currentDate,
        ),
      ).toBe(0)
    })
  })

  describe('generateWeeklyLectures', () => {
    it('generates weekly lectures within the semester range', () => {
      const result =
        generateWeeklyLectures({
          semesterStart:
            '2026-07-27',
          semesterEnd:
            '2026-08-10',
          weeklySchedules: [
            {
              day_of_week:
                'Wednesday',
              start_time:
                '09:00:00',
              end_time:
                '10:00:00',
              session_type:
                'Seminar',
              location:
                ' Room 4 ',
              lecture_url:
                ' https://example.com ',
            },
          ],
        })

      expect(result).toEqual([
        {
          block_date:
            '2026-07-29',
          start_time:
            '09:00:00',
          end_time:
            '10:00:00',
          week_number: 1,
          day_of_week:
            'Wednesday',
          session_type:
            'Seminar',
          location: 'Room 4',
          lecture_url:
            'https://example.com',
        },
        {
          block_date:
            '2026-08-05',
          start_time:
            '09:00:00',
          end_time:
            '10:00:00',
          week_number: 2,
          day_of_week:
            'Wednesday',
          session_type:
            'Seminar',
          location: 'Room 4',
          lecture_url:
            'https://example.com',
        },
      ])
    })

    it('skips invalid schedules and invalid semester ranges', () => {
      expect(
        generateWeeklyLectures({
          semesterStart:
            '2026-08-10',
          semesterEnd:
            '2026-07-27',
          weeklySchedules: [],
        }),
      ).toEqual([])

      expect(
        generateWeeklyLectures({
          semesterStart:
            '2026-07-27',
          semesterEnd:
            '2026-08-10',
          weeklySchedules: [
            {
              day_of_week:
                'Notaday',
              start_time:
                '09:00',
              end_time:
                '10:00',
            },
            {
              day_of_week:
                'Monday',
              start_time: '',
              end_time:
                '10:00',
            },
          ],
        }),
      ).toEqual([])
    })

    it('sorts generated lectures by date and start time', () => {
      const result =
        generateWeeklyLectures({
          semesterStart:
            '2026-07-27',
          semesterEnd:
            '2026-07-31',
          weeklySchedules: [
            {
              day_of_week:
                'Wednesday',
              start_time:
                '14:00',
              end_time:
                '15:00',
            },
            {
              day_of_week:
                'Monday',
              start_time:
                '10:00',
              end_time:
                '11:00',
            },
            {
              day_of_week:
                'Wednesday',
              start_time:
                '09:00',
              end_time:
                '10:00',
            },
          ],
        })

      expect(
        result.map((lecture) => [
          lecture.block_date,
          lecture.start_time,
        ]),
      ).toEqual([
        [
          '2026-07-27',
          '10:00',
        ],
        [
          '2026-07-29',
          '09:00',
        ],
        [
          '2026-07-29',
          '14:00',
        ],
      ])
    })
  })

  describe('lecture ordering and timing', () => {
    const lectures = [
      {
        id: 3,
        timeBlock: null,
      },
      {
        id: 2,
        timeBlock: {
          block_date:
            '2026-07-30',
          start_time:
            '11:00:00',
        },
      },
      {
        id: 1,
        timeBlock: {
          block_date:
            '2026-07-30',
          start_time:
            '09:00:00',
        },
      },
    ]

    it('sorts lectures without mutating the original array', () => {
      const result =
        sortLectures(lectures)

      expect(
        result.map(
          (lecture) => lecture.id,
        ),
      ).toEqual([1, 2, 3])

      expect(
        lectures.map(
          (lecture) => lecture.id,
        ),
      ).toEqual([3, 2, 1])
    })

    it('builds lecture start dates and finds the next lecture', () => {
      const currentDate = new Date(
        2026,
        6,
        30,
        10,
        0,
      )

      const nextLecture =
        getNextLecture(
          lectures,
          currentDate,
        )

      expect(nextLecture?.id).toBe(2)

      expect(
        getLectureStartDate(
          lectures[1],
        ),
      ).toEqual(
        new Date(
          2026,
          6,
          30,
          11,
          0,
        ),
      )

      expect(
        getLectureStartDate({
          timeBlock: {},
        }),
      ).toBeNull()
    })

    it('identifies past lectures', () => {
      const lecture = {
        timeBlock: {
          block_date:
            '2026-07-30',
          start_time:
            '09:00:00',
        },
      }

      expect(
        isPastLecture(
          lecture,
          new Date(
            2026,
            6,
            30,
            10,
          ),
        ),
      ).toBe(true)

      expect(
        isPastLecture(
          lecture,
          new Date(
            2026,
            6,
            30,
            8,
          ),
        ),
      ).toBe(false)
    })
  })
})