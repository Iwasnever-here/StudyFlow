import {
  minutesToTime,
} from './datetime'
import {
  SCHEDULER_CONFIG,
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

const isCompleted = (
  assignment,
) =>
  String(
    assignment?.status || '',
  ).toLowerCase() ===
  'completed'

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

const getRequiredMinutes = (
  assignment,
  existingBlocks,
) => {
  const estimatedMinutes =
    getEstimatedMinutes(
      assignment,
    )

  const manuallyScheduledMinutes =
    existingBlocks
      .filter(
        (block) =>
          sameId(
            block?.coursework_id,
            assignment.id,
          ) &&
          !block?.auto_generated,
      )
      .reduce(
        (total, block) =>
          total +
          getScheduledMinutes(block),
        0,
      )

  return Math.max(
    0,
    estimatedMinutes -
      manuallyScheduledMinutes,
  )
}

export const buildCourseworkSchedule = ({
  assignments = [],
  existingBlocks = [],
  userId,
}) => {
  const todayString =
    getTodayString()

  const activeAssignments =
    assignments.filter(
      (assignment) =>
        assignment &&
        !isCompleted(assignment) &&
        assignment.due_date &&
        getEstimatedMinutes(
          assignment,
        ) > 0 &&
        assignment.due_date >
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
            ] >=
              SCHEDULER_CONFIG
                .minimumSessionMinutes &&
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

    const allBlocks = [
      ...existingBlocks.filter(
        (block) =>
          !block?.auto_generated,
      ),
      ...generatedBlocks,
    ]

    const candidate =
      findBestCandidate({
        assignment,
        remainingMinutes:
          remainingMinutesById[
            assignment.id
          ],
        blocks: allBlocks,
        todayString,
      })

    if (!candidate) {
      blockedAssignments.add(
        assignment.id,
      )
      continue
    }

    generatedBlocks.push({
      user_id: userId,
      class_id:
        assignment.class_id ||
        null,
      coursework_id:
        assignment.id,
      lecture_id: null,
      title: assignment.title,
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
      block_type: 'Coursework',
      is_recurring: false,
      recurrence_type: 'none',
      recurrence_end_date: null,
      auto_generated: true,
      completed: false,
    })

    remainingMinutesById[
      assignment.id
    ] = Math.max(
      0,
      remainingMinutesById[
        assignment.id
      ] - candidate.duration,
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
      .map((assignment) => ({
        id: assignment.id,
        title: assignment.title,
        remainingMinutes:
          remainingMinutesById[
            assignment.id
          ],
      }))

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
                block.start_time &&
                block.end_time,
            )
            .sort(
              (first, second) =>
                `${first.block_date}${first.start_time}`.localeCompare(
                  `${second.block_date}${second.start_time}`,
                ),
            )

        const scheduledMinutes =
          assignmentBlocks.reduce(
            (total, block) =>
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
              estimatedMinutes > 0 &&
              scheduledMinutes >=
                estimatedMinutes,
          },
        ]
      }),
  )
}
