import {
  daysBetween,
  formatDate,
  timeToMinutes,
} from './datetime'

export const SCHEDULER_CONFIG = {
  planningDays: 21,
  dayStartMinutes: 9 * 60,
  dayEndMinutes: 21 * 60,
  lunchStartMinutes: 12 * 60,
  lunchEndMinutes: 13 * 60,
  dinnerStartMinutes: 17 * 60 + 30,
  dinnerEndMinutes: 18 * 60 + 30,
  minimumSessionMinutes: 30,
  preferredSessionMinutes: 60,
  maximumSessionMinutes: 90,
  breakMinutes: 20,
  maximumDailyStudyMinutes: 360,
  maximumAssignmentMinutesPerDay: 240,
}

export const getAssignmentUrgency = (
  assignment,
  todayString,
) => {
  const daysUntilDue = Math.max(
    0,
    daysBetween(
      todayString,
      assignment.due_date,
    ),
  )

  if (daysUntilDue === 0) return 120
  if (daysUntilDue === 1) return 100
  if (daysUntilDue <= 3) return 80
  if (daysUntilDue <= 7) return 55
  if (daysUntilDue <= 14) return 30

  return 15
}

export const getAssignmentPriority = (
  assignment,
  remainingMinutes,
  todayString,
) => {
  const urgency =
    getAssignmentUrgency(
      assignment,
      todayString,
    )

  const workload =
    Math.min(
      50,
      remainingMinutes / 30,
    )

  return urgency + workload
}

export const getCandidateScore = ({
  candidate,
  assignment,
  remainingMinutes,
  scheduledMinutesForDay,
  scheduledMinutesForAssignmentDay,
  todayString,
}) => {
  const daysFromToday = Math.max(
    0,
    daysBetween(
      todayString,
      candidate.date,
    ),
  )

  const daysUntilDue = Math.max(
    0,
    daysBetween(
      candidate.date,
      assignment.due_date,
    ),
  )

  const urgency =
    getAssignmentUrgency(
      assignment,
      todayString,
    )

  const earlierDateBonus =
    Math.max(
      0,
      40 - daysFromToday * 4,
    )

  const deadlineRiskPenalty =
    daysUntilDue <= 1
      ? 30
      : daysUntilDue <= 2
        ? 15
        : 0

  const daytimeBonus =
    candidate.startMinutes >= 10 * 60 &&
    candidate.startMinutes <= 16 * 60
      ? 18
      : 0

  const sameAssignmentPenalty =
    scheduledMinutesForAssignmentDay / 10

  const dailyLoadPenalty =
    scheduledMinutesForDay / 15

  const shortSessionPenalty =
    candidate.duration <
    SCHEDULER_CONFIG.preferredSessionMinutes
      ? 8
      : 0

  const remainingWorkBonus =
    Math.min(
      25,
      remainingMinutes / 30,
    )

  return (
    urgency +
    earlierDateBonus +
    daytimeBonus +
    remainingWorkBonus -
    deadlineRiskPenalty -
    sameAssignmentPenalty -
    dailyLoadPenalty -
    shortSessionPenalty
  )
}

export const sortAssignmentsForScheduling = (
  assignments,
  remainingMinutesById,
  todayString,
) => {
  return [...assignments].sort(
    (first, second) => {
      const firstPriority =
        getAssignmentPriority(
          first,
          remainingMinutesById[
            first.id
          ] || 0,
          todayString,
        )

      const secondPriority =
        getAssignmentPriority(
          second,
          remainingMinutesById[
            second.id
          ] || 0,
          todayString,
        )

      if (
        secondPriority !==
        firstPriority
      ) {
        return (
          secondPriority -
          firstPriority
        )
      }

      return first.due_date.localeCompare(
        second.due_date,
      )
    },
  )
}

export const getScheduledMinutes = (
  block,
) => {
  if (
    !block?.start_time ||
    !block?.end_time
  ) {
    return 0
  }

  const startMinutes =
    timeToMinutes(
      block.start_time,
    )

  const endMinutes =
    timeToMinutes(
      block.end_time,
    )

  return Math.max(
    0,
    endMinutes - startMinutes,
  )
}

export const getTodayString = () =>
  formatDate(new Date())
