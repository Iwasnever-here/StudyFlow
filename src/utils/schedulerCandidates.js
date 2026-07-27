import {
  addDays,
  formatDate,
  timeToMinutes,
} from './datetime'

import {
  SCHEDULER_CONFIG,
} from './schedulerScoring'

const getBlockTiming = (
  block,
) => {
  const timeBlock =
    block?.timeBlock || block

  if (
    !timeBlock?.block_date ||
    !timeBlock?.start_time ||
    !timeBlock?.end_time
  ) {
    return null
  }

  const start =
    timeToMinutes(
      timeBlock.start_time,
    )

  const end =
    timeToMinutes(
      timeBlock.end_time,
    )

  if (
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    end <= start
  ) {
    return null
  }

  return {
    date:
      timeBlock.block_date,

    start,

    end,
  }
}

const getBlockedRanges = (
  blocks,
  dateString,
) => {
  return (blocks || [])
    .map(getBlockTiming)
    .filter(
      (range) =>
        range &&
        range.date ===
          dateString,
    )
    .map((range) => ({
      start:
        range.start,

      end:
        range.end,
    }))
}

const addBreak = (
  ranges,
  start,
  end,
) => {
  if (
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    end <= start
  ) {
    return ranges
  }

  return [
    ...ranges,
    {
      start,
      end,
    },
  ]
}

const addFixedBreaks = (
  ranges,
) => {
  let result = [...ranges]

  result = addBreak(
    result,
    SCHEDULER_CONFIG
      .lunchStartMinutes,
    SCHEDULER_CONFIG
      .lunchEndMinutes,
  )

  result = addBreak(
    result,
    SCHEDULER_CONFIG
      .dinnerStartMinutes,
    SCHEDULER_CONFIG
      .dinnerEndMinutes,
  )

  return result
}

const mergeRanges = (
  ranges,
) => {
  const sortedRanges =
    [...ranges].sort(
      (first, second) =>
        first.start -
        second.start,
    )

  return sortedRanges.reduce(
    (
      merged,
      currentRange,
    ) => {
      const previousRange =
        merged[
          merged.length - 1
        ]

      if (!previousRange) {
        merged.push({
          ...currentRange,
        })

        return merged
      }

      if (
        currentRange.start <=
        previousRange.end
      ) {
        previousRange.end =
          Math.max(
            previousRange.end,
            currentRange.end,
          )

        return merged
      }

      merged.push({
        ...currentRange,
      })

      return merged
    },
    [],
  )
}

const rangesOverlap = ({
  start,
  end,
  blockedStart,
  blockedEnd,
}) => {
  return (
    start < blockedEnd &&
    end > blockedStart
  )
}

const findCollision = ({
  start,
  end,
  blockedRanges,
}) => {
  return (
    blockedRanges.find(
      (blockedRange) =>
        rangesOverlap({
          start,
          end,

          blockedStart:
            blockedRange.start,

          blockedEnd:
            blockedRange.end,
        }),
    ) || null
  )
}

const findNextFreeStart = ({
  initialStart,
  minimumDuration,
  blockedRanges,
  dayEnd,
}) => {
  let candidateStart =
    initialStart

  while (
    candidateStart +
      minimumDuration <=
    dayEnd
  ) {
    const candidateEnd =
      candidateStart +
      minimumDuration

    const collision =
      findCollision({
        start:
          candidateStart,

        end:
          candidateEnd,

        blockedRanges,
      })

    if (!collision) {
      return candidateStart
    }

    candidateStart =
      collision.end
  }

  return null
}

const getAvailableMinutes = ({
  start,
  blockedRanges,
  dayEnd,
}) => {
  const nextRange =
    blockedRanges.find(
      (range) =>
        range.start >= start,
    )

  const availableUntil =
    nextRange
      ? Math.min(
          nextRange.start,
          dayEnd,
        )
      : dayEnd

  return Math.max(
    0,
    availableUntil - start,
  )
}

const getMinimumSessionMinutes =
  () => {
    const configuredMinimum =
      Number(
        SCHEDULER_CONFIG
          .minimumSessionMinutes,
      )

    if (
      Number.isFinite(
        configuredMinimum,
      ) &&
      configuredMinimum > 0
    ) {
      return configuredMinimum
    }

    return 60
  }

const getMaximumSessionMinutes =
  () => {
    const configuredMaximum =
      Number(
        SCHEDULER_CONFIG
          .maximumSessionMinutes,
      )

    if (
      Number.isFinite(
        configuredMaximum,
      ) &&
      configuredMaximum > 0
    ) {
      return configuredMaximum
    }

    return 120
  }

