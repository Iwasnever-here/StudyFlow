import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import {
  formatDashboardDate,
  formatDeadline,
  formatTime,
  getClassForItem,
  getClassMap,
  getGreeting,
  getLocalDateString,
  timeToMinutes,
} from '../dashboardUtils'

describe('dashboardUtils', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  describe('getLocalDateString', () => {
    it('returns a date in YYYY-MM-DD format', () => {
      const date = new Date(
        2026,
        6,
        9,
      )

      expect(
        getLocalDateString(date),
      ).toBe('2026-07-09')
    })
  })

  describe('time helpers', () => {
    it('converts a time string to minutes', () => {
      expect(
        timeToMinutes('09:30'),
      ).toBe(570)

      expect(
        timeToMinutes('18:45:00'),
      ).toBe(1125)
    })

    it('returns safe values when no time is provided', () => {
      expect(
        timeToMinutes(null),
      ).toBe(0)

      expect(
        formatTime(undefined),
      ).toBe('')
    })

    it('formats time using the en-GB 24-hour format', () => {
      expect(
        formatTime('09:05:00'),
      ).toBe('09:05')

      expect(
        formatTime('18:30'),
      ).toBe('18:30')
    })
  })

  describe('date formatting', () => {
    it('formats a dashboard date', () => {
      const date = new Date(
        2026,
        6,
        29,
      )

      expect(
        formatDashboardDate(date),
      ).toBe(
        'Wednesday 29 July',
      )
    })

    it('formats today, tomorrow, and future deadlines', () => {
      vi.useFakeTimers()

      vi.setSystemTime(
        new Date(
          2026,
          6,
          29,
          12,
        ),
      )

      expect(
        formatDeadline(null),
      ).toBe('No deadline')

      expect(
        formatDeadline(
          '2026-07-29',
        ),
      ).toBe('Due today')

      expect(
        formatDeadline(
          '2026-07-30',
        ),
      ).toBe('Due tomorrow')

      expect(
        formatDeadline(
          '2026-08-04',
        ),
      ).toBe('4 Aug')
    })
  })

  describe('getGreeting', () => {
    it('returns the correct greeting for the hour', () => {
      expect(
        getGreeting(8),
      ).toBe('Good morning')

      expect(
        getGreeting(12),
      ).toBe('Good afternoon')

      expect(
        getGreeting(18),
      ).toBe('Good evening')
    })
  })

  describe('class helpers', () => {
    it('creates a class map from nested class lists', () => {
      const economicsClass = {
        id: 1,
        name: 'Economics',
      }

      const mathsClass = {
        id: '2',
        name: 'Maths',
      }

      const result =
        getClassMap([
          [economicsClass],
          [
            null,
            mathsClass,
            {
              name: 'Missing ID',
            },
          ],
        ])

      expect(result).toEqual({
        1: economicsClass,
        2: mathsClass,
      })
    })

    it('finds an item class using either string or number IDs', () => {
      const economicsClass = {
        id: 1,
        name: 'Economics',
      }

      const classMap = {
        1: economicsClass,
      }

      expect(
        getClassForItem(
          {
            class_id: '1',
          },
          classMap,
        ),
      ).toBe(economicsClass)

      expect(
        getClassForItem(
          {
            class_id: 99,
          },
          classMap,
        ),
      ).toBeNull()

      expect(
        getClassForItem(
          {},
          classMap,
        ),
      ).toBeNull()
    })
  })
})