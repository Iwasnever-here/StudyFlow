import { useMemo } from 'react'

import { formatLocalDate } from './hookUtils'

import useTodos from './useTodos'
import useTimetable from './useTimetable'
import useCoursework from './useCoursework'
import useFlashcardSets from './useFlashcardSets'

const COMPLETED_STATUSES = [
  'completed',
  'complete',
  'submitted',
]

const getWeekRange = () => {
  const today = new Date()

  today.setHours(0, 0, 0, 0)

  const currentDay =
    today.getDay()

  const daysFromMonday =
    currentDay === 0
      ? 6
      : currentDay - 1

  const start = new Date(today)

  start.setDate(
    today.getDate() -
      daysFromMonday,
  )

  const end = new Date(start)

  end.setDate(
    start.getDate() + 6,
  )

  return {
    start:
      formatLocalDate(start),

    end:
      formatLocalDate(end),
  }
}

const isComplete = (
  assignment,
) => {
  const status = String(
    assignment?.status || '',
  ).toLowerCase()

  return COMPLETED_STATUSES.includes(
    status,
  )
}

const timeToMinutes = (
  time,
) => {
  if (!time) {
    return 0
  }

  const [hours, minutes] =
    String(time)
      .split(':')
      .map(Number)

  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes)
  ) {
    return 0
  }

  return hours * 60 + minutes
}

const getBlockMinutes = (
  block,
) => {
  const start =
    timeToMinutes(
      block.start_time,
    )

  const end =
    timeToMinutes(
      block.end_time,
    )

  return Math.max(
    0,
    end - start,
  )
}

const getAverage = (
  values,
) => {
  const validValues =
    values.filter(
      (value) =>
        Number.isFinite(value),
    )

  if (
    validValues.length === 0
  ) {
    return null
  }

  const total =
    validValues.reduce(
      (sum, value) =>
        sum + value,
      0,
    )

  return Math.round(
    total /
      validValues.length,
  )
}

const useReview = () => {
  const {
    todos,
    loading: todosLoading,
    pageError: todosError,
  } = useTodos()

  const {
    blocks,
    loading:
      timetableLoading,
    pageError:
      timetableError,
  } = useTimetable()

  const {
    coursework,
    classes,
    loading:
      courseworkLoading,
    error:
      courseworkError,
  } = useCoursework()

  const {
    flashcardSets,
    loading:
      flashcardsLoading,
    error:
      flashcardsError,
  } = useFlashcardSets()

  const reviewData =
    useMemo(() => {
      const today =
        formatLocalDate(
          new Date(),
        )

      const weekRange =
        getWeekRange()

      const completedCoursework =
        coursework.filter(
          isComplete,
        )

      const gradedCoursework =
        coursework
          .filter(
            (assignment) =>
              assignment.grade !==
                null &&
              assignment.grade !==
                undefined &&
              assignment.grade !==
                '',
          )
          .map(
            (assignment) =>
              Number(
                assignment.grade,
              ),
          )
          .filter(
            (grade) =>
              Number.isFinite(
                grade,
              ),
          )

      const totalFlashcards =
        flashcardSets.reduce(
          (total, set) =>
            total +
            (
              set.flashcards
                ?.length || 0
            ),
          0,
        )

      const weeklyBlocks =
        blocks.filter(
          (block) =>
            block.block_date >=
              weekRange.start &&
            block.block_date <=
              weekRange.end,
        )

      const scheduledMinutes =
        weeklyBlocks.reduce(
          (total, block) =>
            total +
            getBlockMinutes(
              block,
            ),
          0,
        )

      const overdueCoursework =
        coursework
          .filter(
            (assignment) =>
              !isComplete(
                assignment,
              ) &&
              assignment.due_date &&
              assignment.due_date <
                today,
          )
          .sort(
            (
              first,
              second,
            ) =>
              first.due_date.localeCompare(
                second.due_date,
              ),
          )

      const overdueTodos =
        todos
          .filter(
            (todo) =>
              todo.due_date &&
              todo.due_date <
                today &&
              !todo.completed,
          )
          .sort(
            (
              first,
              second,
            ) =>
              first.due_date.localeCompare(
                second.due_date,
              ),
          )

      const classProgress =
        classes
          .map(
            (classItem) => {
              const classCoursework =
                coursework.filter(
                  (
                    assignment,
                  ) =>
                    String(
                      assignment.class_id,
                    ) ===
                    String(
                      classItem.id,
                    ),
                )

              const classCompleted =
                classCoursework.filter(
                  isComplete,
                )

              const classGrades =
                classCoursework
                  .filter(
                    (assignment) =>
                      assignment.grade !==
                        null &&
                      assignment.grade !==
                        undefined &&
                      assignment.grade !==
                        '',
                  )
                  .map(
                    (
                      assignment,
                    ) =>
                      Number(
                        assignment.grade,
                      ),
                  )
                  .filter(
                    (grade) =>
                      Number.isFinite(
                        grade,
                      ),
                  )

              const classFlashcards =
                flashcardSets
                  .filter(
                    (set) =>
                      String(
                        set.class_id,
                      ) ===
                      String(
                        classItem.id,
                      ),
                  )
                  .reduce(
                    (
                      total,
                      set,
                    ) =>
                      total +
                      (
                        set.flashcards
                          ?.length ||
                        0
                      ),
                    0,
                  )

              const remainingHours =
                classCoursework
                  .filter(
                    (
                      assignment,
                    ) =>
                      !isComplete(
                        assignment,
                      ),
                  )
                  .reduce(
                    (
                      total,
                      assignment,
                    ) =>
                      total +
                      (
                        Number(
                          assignment.hours,
                        ) || 0
                      ),
                    0,
                  )

              const progress =
                classCoursework.length >
                0
                  ? Math.round(
                      (
                        classCompleted.length /
                        classCoursework.length
                      ) * 100,
                    )
                  : 0

              return {
                ...classItem,

                courseworkCount:
                  classCoursework.length,

                completedCount:
                  classCompleted.length,

                progress,

                averageGrade:
                  getAverage(
                    classGrades,
                  ),

                flashcardCount:
                  classFlashcards,

                remainingHours:
                  Math.round(
                    remainingHours *
                      10,
                  ) / 10,
              }
            },
          )
          .sort(
            (
              first,
              second,
            ) =>
              second.progress -
              first.progress,
          )

      const courseworkProgress =
        coursework.length > 0
          ? Math.round(
              (
                completedCoursework.length /
                coursework.length
              ) * 100,
            )
          : 0

      return {
        summary: {
          courseworkProgress,

          completedCoursework:
            completedCoursework.length,

          totalCoursework:
            coursework.length,

          averageGrade:
            getAverage(
              gradedCoursework,
            ),

          activeTodos:
            todos.filter(
              (todo) =>
                !todo.completed,
            ).length,

          totalFlashcards,

          scheduledHours:
            Math.round(
              (
                scheduledMinutes /
                60
              ) * 10,
            ) / 10,
        },

        classProgress,
        overdueCoursework,
        overdueTodos,
      }
    }, [
      todos,
      blocks,
      coursework,
      classes,
      flashcardSets,
    ])

  return {
    ...reviewData,

    loading:
      todosLoading ||
      timetableLoading ||
      courseworkLoading ||
      flashcardsLoading,

    error:
      todosError ||
      timetableError ||
      courseworkError ||
      flashcardsError ||
      null,
  }
}

export default useReview