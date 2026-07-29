import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import {
  addDays,
  daysBetween,
  formatDate,
  formatDayHeading,
  formatMonthHeading,
  formatTime,
  getNowMinutes,
  getWeekDays,
  isSameDate,
  minutesToTime,
  normaliseTime,
  parseDate,
  rangesOverlap,
  startOfWeek,
  timeToMinutes,
} from '../datetime'

describe('datetime', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  describe('time helpers', () => {
    it('normalises and formats time strings', () => {
      expect(
        normaliseTime('09:30'),
      ).toBe('09:30:00')

      expect(
        normaliseTime('09:30:15'),
      ).toBe('09:30:15')

      expect(
        normaliseTime(),
      ).toBe('')

      expect(
        formatTime('14:45:00'),
      ).toBe('14:45')

      expect(
        formatTime(null),
      ).toBe('')
    })

    it('converts between minutes and time strings', () => {
      expect(
        timeToMinutes('09:30'),
      ).toBe(570)

      expect(
        timeToMinutes('18:45:00'),
      ).toBe(1125)

      expect(
        minutesToTime(570),
      ).toBe('09:30:00')

      expect(
        minutesToTime(1125),
      ).toBe('18:45:00')
    })

    it('rounds minutes and prevents negative time values', () => {
      expect(
        minutesToTime(90.6),
      ).toBe('01:31:00')

      expect(
        minutesToTime(-30),
      ).toBe('00:00:00')
    })
  })

  describe('date helpers', () => {
    it('formats and parses local dates', () => {
      const date = new Date(
        2026,
        6,
        9,
      )

      expect(
        formatDate(date),
      ).toBe('2026-07-09')

      const parsedDate =
        parseDate('2026-07-09')

      expect(
        parsedDate.getFullYear(),
      ).toBe(2026)

      expect(
        parsedDate.getMonth(),
      ).toBe(6)

      expect(
        parsedDate.getDate(),
      ).toBe(9)
    })

    it('adds days without changing the original date', () => {
      const original = new Date(
        2026,
        6,
        29,
      )

      const result = addDays(
        original,
        3,
      )

      expect(
        formatDate(result),
      ).toBe('2026-08-01')

      expect(
        formatDate(original),
      ).toBe('2026-07-29')
    })

    it('finds the Monday and seven days of the current week', () => {
      const anchorDate = new Date(
        2026,
        6,
        29,
      )

      const monday =
        startOfWeek(anchorDate)

      expect(
        formatDate(monday),
      ).toBe('2026-07-27')

      const weekDays =
        getWeekDays(anchorDate)

      expect(
        weekDays.map(formatDate),
      ).toEqual([
        '2026-07-27',
        '2026-07-28',
        '2026-07-29',
        '2026-07-30',
        '2026-07-31',
        '2026-08-01',
        '2026-08-02',
      ])
    })

    it('calculates the number of days between dates', () => {
      expect(
        daysBetween(
          '2026-07-29',
          '2026-08-03',
        ),
      ).toBe(5)

      expect(
        daysBetween(
          '2026-08-03',
          '2026-07-29',
        ),
      ).toBe(-5)
    })

    it('compares dates without considering their time', () => {
      const morning = new Date(
        2026,
        6,
        29,
        9,
        0,
      )

      const evening = new Date(
        2026,
        6,
        29,
        18,
        30,
      )

      const nextDay = new Date(
        2026,
        6,
        30,
      )

      expect(
        isSameDate(
          morning,
          evening,
        ),
      ).toBe(true)

      expect(
        isSameDate(
          morning,
          nextDay,
        ),
      ).toBe(false)
    })
  })

  describe('display formatting', () => {
    it('formats day and month headings using en-GB', () => {
      const date = new Date(
        2026,
        6,
        29,
      )

      expect(
        formatDayHeading(date),
      ).toBe('Wed 29')

      expect(
        formatMonthHeading(date),
      ).toBe('July 2026')
    })

    it('returns the current time as minutes after midnight', () => {
      vi.useFakeTimers()

      vi.setSystemTime(
        new Date(
          2026,
          6,
          29,
          15,
          49,
        ),
      )

      expect(
        getNowMinutes(),
      ).toBe(949)
    })
  })

  describe('rangesOverlap', () => {
    it('detects overlapping ranges but allows touching ranges', () => {
      expect(
        rangesOverlap(
          540,
          600,
          570,
          630,
        ),
      ).toBe(true)

      expect(
        rangesOverlap(
          540,
          600,
          600,
          660,
        ),
      ).toBe(false)

      expect(
        rangesOverlap(
          540,
          600,
          610,
          660,
        ),
      ).toBe(false)
    })
  })
})