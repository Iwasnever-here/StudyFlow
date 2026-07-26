import {
  formatDate,
  rangesOverlap,
  timeToMinutes,
} from './datetime'

export const CALENDAR_START_HOUR = 8
export const CALENDAR_END_HOUR = 22
export const HOUR_HEIGHT = 72

export const BLOCK_TYPES = [
  'Lecture',
  'Coursework',
  'Study',
  'Revision',
  'Personal',
]

export const getBlockTypeLabel = (
  block,
) => {
  if (block.lecture_id) {
    return 'Lecture'
  }

  if (
    block.auto_generated &&
    block.block_type === 'Coursework'
  ) {
    return 'Auto study'
  }

  return block.block_type || 'Event'
}

export const getBlockAppearance = (
  block,
  classItem,
) => {
  const classColour =
    classItem?.color ||
    'var(--color-primary)'

  if (block.lecture_id) {
    return {
      borderColor: classColour,
      background:
        'color-mix(in srgb, var(--color-primary) 14%, var(--bg-card))',
    }
  }

  if (block.auto_generated) {
    return {
      borderColor:
        'var(--color-secondary)',
      background:
        'color-mix(in srgb, var(--color-secondary) 16%, var(--bg-card))',
    }
  }

  return {
    borderColor: classColour,
    background:
      'color-mix(in srgb, var(--bg-input) 88%, var(--color-secondary))',
  }
}

export const doesBlockOccurOnDate = (
  block,
  dateString,
) => {
  if (!block.is_recurring) {
    return (
      block.block_date === dateString
    )
  }

  const currentDate = new Date(
    `${dateString}T00:00:00`,
  )

  const startDate = new Date(
    `${block.block_date}T00:00:00`,
  )

  if (currentDate < startDate) {
    return false
  }

  if (block.recurrence_end_date) {
    const endDate = new Date(
      `${block.recurrence_end_date}T00:00:00`,
    )

    if (currentDate > endDate) {
      return false
    }
  }

  if (
    block.recurrence_type === 'daily'
  ) {
    return true
  }

  if (
    block.recurrence_type === 'weekly'
  ) {
    return (
      currentDate.getDay() ===
      startDate.getDay()
    )
  }

  if (
    block.recurrence_type === 'monthly'
  ) {
    return (
      currentDate.getDate() ===
      startDate.getDate()
    )
  }

  return false
}

export const getBlocksForDate = (
  blocks = [],
  date,
) => {
  const dateString =
    typeof date === 'string'
      ? date
      : formatDate(date)

  return (Array.isArray(blocks) ? blocks : [])
    .filter(Boolean)
    .filter((block) =>
      block.start_time &&
      block.end_time &&
      doesBlockOccurOnDate(
        block,
        dateString,
      ),
    )
    .sort(
      (first, second) =>
        timeToMinutes(
          first.start_time,
        ) -
        timeToMinutes(
          second.start_time,
        ),
    )
}

export const getBlockPosition = (
  block,
) => {
  if (
    !block ||
    !block.start_time ||
    !block.end_time
  ) {
    return {
      top: 0,
      height: 0,
      hidden: true,
    }
  }
  const calendarStart =
    CALENDAR_START_HOUR * 60

  const start =
    timeToMinutes(block.start_time)

  const end =
    timeToMinutes(block.end_time)

  const top =
    ((start - calendarStart) / 60) *
    HOUR_HEIGHT

  const height = Math.max(
    34,
    ((end - start) / 60) *
      HOUR_HEIGHT,
  )

  return {
    top: Math.max(0, top),
    height,
  }
}

export const findBlockClash = ({
  blocks,
  blockDate,
  startTime,
  endTime,
  ignoreBlockId,
}) => {
  const start =
    timeToMinutes(startTime)

  const end =
    timeToMinutes(endTime)

  if (end <= start) {
    return (
      'End time must be after start time.'
    )
  }

  const clash = blocks.find(
    (block) => {
      if (
        block.id === ignoreBlockId
      ) {
        return false
      }

      if (
        !doesBlockOccurOnDate(
          block,
          blockDate,
        )
      ) {
        return false
      }

      return rangesOverlap(
        start,
        end,
        timeToMinutes(
          block.start_time,
        ),
        timeToMinutes(
          block.end_time,
        ),
      )
    },
  )

  return clash
    ? `This overlaps with "${clash.title}".`
    : null
}

export const filterBlocks = (
  blocks,
  activeTypes,
  classId,
) => {
  return blocks.filter((block) => {
    const visibleType =
      block.lecture_id
        ? 'Lecture'
        : block.block_type

    const typeMatches =
      activeTypes.length === 0 ||
      activeTypes.includes(visibleType)

    const classMatches =
      !classId ||
      block.class_id === classId

    return (
      typeMatches && classMatches
    )
  })
}
