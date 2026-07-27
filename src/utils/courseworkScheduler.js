import {
  minutesToTime,
} from './datetime'

import {
  getScheduledMinutes,
  getTodayString,
  sortAssignmentsForScheduling,
} from './schedulerScoring'

import {
  findBestCandidate,
} from './schedulerCandidates'

const sameId = (
  firstId,
  secondId,
) =>
  String(firstId) ===
  String(secondId)

const normaliseText = (
  value,
) =>
  String(value || '')
    .trim()
    .toLowerCase()

const isCompleted = (
  assignment,
) =>
  normaliseText(
    assignment?.status,
  ) === 'completed'

const isGeneratedCourseworkBlock = (
  block,
) => {
  return (
    block?.auto_generated ===
      true &&
    normaliseText(
      block?.block_type,
    ) === 'coursework'
  )
}

const getFixedExistingBlocks = (
  blocks = [],
) => {
  /*
   * Remove only old generated
   * coursework sessions.
   *
   * Keep:
   * - generated lectures
   * - manual coursework
   * - personal events
   * - any other timetable events
   */
  return blocks.filter(
    (block) =>
      block &&
      !isGeneratedCourseworkBlock(
        block,
      ),
  )
}

const getEstimatedMinutes = (
  assignment,
) => {
  const hours = Number(
    assignment?.hours || 0,
  )

  if (
    !Number.isFinite(hours) ||
    hours <= 0
  ) {
    return 0
  }

  return Math.round(
    hours * 60,
  )
}

const getManualScheduledMinutes = ({
  assignment,
  existingBlocks,
}) => {
  return existingBlocks
    .filter(
      (block) =>
        block &&
        sameId(
          block.coursework_id,
          assignment.id,
        ) &&
        !block.auto_generated,
    )
    .reduce(
      (total, block) =>
        total +
        getScheduledMinutes(
          block,
        ),
      0,
    )
}

const getRequiredMinutes = (
  assignment,
  existingBlocks,
) => {
  const estimatedMinutes =
    getEstimatedMinutes(
      assignment,
    )

  const manuallyScheduledMinutes =
    getManualScheduledMinutes({
      assignment,
      existingBlocks,
    })

  return Math.max(
    0,
    estimatedMinutes -
      manuallyScheduledMinutes,
  )
}

const createGeneratedBlock = ({
  assignment,
  candidate,
  userId,
}) => {
  return {
    user_id:
      userId,

    class_id:
      assignment.class_id ||
      null,

    coursework_id:
      assignment.id,

    lecture_id:
      null,

    title:
      `Study: ${assignment.title}`,

    block_date:
      candidate.date,

    start_time:
      minutesToTime(
        candidate.startMinutes,
      ),

    end_time:
      minutesToTime(
        candidate.endMinutes,
      ),

    block_type:
      'Coursework',

    is_recurring:
      false,

    recurrence_type:
      'none',

    recurrence_end_date:
      null,

    auto_generated:
      true,

    completed:
      false,
  }
}

