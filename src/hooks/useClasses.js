import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const CLASS_FIELDS = `
  id,
  user_id,
  name,
  code,
  lecturer,
  color,
  target_grade,
  credits
`

const sortClasses = (classes) =>
  [...classes].sort((a, b) =>
    a.name.localeCompare(b.name),
  )

const useClasses = ({ fetchOnMount = true } = {}) => {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(fetchOnMount)
  const [error, setError] = useState(null)

  const handleError = useCallback((caughtError) => {
    const message =
      caughtError?.message ||
      'Something went wrong while managing classes.'

    setError(message)
    return caughtError
  }, [])

  const getCurrentUser = useCallback(async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      throw userError
    }

    if (!user) {
      throw new Error(
        'You must be signed in to manage classes.',
      )
    }

    return user
  }, [])

  const prepareClassData = useCallback((formData) => {
    const name = formData.name?.trim()
    const code = formData.code?.trim().toUpperCase()

    if (!name) {
      throw new Error('Please enter a class name.')
    }

    if (!code) {
      throw new Error('Please enter a class code.')
    }

    const targetGrade =
      formData.target_grade === '' ||
      formData.target_grade === null ||
      formData.target_grade === undefined
        ? null
        : Number(formData.target_grade)

    const credits =
      formData.credits === '' ||
      formData.credits === null ||
      formData.credits === undefined
        ? null
        : Number(formData.credits)

    if (
      targetGrade !== null &&
      (
        Number.isNaN(targetGrade) ||
        targetGrade < 0 ||
        targetGrade > 100
      )
    ) {
      throw new Error(
        'Target grade must be between 0 and 100.',
      )
    }

    if (
      credits !== null &&
      (
        Number.isNaN(credits) ||
        credits < 0
      )
    ) {
      throw new Error(
        'Credits must be a valid non-negative number.',
      )
    }

    return {
      name,
      code,
      lecturer: formData.lecturer?.trim() || null,
      color: formData.color || '#26371f',
      target_grade: targetGrade,
      credits,
    }
  }, [])

  const fetchClasses = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } =
        await supabase
          .from('classes')
          .select(CLASS_FIELDS)
          .order('name', { ascending: true })

      if (fetchError) {
        throw fetchError
      }

      const fetchedClasses = data || []
      setClasses(fetchedClasses)

      return fetchedClasses
    } catch (fetchError) {
      setClasses([])
      handleError(fetchError)
      throw fetchError
    } finally {
      setLoading(false)
    }
  }, [handleError])

  const fetchClassById = useCallback(
    async (classId) => {
      setError(null)

      if (!classId) {
        const idError = new Error(
          'A class ID is required.',
        )

        handleError(idError)
        throw idError
      }

      try {
        const user = await getCurrentUser()

        const {
          data,
          error: fetchError,
        } = await supabase
          .from('classes')
          .select(CLASS_FIELDS)
          .eq('id', classId)
          .eq('user_id', user.id)
          .single()

        if (fetchError) {
          throw fetchError
        }

        return data
      } catch (fetchError) {
        handleError(fetchError)
        throw fetchError
      }
    },
    [getCurrentUser, handleError],
  )

  useEffect(() => {
    if (!fetchOnMount) {
      return
    }

    fetchClasses().catch(() => {
      // Error state is already handled inside fetchClasses.
    })
  }, [fetchOnMount, fetchClasses])

  const createClass = async (formData) => {
    setError(null)

    try {
      const user = await getCurrentUser()
      const classData = prepareClassData(formData)

      const {
        data,
        error: insertError,
      } = await supabase
        .from('classes')
        .insert({
          user_id: user.id,
          ...classData,
        })
        .select(CLASS_FIELDS)
        .single()

      if (insertError) {
        throw insertError
      }

      setClasses((previousClasses) =>
        sortClasses([
          ...previousClasses,
          data,
        ]),
      )

      return data
    } catch (createError) {
      handleError(createError)
      throw createError
    }
  }

  const updateClass = async (
    classId,
    formData,
  ) => {
    setError(null)

    if (!classId) {
      const idError = new Error(
        'A class ID is required to update a class.',
      )

      handleError(idError)
      throw idError
    }

    try {
      const user = await getCurrentUser()
      const updatedValues =
        prepareClassData(formData)

      const {
        data,
        error: updateError,
      } = await supabase
        .from('classes')
        .update(updatedValues)
        .eq('id', classId)
        .eq('user_id', user.id)
        .select(CLASS_FIELDS)
        .single()

      if (updateError) {
        throw updateError
      }

      setClasses((previousClasses) =>
        sortClasses(
          previousClasses.map((classItem) =>
            classItem.id === classId
              ? data
              : classItem,
          ),
        ),
      )

      return data
    } catch (updateError) {
      handleError(updateError)
      throw updateError
    }
  }

  return {
    classes,
    loading,
    error,
    setError,
    fetchClasses,
    fetchClassById,
    createClass,
    updateClass,
  }
}

export default useClasses