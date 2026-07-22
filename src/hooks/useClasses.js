import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const useClasses = () => {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('classes')
        .select(`
          id,
          user_id,
          name,
          code,
          lecturer,
          color,
          target_grade,
          credits
        `)
        .order('name', { ascending: true })

      if (fetchError) {
        setError(fetchError.message)
        setClasses([])
      } else {
        setClasses(data || [])
      }

      setLoading(false)
    }

    fetchClasses()
  }, [])

  const createClass = async (formData) => {
    setError(null)

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      setError(userError.message)
      throw userError
    }

    if (!user) {
      const authError = new Error(
        'You must be signed in to add a class.'
      )

      setError(authError.message)
      throw authError
    }

    const name = formData.name.trim()
    const code = formData.code.trim().toUpperCase()

    if (!name) {
      throw new Error('Please enter a class name.')
    }

    if (!code) {
      throw new Error('Please enter a class code.')
    }

    const targetGrade =
      formData.target_grade === ''
        ? null
        : Number(formData.target_grade)

    const credits =
      formData.credits === ''
        ? null
        : Number(formData.credits)

    if (
      targetGrade !== null &&
      (targetGrade < 0 || targetGrade > 100)
    ) {
      throw new Error(
        'Target grade must be between 0 and 100.'
      )
    }

    if (credits !== null && credits < 0) {
      throw new Error('Credits cannot be negative.')
    }

    const newClass = {
      user_id: user.id,
      name,
      code,
      lecturer: formData.lecturer.trim() || null,
      color: formData.color || '#26371f',
      target_grade: targetGrade,
      credits,
    }

    const { data, error: insertError } = await supabase
      .from('classes')
      .insert(newClass)
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      throw insertError
    }

    setClasses((previousClasses) =>
      [...previousClasses, data].sort((a, b) =>
        a.name.localeCompare(b.name)
      )
    )

    return data
  }

  return {
    classes,
    loading,
    error,
    setError,
    createClass,
  }
}

export default useClasses