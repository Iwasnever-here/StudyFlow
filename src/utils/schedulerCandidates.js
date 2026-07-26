import {
  addDays,
  formatDate,
  timeToMinutes,
} from './datetime'
import {
  SCHEDULER_CONFIG,
  getCandidateScore,
  getScheduledMinutes,
} from './schedulerScoring'

const sameId = (
  firstId,
  secondId,
) =>
  String(firstId) ===
  String(secondId)

const getBlockedRanges = (
  blocks,
  dateString,
) => {
  return blocks
    .filter(
      (block) =>
        block &&
        block.block_date ===
          dateString &&
        block.start_time &&
        block.end_time,
    )
    .map((block) => ({
      start: timeToMinutes(
        block.start_time,
      ),
      end: timeToMinutes(
        block.end_time,
      ),
    }))
    .filter(
      (range) =>
        Number.isFinite(
          range.start,
        ) &&
        Number.isFinite(
          range.end,
        ) &&
        range.end > range.start,
    )
}

const addFixedBreaks = (
  ranges,
) => {
  return [
    ...ranges,
    {
      start:
        SCHEDULER_CONFIG
          .lunchStartMinutes,
      end:
        SCHEDULER_CONFIG
          .lunchEndMinutes,
    },
    {
      start:
        SCHEDULER_CONFIG
          .dinnerStartMinutes,
      end:
        SCHEDULER_CONFIG
          .dinnerEndMinutes,
    },
  ]
}

const findFreeRanges = (
  blockedRanges,
) => {
  const sorted = [
    ...blockedRanges,
  ].sort(
    (first, second) =>
      first.start - second.start,
  )

  const freeRanges = []
  let cursor =
    SCHEDULER_CONFIG
      .dayStartMinutes

  sorted.forEach((range) => {
    if (
      range.end <= cursor ||
      range.start >=
        SCHEDULER_CONFIG
          .dayEndMinutes
    ) {
      return
    }

    const rangeStart = Math.max(
      range.start,
      SCHEDULER_CONFIG
        .dayStartMinutes,
    )

    const rangeEnd = Math.min(
      range.end,
      SCHEDULER_CONFIG
        .dayEndMinutes,
    )

    if (
      rangeStart -
        cursor >=
      SCHEDULER_CONFIG
        .minimumSessionMinutes
    ) {
      freeRanges.push({
        start: cursor,
        end: rangeStart,
      })
    }

    cursor = Math.max(
      cursor,
      rangeEnd,
    )
  })

  if (
    SCHEDULER_CONFIG
      .dayEndMinutes -
      cursor >=
    SCHEDULER_CONFIG
      .minimumSessionMinutes
  ) {
    freeRanges.push({
      start: cursor,
      end:
        SCHEDULER_CONFIG
          .dayEndMinutes,
    })
  }

  return freeRanges
}

const buildCandidatesForDate = ({
  dateString,
  blocks,
  remainingMinutes,
}) => {
  const blockedRanges =
    addFixedBreaks(
      getBlockedRanges(
        blocks,
        dateString,
      ),
    )

  const freeRanges =
    findFreeRanges(
      blockedRanges,
    )

  return freeRanges
    .map((range) => {
      const available =
        range.end - range.start

      const duration = Math.min(
        remainingMinutes,
        SCHEDULER_CONFIG
          .maximumSessionMinutes,
        available,
      )

      if (
        duration <
        SCHEDULER_CONFIG
          .minimumSessionMinutes
      ) {
        return null
      }

      return {
        date: dateString,
        startMinutes: range.start,
        endMinutes:
          range.start + duration,
        duration,
      }
    })
    .filter(Boolean)
}

const getDailyScheduledMinutes = (
  blocks,
  dateString,
) => {
  return blocks
    .filter(
      (block) =>
        block?.block_date ===
          dateString &&
        block?.auto_generated,
    )
    .reduce(
      (total, block) =>
        total +
        getScheduledMinutes(block),
      0,
    )
}

const getAssignmentDailyMinutes = (
  blocks,
  assignmentId,
  dateString,
) => {
  return blocks
    .filter(
      (block) =>
        block?.block_date ===
          dateString &&
        sameId(
          block?.coursework_id,
          assignmentId,
        ),
    )
    .reduce(
      (total, block) =>
        total +
        getScheduledMinutes(block),
      0,
    )
}

export const findBestCandidate = ({
  assignment,
  remainingMinutes,
  blocks,
  todayString,
}) => {
  const candidates = []

  const startDate = new Date(
    `${todayString}T00:00:00`,
  )

  const latestDate = new Date(
    `${assignment.due_date}T00:00:00`,
  )

  for (
    let index = 0;
    index <
    SCHEDULER_CONFIG.planningDays;
    index += 1
  ) {
    const date = addDays(
      startDate,
      index,
    )

    if (date >= latestDate) {
      break
    }

    const dateString =
      formatDate(date)

    const dailyMinutes =
      getDailyScheduledMinutes(
        blocks,
        dateString,
      )

    if (
      dailyMinutes >=
      SCHEDULER_CONFIG
        .maximumDailyStudyMinutes
    ) {
      continue
    }

    const assignmentMinutes =
      getAssignmentDailyMinutes(
        blocks,
        assignment.id,
        dateString,
      )

    if (
      assignmentMinutes >=
      SCHEDULER_CONFIG
        .maximumAssignmentMinutesPerDay
    ) {
      continue
    }

    const dateCandidates =
      buildCandidatesForDate({
        dateString,
        blocks,
        remainingMinutes,
      })

    dateCandidates.forEach(
      (candidate) => {
        const dailyCapacity =
          SCHEDULER_CONFIG
            .maximumDailyStudyMinutes -
          dailyMinutes

        const assignmentCapacity =
          SCHEDULER_CONFIG
            .maximumAssignmentMinutesPerDay -
          assignmentMinutes

        const duration = Math.min(
          candidate.duration,
          dailyCapacity,
          assignmentCapacity,
          remainingMinutes,
        )

        if (
          duration <
          SCHEDULER_CONFIG
            .minimumSessionMinutes
        ) {
          return
        }

        candidates.push({
          ...candidate,
          duration,
          endMinutes:
            candidate.startMinutes +
            duration,
          score:
            getCandidateScore({
              candidate: {
                ...candidate,
                duration,
              },
              assignment,
              remainingMinutes,
              scheduledMinutesForDay:
                dailyMinutes,
              scheduledMinutesForAssignmentDay:
                assignmentMinutes,
              todayString,
            }),
        })
      },
    )
  }

  return candidates.sort(
    (first, second) => {
      if (
        second.score !==
        first.score
      ) {
        return (
          second.score -
          first.score
        )
      }

      if (
        first.date !==
        second.date
      ) {
        return first.date.localeCompare(
          second.date,
        )
      }

      return (
        first.startMinutes -
        second.startMinutes
      )
    },
  )[0]
}
