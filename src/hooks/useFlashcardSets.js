import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const useFlashcardSets = () => {
  const [classes, setClasses] = useState([])
  const [flashcardSets, setFlashcardSets] =
    useState([])

  const [loadingClasses, setLoadingClasses] =
    useState(true)
  const [loadingSets, setLoadingSets] =
    useState(true)

  const [error, setError] = useState(null)

  const fetchClasses = useCallback(async () => {
    setLoadingClasses(true)

    const { data, error: classesError } =
      await supabase
        .from('classes')
        .select('id, name, code, color')
        .order('name', {
          ascending: true,
        })

    if (classesError) {
      setClasses([])
      setError((currentError) =>
        currentError
          ? `${currentError} ${classesError.message}`
          : classesError.message
      )
    } else {
      setClasses(data || [])
    }

    setLoadingClasses(false)
  }, [])

  const fetchFlashcardSets =
    useCallback(async () => {
      setLoadingSets(true)

      const { data, error: setsError } =
        await supabase
          .from('flashcard_sets')
          .select(`
            id,
            class_id,
            title,
            created_at,
            flashcards (
              id
            )
          `)
          .order('created_at', {
            ascending: false,
          })

      if (setsError) {
        setFlashcardSets([])
        setError((currentError) =>
          currentError
            ? `${currentError} ${setsError.message}`
            : setsError.message
        )
      } else {
        setFlashcardSets(data || [])
      }

      setLoadingSets(false)
    }, [])

  const fetchFlashcardPageData =
    useCallback(async () => {
      setError(null)

      await Promise.all([
        fetchClasses(),
        fetchFlashcardSets(),
      ])
    }, [fetchClasses, fetchFlashcardSets])

  useEffect(() => {
    fetchFlashcardPageData()
  }, [fetchFlashcardPageData])

  const createFlashcardSet = async (
    formData
  ) => {
    const title = formData.title?.trim()
    const classId = formData.class_id

    if (!classId) {
      throw new Error(
        'Please select a class.'
      )
    }

    if (!title) {
      throw new Error(
        'Please enter a set title.'
      )
    }

    const { data, error: createError } =
      await supabase
        .from('flashcard_sets')
        .insert({
          class_id: classId,
          title,
        })
        .select(`
          id,
          class_id,
          title,
          created_at
        `)
        .single()

    if (createError) {
      throw createError
    }

    const newSet = {
      ...data,
      flashcards: [],
    }

    setFlashcardSets((currentSets) => [
      newSet,
      ...currentSets,
    ])

    return newSet
  }

  const deleteFlashcardSet = async (
    setId
  ) => {
    const { error: deleteError } =
      await supabase
        .from('flashcard_sets')
        .delete()
        .eq('id', setId)

    if (deleteError) {
      throw deleteError
    }

    setFlashcardSets((currentSets) =>
      currentSets.filter(
        (set) => set.id !== setId
      )
    )
  }

  const updateFlashcardSet = async (
    setId,
    values
  ) => {
    const title = values.title?.trim()
    const classId = values.class_id

    if (!classId) {
      throw new Error(
        'Please select a class.'
      )
    }

    if (!title) {
      throw new Error(
        'Please enter a set title.'
      )
    }

    const { data, error: updateError } =
      await supabase
        .from('flashcard_sets')
        .update({
          title,
          class_id: classId,
        })
        .eq('id', setId)
        .select(`
          id,
          class_id,
          title,
          created_at
        `)
        .single()

    if (updateError) {
      throw updateError
    }

    setFlashcardSets((currentSets) =>
      currentSets.map((set) =>
        set.id === setId
          ? {
              ...set,
              ...data,
            }
          : set
      )
    )

    return data
  }

  return {
    classes,
    flashcardSets,
    loadingClasses,
    loadingSets,
    loading:
      loadingClasses || loadingSets,
    error,
    setError,
    createFlashcardSet,
    updateFlashcardSet,
    deleteFlashcardSet,
    refetch: fetchFlashcardPageData,
  }
}

export default useFlashcardSets