export const buildCourseworkSchedule = ({
  assignments = [],
  existingBlocks = [],
  userId,
}) => {
  const todayString =
    getTodayString()

  /*
   * These blocks permanently occupy
   * timetable space during this rebuild.
   *
   * Auto-generated lectures remain here.
   * Only old generated coursework is removed.
   */
  const fixedExistingBlocks =
    getFixedExistingBlocks(
      existingBlocks,
    )

  const activeAssignments =
    assignments.filter(
      (assignment) =>
        assignment &&
        !isCompleted(assignment) &&
        assignment.due_date &&
        getEstimatedMinutes(
          assignment,
        ) > 0 &&
        assignment.due_date >=
          todayString,
    )

  const remainingMinutesById =
    Object.fromEntries(
      activeAssignments.map(
        (assignment) => [
          assignment.id,

          getRequiredMinutes(
            assignment,
            existingBlocks,
          ),
        ],
      ),
    )

  const generatedBlocks = []

  const blockedAssignments =
    new Set()

  while (true) {
    const availableAssignments =
      sortAssignmentsForScheduling(
        activeAssignments.filter(
          (assignment) =>
            remainingMinutesById[
              assignment.id
            ] > 0 &&
            !blockedAssignments.has(
              assignment.id,
            ),
        ),

        remainingMinutesById,

        todayString,
      )

    const assignment =
      availableAssignments[0]

    if (!assignment) {
      break
    }

    /*
     * All fixed events plus blocks generated
     * during this rebuild are collision blockers.
     *
     * This includes lectures even when
     * auto_generated is true.
     */
    const allBlocks = [
      ...fixedExistingBlocks,
      ...generatedBlocks,
    ]

    const remainingMinutes =
      remainingMinutesById[
        assignment.id
      ]

    const candidate =
      findBestCandidate({
        assignment,
        remainingMinutes,
        blocks:
          allBlocks,
        todayString,
      })

    if (!candidate) {
      blockedAssignments.add(
        assignment.id,
      )

      continue
    }

    const duration =
      Number(
        candidate.duration,
      )

    if (
      !Number.isFinite(duration) ||
      duration <= 0
    ) {
      blockedAssignments.add(
        assignment.id,
      )

      continue
    }

    const generatedBlock =
      createGeneratedBlock({
        assignment,
        candidate,
        userId,
      })

    generatedBlocks.push(
      generatedBlock,
    )

    /*
     * A final session may be longer than
     * the remaining estimate.
     *
     * Example:
     * remaining = 30
     * duration = 60
     * result = 0
     */
    remainingMinutesById[
      assignment.id
    ] = Math.max(
      0,
      remainingMinutes -
        duration,
    )
  }

  const unscheduledAssignments =
    activeAssignments
      .filter(
        (assignment) =>
          remainingMinutesById[
            assignment.id
          ] > 0,
      )
      .map(
        (assignment) => ({
          id:
            assignment.id,

          title:
            assignment.title,

          remainingMinutes:
            remainingMinutesById[
              assignment.id
            ],
        }),
      )

  return {
    generatedBlocks,
    remainingMinutesById,
    unscheduledAssignments,
  }
}

export const getCourseworkScheduleSummary = ({
  assignments = [],
  blocks = [],
}) => {
  const todayString =
    getTodayString()

  return Object.fromEntries(
    assignments
      .filter(Boolean)
      .map((assignment) => {
        const assignmentBlocks =
          blocks
            .filter(
              (block) =>
                block &&
                sameId(
                  block.coursework_id,
                  assignment.id,
                ) &&
                block.block_date &&
                block.start_time &&
                block.end_time,
            )
            .sort(
              (
                first,
                second,
              ) =>
                `${first.block_date}${first.start_time}`.localeCompare(
                  `${second.block_date}${second.start_time}`,
                ),
            )

        const scheduledMinutes =
          assignmentBlocks.reduce(
            (
              total,
              block,
            ) =>
              total +
              getScheduledMinutes(
                block,
              ),
            0,
          )

        const estimatedMinutes =
          getEstimatedMinutes(
            assignment,
          )

        const nextSession =
          assignmentBlocks.find(
            (block) =>
              block.block_date >=
              todayString,
          ) || null

        return [
          assignment.id,

          {
            scheduledMinutes,
            estimatedMinutes,

            remainingMinutes:
              Math.max(
                0,
                estimatedMinutes -
                  scheduledMinutes,
              ),

            nextSession,

            sessionCount:
              assignmentBlocks.length,

            fullyScheduled:
              estimatedMinutes >
                0 &&
              scheduledMinutes >=
                estimatedMinutes,

            overScheduledMinutes:
              Math.max(
                0,
                scheduledMinutes -
                  estimatedMinutes,
              ),
          },
        ]
      }),
  )
}