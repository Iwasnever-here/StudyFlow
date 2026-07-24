import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { supabase } from '../lib/supabaseClient'
import useClasses from './useClasses'
import useClassLectures from './useClassLectures'

const ASSIGNMENT_FIELDS = `
  id,
  class_id,
  title,
  status,
  due_date,
  grade,
  weight
`
const isAssignmentCompleted = (assignment) =>
  assignment.status
    ?.trim()
    .toLowerCase() === 'completed'


const useClassDetails = (classId) => {
  const [classItem, setClassItem] =
    useState(null)
  const [assignments, setAssignments] =
    useState([])
  const [flashcardCount, setFlashcardCount] =
    useState(0)
  const [detailsLoading, setDetailsLoading] =
    useState(true)
  const [detailsError, setDetailsError] =
    useState(null)

  const {
    fetchClassById,
    updateClass,
  } = useClasses({
    fetchOnMount: false,
  })

  const {
    lectures,
    nextLecture,
    completedLectures,
    upcomingLectures,
    loading: lecturesLoading,
    error: lecturesError,
    fetchLectures,
    createLecture,
    updateLecture,
    toggleLectureComplete,
    deleteLecture,
  } = useClassLectures(classId, {
    fetchOnMount: false,
  })

  const fetchDetails = useCallback(async () => {
    if (!classId) {
      setClassItem(null)
      setAssignments([])
      setFlashcardCount(0)
      setDetailsLoading(false)
      setDetailsError(
        'A class ID is required.',
      )
      return
    }

    setDetailsLoading(true)
    setDetailsError(null)

    try {
      const [
        fetchedClass,
        assignmentsResult,
        flashcardsResult,
      ] = await Promise.all([
        fetchClassById(classId),

        supabase
          .from('assignments')
          .select(ASSIGNMENT_FIELDS)
          .eq('class_id', classId)
          .order('due_date', {
            ascending: true,
            nullsFirst: false,
          }),

        supabase
          .from('flashcards')
          .select('id', {
            count: 'exact',
            head: true,
          })
          .eq('class_id', classId),

        fetchLectures(),
      ])

      if (assignmentsResult.error) {
        throw assignmentsResult.error
      }

      if (flashcardsResult.error) {
        throw flashcardsResult.error
      }

      setClassItem(fetchedClass)
      setAssignments(
        assignmentsResult.data || [],
      )
      setFlashcardCount(
        flashcardsResult.count || 0,
      )
    } catch (fetchError) {
      setClassItem(null)
      setAssignments([])
      setFlashcardCount(0)
      setDetailsError(
        fetchError?.message ||
          'Failed to load class details.',
      )
    } finally {
      setDetailsLoading(false)
    }
  }, [
    classId,
    fetchClassById,
    fetchLectures,
  ])

  useEffect(() => {
    fetchDetails()
  }, [fetchDetails])

  const editClass = useCallback(
    async (formData) => {
      const updatedClass =
        await updateClass(
          classId,
          formData,
        )

      setClassItem(updatedClass)
      return updatedClass
    },
    [classId, updateClass],
  )

const completedAssignments = useMemo(
  () =>
    assignments.filter(
      isAssignmentCompleted,
    ),
  [assignments],
)

const remainingAssignments = useMemo(
  () =>
    assignments.filter(
      (assignment) =>
        !isAssignmentCompleted(
          assignment,
        ),
    ),
  [assignments],
)

  const nextAssignment = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return (
      remainingAssignments.find(
        (assignment) => {
          if (!assignment.due_date) {
            return false
          }

          const [
            year,
            month,
            day,
          ] = assignment.due_date
            .split('-')
            .map(Number)

          const dueDate = new Date(
            year,
            month - 1,
            day,
          )

          return dueDate >= today
        },
      ) || null
    )
  }, [remainingAssignments])

  const courseworkSummary = useMemo(
    () => ({
      total: assignments.length,
      active:
        remainingAssignments.length,
      completed:
        completedAssignments.length,
      nextAssignment,
    }),
    [
      assignments.length,
      remainingAssignments.length,
      completedAssignments.length,
      nextAssignment,
    ],
  )

  const currentGrade = useMemo(() => {
    const gradedAssignments =
      assignments.filter(
        (assignment) => {
          const hasGrade =
            assignment.grade !== null &&
            assignment.grade !== ''

          const hasWeight =
            assignment.weight !== null &&
            assignment.weight !== ''

          return (
            hasGrade &&
            hasWeight &&
            Number(assignment.weight) > 0
          )
        },
      )

    if (!gradedAssignments.length) {
      return null
    }

    const weightedScore =
      gradedAssignments.reduce(
        (total, assignment) =>
          total +
          Number(assignment.grade) *
            Number(assignment.weight),
        0,
      )

    const completedWeight =
      gradedAssignments.reduce(
        (total, assignment) =>
          total +
          Number(assignment.weight),
        0,
      )

    if (!completedWeight) {
      return null
    }

    return (
      weightedScore /
      completedWeight
    )
  }, [assignments])

  const lectureProgress = useMemo(() => {
    const total = lectures.length
    const completed =
      completedLectures.length

    return {
      total,
      completed,
      remaining: total - completed,
      percentage:
        total === 0
          ? 0
          : Math.round(
              (completed / total) * 100,
            ),
    }
  }, [
    lectures.length,
    completedLectures.length,
  ])

  const refresh = useCallback(async () => {
    await fetchDetails()
  }, [fetchDetails])

  const loading =
    detailsLoading || lecturesLoading

  const error =
    detailsError || lecturesError

  return {
    classItem,

    lectures,
    nextLecture,
    completedLectures,
    upcomingLectures,
    lectureProgress,

    assignments,
    completedAssignments,
    remainingAssignments,
    courseworkSummary,
    currentGrade,

    flashcardCount,

    loading,
    error,

    editClass,
    createLecture,
    updateLecture,
    toggleLectureComplete,
    deleteLecture,

    refresh,
  }
}

export default useClassDetails