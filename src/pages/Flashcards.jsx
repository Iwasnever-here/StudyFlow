import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HeaderSection from '../components/pages/HeaderSection'
import FormModal from '../components/FormModal'
import { supabase } from '../lib/supabaseClient'

const initialFlashcardSetValues = {
  class_id: '',
  title: '',
}

const Flashcards = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [classes, setClasses] = useState([])
  const [flashcardSets, setFlashcardSets] = useState([])
  const [loadingClasses, setLoadingClasses] = useState(true)
  const [loadingSets, setLoadingSets] = useState(true)
  const [pageError, setPageError] = useState(null)

  const navigate = useNavigate()

  useEffect(() => {
    const fetchPageData = async () => {
      setPageError(null)
      setLoadingClasses(true)
      setLoadingSets(true)

      const [classesResult, setsResult] = await Promise.all([
        supabase
          .from('classes')
          .select('id, name, code, color')
          .order('name', { ascending: true }),

        supabase
          .from('flashcard_sets')
          .select(`
            id,
            class_id,
            title,
            created_at
          `)
          .order('created_at', { ascending: false }),
      ])

      if (classesResult.error) {
        setPageError(classesResult.error.message)
        setClasses([])
      } else {
        setClasses(classesResult.data || [])
      }

      if (setsResult.error) {
        setPageError((currentError) =>
          currentError
            ? `${currentError} ${setsResult.error.message}`
            : setsResult.error.message
        )

        setFlashcardSets([])
      } else {
        setFlashcardSets(setsResult.data || [])
      }

      setLoadingClasses(false)
      setLoadingSets(false)
    }

    fetchPageData()
  }, [])

  const flashcardSetFields = useMemo(
    () => [
      {
        name: 'class_id',
        label: 'Class',
        type: 'select',
        required: true,
        options: classes.map((classItem) => ({
          label: classItem.code
            ? `${classItem.code} — ${classItem.name}`
            : classItem.name,
          value: classItem.id,
        })),
      },
      {
        name: 'title',
        label: 'Set Title',
        type: 'text',
        placeholder: 'Example: Week 1 Key Terms',
        required: true,
      },
    ],
    [classes]
  )

  const createFlashcardSet = async (formData) => {
    const title = formData.title.trim()

    if (!formData.class_id) {
      throw new Error('Please select a class.')
    }

    if (!title) {
      throw new Error('Please enter a set title.')
    }

    const { data, error } = await supabase
      .from('flashcard_sets')
      .insert({
        class_id: formData.class_id,
        title,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    setFlashcardSets((previousSets) => [
      data,
      ...previousSets,
    ])

    navigate(`/flashcards/${data.id}`)
  }

  const handleOpenModal = () => {
    if (loadingClasses) {
      return
    }

    if (classes.length === 0) {
      setPageError(
        'Create a class before creating a flashcard set.'
      )
      return
    }

    setPageError(null)
    setIsModalOpen(true)
  }

  const getLinkedClass = (classId) => {
    return classes.find(
      (classItem) => classItem.id === classId
    )
  }

  return (
    <div>
      <HeaderSection
        eyebrow="Flashcards"
        title="Your Flashcards"
        description="Create and manage your flashcards for effective studying."
        buttonText={
          loadingClasses ? 'Loading Classes...' : 'Create Set'
        }
        onButtonClick={handleOpenModal}
      />

      {pageError && (
        <div className="mx-auto mt-6 max-w-6xl px-4">
          <div className="rounded-xl border border-(--error-border) bg-(--error-bg) px-4 py-3">
            <p className="text-sm font-medium text-(--error-text)">
              {pageError}
            </p>
          </div>
        </div>
      )}

      
      <FormModal
        isOpen={isModalOpen}
        title="Create Flashcard Set"
        fields={flashcardSetFields}
        initialValues={initialFlashcardSetValues}
        onSubmit={createFlashcardSet}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}

export default Flashcards