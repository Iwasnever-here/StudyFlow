import {
  describe,
  expect,
  it,
} from 'vitest'

import {
  filterBlocks,
  findBlockClash,
  getBlockAppearance,
  getBlockPosition,
  getBlocksForDate,
  getBlockTypeLabel,
  doesBlockOccurOnDate,
} from '../timetable'

describe('timetable', () => {
  describe('block labels and appearance', () => {
    it('returns the correct block type label', () => {
      expect(
        getBlockTypeLabel({
          lecture_id: 10,
          block_type: 'Study',
        }),
      ).toBe('Lecture')

      expect(
        getBlockTypeLabel({
          auto_generated: true,
          block_type: 'Coursework',
        }),
      ).toBe('Auto study')

      expect(
        getBlockTypeLabel({
          block_type: 'Personal',
        }),
      ).toBe('Personal')

      expect(
        getBlockTypeLabel({}),
      ).toBe('Event')
    })

    it('returns the correct appearance for each block type', () => {
      const classItem = {
        color: '#123456',
      }

      expect(
        getBlockAppearance(
          {
            lecture_id: 1,
          },
          classItem,
        ),
      ).toEqual({
        borderColor: '#123456',
        background:
          'color-mix(in srgb, var(--color-primary) 14%, var(--bg-card))',
      })

      expect(
        getBlockAppearance(
          {
            auto_generated: true,
          },
          classItem,
        ),
      ).toEqual({
        borderColor:
          'var(--color-secondary)',
        background:
          'color-mix(in srgb, var(--color-secondary) 16%, var(--bg-card))',
      })

      expect(
        getBlockAppearance({}, null),
      ).toEqual({
        borderColor:
          'var(--color-primary)',
        background:
          'color-mix(in srgb, var(--bg-input) 88%, var(--color-secondary))',
      })
    })
  })

  describe('recurring blocks', () => {
    it('checks daily, weekly, and monthly recurrence', () => {
      const baseBlock = {
        block_date: '2026-07-27',
        is_recurring: true,
      }

      expect(
        doesBlockOccurOnDate(
          {
            ...baseBlock,
            recurrence_type: 'daily',
          },
          '2026-07-30',
        ),
      ).toBe(true)

      expect(
        doesBlockOccurOnDate(
          {
            ...baseBlock,
            recurrence_type: 'weekly',
          },
          '2026-08-03',
        ),
      ).toBe(true)

      expect(
        doesBlockOccurOnDate(
          {
            ...baseBlock,
            recurrence_type: 'weekly',
          },
          '2026-08-04',
        ),
      ).toBe(false)

      expect(
        doesBlockOccurOnDate(
          {
            ...baseBlock,
            recurrence_type: 'monthly',
          },
          '2026-08-27',
        ),
      ).toBe(true)
    })

    it('respects recurrence start and end dates', () => {
      const block = {
        block_date: '2026-07-27',
        recurrence_end_date:
          '2026-08-10',
        recurrence_type: 'daily',
        is_recurring: true,
      }

      expect(
        doesBlockOccurOnDate(
          block,
          '2026-07-26',
        ),
      ).toBe(false)

      expect(
        doesBlockOccurOnDate(
          block,
          '2026-08-10',
        ),
      ).toBe(true)

      expect(
        doesBlockOccurOnDate(
          block,
          '2026-08-11',
        ),
      ).toBe(false)
    })
  })

  describe('block selection and positioning', () => {
    it('returns valid blocks for a date sorted by start time', () => {
      const blocks = [
        {
          id: 2,
          block_date: '2026-07-29',
          start_time: '11:00:00',
          end_time: '12:00:00',
          is_recurring: false,
        },
        {
          id: 1,
          block_date: '2026-07-29',
          start_time: '09:00:00',
          end_time: '10:00:00',
          is_recurring: false,
        },
        {
          id: 3,
          block_date: '2026-07-30',
          start_time: '08:00:00',
          end_time: '09:00:00',
          is_recurring: false,
        },
        {
          id: 4,
          block_date: '2026-07-29',
          start_time: '',
          end_time: '13:00:00',
          is_recurring: false,
        },
      ]

      expect(
        getBlocksForDate(
          blocks,
          '2026-07-29',
        ).map((block) => block.id),
      ).toEqual([1, 2])
    })

    it('calculates block position and minimum height', () => {
      expect(
        getBlockPosition({
          start_time: '09:00:00',
          end_time: '10:30:00',
        }),
      ).toEqual({
        top: 72,
        height: 108,
      })

      expect(
        getBlockPosition({
          start_time: '07:00:00',
          end_time: '07:15:00',
        }),
      ).toEqual({
        top: 0,
        height: 34,
      })

      expect(
        getBlockPosition(null),
      ).toEqual({
        top: 0,
        height: 0,
        hidden: true,
      })
    })
  })

  describe('clashes and filtering', () => {
    it('detects invalid times and overlapping blocks', () => {
      const blocks = [
        {
          id: 1,
          title: 'Economics lecture',
          block_date: '2026-07-29',
          start_time: '09:00:00',
          end_time: '10:00:00',
          is_recurring: false,
        },
      ]

      expect(
        findBlockClash({
          blocks,
          blockDate: '2026-07-29',
          startTime: '10:00',
          endTime: '09:00',
        }),
      ).toBe(
        'End time must be after start time.',
      )

      expect(
        findBlockClash({
          blocks,
          blockDate: '2026-07-29',
          startTime: '09:30',
          endTime: '10:30',
        }),
      ).toBe(
        'This overlaps with "Economics lecture".',
      )

      expect(
        findBlockClash({
          blocks,
          blockDate: '2026-07-29',
          startTime: '10:00',
          endTime: '11:00',
        }),
      ).toBeNull()
    })

    it('filters blocks by type and class', () => {
      const blocks = [
        {
          id: 1,
          lecture_id: 50,
          block_type: 'Study',
          class_id: 1,
        },
        {
          id: 2,
          block_type: 'Coursework',
          class_id: 1,
        },
        {
          id: 3,
          block_type: 'Personal',
          class_id: 2,
        },
      ]

      expect(
        filterBlocks(
          blocks,
          ['Lecture'],
          null,
        ).map((block) => block.id),
      ).toEqual([1])

      expect(
        filterBlocks(
          blocks,
          [],
          1,
        ).map((block) => block.id),
      ).toEqual([1, 2])

      expect(
        filterBlocks(
          blocks,
          ['Personal'],
          2,
        ).map((block) => block.id),
      ).toEqual([3])
    })
  })
})