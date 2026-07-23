import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { supabase } from '../lib/supabaseClient'
import useClasses from './useClasses'

const useClassDetails = (classId) => {
  const [classItem, setClassItem] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const {
    fetchClassById,
    updateClass,
  } = useClasses({
    fetchOnMount: false,
  })

  const fetchDetails = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [
        fetchedClass,
        assignmentsResult,
      ] = await Promise.all([
        fetchClassById(classId),

        supabase
          .from('assignments')
          .select('*')
          .eq('class_id', classId)
          .order('due_date', {
            ascending: true,
          }),
      ])

      if (assignmentsResult.error) {
        throw assignmentsResult.error
      }

      setClassItem(fetchedClass)
      setAssignments(
        assignmentsResult.data || [],
      )
    } catch (fetchError) {
      setClassItem(null)
      setAssignments([])
      setError(
        fetchError.message ||
          'Failed to load class.',
      )
    } finally {
      setLoading(false)
    }
  }, [classId, fetchClassById])

  useEffect(() => {
    fetchDetails()
  }, [fetchDetails])

  const completedAssignments = useMemo(
    () =>
      assignments.filter(
        (assignment) =>
          assignment.status === 'completed',
      ),
    [assignments],
  )

  const remainingAssignments = useMemo(
    () =>
      assignments.filter(
        (assignment) =>
          assignment.status !== 'completed',
      ),
    [assignments],
  )

  const currentGrade = useMemo(() => {
    const gradedAssignments =
      assignments.filter(
        (assignment) =>
          assignment.grade !== null &&
          assignment.grade !== '' &&
          assignment.weight !== null &&
          assignment.weight !== '',
      )

    if (!gradedAssignments.length) {
      return null
    }

    const weightedScore =
      gradedAssignments.reduce(
        (total, assignment) =>
          total +
          Number(assignment.grade) *
            (Number(assignment.weight) / 100),
        0,
      )

    const completedWeight =
      gradedAssignments.reduce(
        (total, assignment) =>
          total + Number(assignment.weight),
        0,
      )

    if (!completedWeight) {
      return null
    }

    return (
      weightedScore /
      (completedWeight / 100)
    )
  }, [assignments])

  const editClass = async (formData) => {
    const updatedClass = await updateClass(
      classId,
      formData,
    )

    setClassItem(updatedClass)
    return updatedClass
  }

  return {
    classItem,
    assignments,
    completedAssignments,
    remainingAssignments,
    currentGrade,
    loading,
    error,
    editClass,
    refresh: fetchDetails,
  }
}

export default useClassDetails