const getDayStartMinutes =
  () => {
    const configuredStart =
      Number(
        SCHEDULER_CONFIG
          .dayStartMinutes,
      )

    if (
      Number.isFinite(
        configuredStart,
      )
    ) {
      return configuredStart
    }

    return 7 * 60
  }

const getDayEndMinutes =
  () => {
    const configuredEnd =
      Number(
        SCHEDULER_CONFIG
          .dayEndMinutes,
      )

    if (
      Number.isFinite(
        configuredEnd,
      )
    ) {
      return configuredEnd
    }

    return 22 * 60
  }

const getCandidateStepMinutes =
  () => {
    const configuredStep =
      Number(
        SCHEDULER_CONFIG
          .candidateStepMinutes,
      )

    if (
      Number.isFinite(
        configuredStep,
      ) &&
      configuredStep > 0
    ) {
      return configuredStep
    }

    return 15
  }

const getTodayStartMinutes = (
  dateString,
  todayString,
) => {
  const dayStart =
    getDayStartMinutes()

  if (
    dateString !== todayString
  ) {
    return dayStart
  }

  const now =
    new Date()

  const currentMinutes =
    now.getHours() * 60 +
    now.getMinutes()

  const step =
    getCandidateStepMinutes()

  const roundedCurrentMinutes =
    Math.ceil(
      currentMinutes / step,
    ) * step

  return Math.max(
    dayStart,
    roundedCurrentMinutes,
  )
}

const createCandidate = ({
  date,
  startMinutes,
  duration,
}) => {
  return {
    date,

    startMinutes,

    endMinutes:
      startMinutes +
      duration,

    duration,
  }
}

export const getScheduleCandidates = ({
  assignment,
  remainingMinutes,
  blocks = [],
  todayString,
}) => {
  if (
    !assignment?.due_date ||
    !todayString
  ) {
    return []
  }

  const numericRemaining =
    Number(
      remainingMinutes,
    )

  if (
    !Number.isFinite(
      numericRemaining,
    ) ||
    numericRemaining <= 0
  ) {
    return []
  }

  const minimumDuration =
    getMinimumSessionMinutes()

  const maximumDuration =
    Math.max(
      minimumDuration,
      getMaximumSessionMinutes(),
    )

  const dayEnd =
    getDayEndMinutes()

  const desiredDuration =
    Math.min(
      Math.max(
        numericRemaining,
        minimumDuration,
      ),
      maximumDuration,
    )

  const firstDate =
    new Date(
      `${todayString}T00:00:00`,
    )

  const dueDate =
    new Date(
      `${assignment.due_date}T23:59:59`,
    )

  if (
    Number.isNaN(
      firstDate.getTime(),
    ) ||
    Number.isNaN(
      dueDate.getTime(),
    )
  ) {
    return []
  }

  const candidates = []

  let currentDate =
    new Date(firstDate)

  while (
    currentDate <= dueDate
  ) {
    const dateString =
      formatDate(
        currentDate,
      )

    const blockedRanges =
      mergeRanges(
        addFixedBreaks(
          getBlockedRanges(
            blocks,
            dateString,
          ),
        ),
      )

    let searchStart =
      getTodayStartMinutes(
        dateString,
        todayString,
      )

    while (
      searchStart +
        minimumDuration <=
      dayEnd
    ) {
      const candidateStart =
        findNextFreeStart({
          initialStart:
            searchStart,

          minimumDuration,

          blockedRanges,

          dayEnd,
        })

      if (
        candidateStart === null
      ) {
        break
      }

      const availableMinutes =
        getAvailableMinutes({
          start:
            candidateStart,

          blockedRanges,

          dayEnd,
        })

      const duration =
        Math.min(
          desiredDuration,
          availableMinutes,
        )

      if (
        duration >=
        minimumDuration
      ) {
        const candidateEnd =
          candidateStart +
          duration

        const collision =
          findCollision({
            start:
              candidateStart,

            end:
              candidateEnd,

            blockedRanges,
          })

        if (!collision) {
          candidates.push(
            createCandidate({
              date:
                dateString,

              startMinutes:
                candidateStart,

              duration,
            }),
          )
        }
      }

      searchStart =
        candidateStart +
        getCandidateStepMinutes()
    }

    currentDate =
      addDays(
        currentDate,
        1,
      )
  }

  return candidates
}

export const findBestCandidate = ({
  assignment,
  remainingMinutes,
  blocks = [],
  todayString,
}) => {
  const candidates =
    getScheduleCandidates({
      assignment,
      remainingMinutes,
      blocks,
      todayString,
    })

  return candidates[0] || null
}