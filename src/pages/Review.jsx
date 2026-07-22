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
          <div className="rounded-xl border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-3">
            <p className="text-sm font-medium text-[var(--error-text)]">
              {pageError}
            </p>
          </div>
        </div>
      )}

      <section className="mx-auto max-w-6xl px-4 py-8">
        {loadingSets ? (
          <p className="text-sm text-[var(--text-muted)]">
            Loading flashcard sets...
          </p>
        ) : flashcardSets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-card)] p-8 text-center">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              No flashcard sets yet
            </h2>

            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Create your first set, then add cards inside it.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {flashcardSets.map((set) => {
              const linkedClass = getLinkedClass(set.class_id)

              return (
                <button
                  key={set.id}
                  type="button"
                  onClick={() =>
                    navigate(`/flashcards/${set.id}`)
                  }
                  className="group rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-[var(--border-accent)] hover:shadow-lg"
                >
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-secondary)]">
                        {linkedClass?.code ||
                          linkedClass?.name ||
                          'Class'}
                      </p>

                      <h2 className="mt-1 text-xl font-bold text-[var(--text-primary)]">
                        {set.title}
                      </h2>
                    </div>

                    <span
                      className="h-5 w-5 shrink-0 rounded-full border border-[var(--border)]"
                      style={{
                        backgroundColor:
                          linkedClass?.color ||
                          'var(--color-secondary)',
                      }}
                    />
                  </div>

                  <p className="text-sm font-semibold text-[var(--color-primary)]">
                    Open set →
                  </p>
                </button>
              )
            })}
          </div>
        )}
      </section>

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