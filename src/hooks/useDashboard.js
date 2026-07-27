import {
  useMemo,
} from 'react'

import useTodos from './useTodos'
import useTimetable from './useTimetable'
import useCoursework from './useCoursework'
import useFlashcardSets from './useFlashcardSets'

import {
  getClassForItem,
  getClassMap,
  getLocalDateString,
  timeToMinutes,
} from '../utils/dashboardUtils'

const isCourseworkComplete = (
  assignment,
) => {
  const status = String(
    assignment?.status || '',
  ).toLowerCase()

  return [
    'completed',
    'complete',
    'submitted',
  ].includes(status)
}

const useDashboard = (
  currentDate,
) => {
  const {
    todos,
    classes: todoClasses,
    loading: todosLoading,
    pageError: todosError,
    completeTodo,
  } = useTodos()

  const {
    blocks,
    classes: timetableClasses,
    loading: timetableLoading,
    pageError: timetableError,
  } = useTimetable()

  const {
    coursework,
    classes: courseworkClasses,
    loading: courseworkLoading,
    error: courseworkError,
  } = useCoursework()

  const {
    flashcardSets,
    classes: flashcardClasses,
    loading: flashcardsLoading,
    error: flashcardsError,
  } = useFlashcardSets()

  const classMap = useMemo(
    () =>
      getClassMap([
        todoClasses,
        timetableClasses,
        courseworkClasses,
        flashcardClasses,
      ]),
    [
      todoClasses,
      timetableClasses,
      courseworkClasses,
      flashcardClasses,
    ],
  )

  const todayString =
    getLocalDateString(
      currentDate,
    )

  const currentMinutes =
    currentDate.getHours() *
      60 +
    currentDate.getMinutes()

  const todaysTodos = useMemo(
    () =>
      todos
        .filter(
          (todo) =>
            todo.due_date ===
              todayString &&
            !todo.completed,
        )
        .map((todo) => ({
          ...todo,
          classItem:
            getClassForItem(
              todo,
              classMap,
            ),
        }))
        .sort((first, second) =>
          String(
            first.title || '',
          ).localeCompare(
            String(
              second.title || '',
            ),
          ),
        ),
    [
      todos,
      classMap,
      todayString,
    ],
  )

  const remainingBlocks =
    useMemo(
      () =>
        blocks
          .filter(
            (block) =>
              block.block_date ===
                todayString &&
              timeToMinutes(
                block.end_time,
              ) >
                currentMinutes,
          )
          .map((block) => ({
            ...block,
            classItem:
              getClassForItem(
                block,
                classMap,
              ),
          }))
          .sort(
            (
              first,
              second,
            ) =>
              timeToMinutes(
                first.start_time,
              ) -
              timeToMinutes(
                second.start_time,
              ),
          ),
      [
        blocks,
        classMap,
        todayString,
        currentMinutes,
      ],
    )

  const upcomingCoursework =
    useMemo(
      () =>
        coursework
          .filter(
            (assignment) =>
              assignment.due_date &&
              assignment.due_date >=
                todayString &&
              !isCourseworkComplete(
                assignment,
              ),
          )
          .map(
            (assignment) => ({
              ...assignment,
              classItem:
                getClassForItem(
                  assignment,
                  classMap,
                ),
            }),
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
          .slice(0, 3),
      [
        coursework,
        classMap,
        todayString,
      ],
    )

  const recentFlashcardSets =
    useMemo(
      () =>
        flashcardSets
          .map((set) => ({
            ...set,
            classItem:
              getClassForItem(
                set,
                classMap,
              ),
            cardCount:
              set.flashcards?.length ||
              0,
          }))
          .slice(0, 3),
      [
        flashcardSets,
        classMap,
      ],
    )

  return {
    todaysTodos,
    remainingBlocks,
    upcomingCoursework,
    flashcardSets:
      recentFlashcardSets,
    completeTodo,

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

export default useDashboard