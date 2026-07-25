import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HeaderSection from '../components/pages/HeaderSection'
import FormModal from '../components/FormModal'
import FlashcardSetCard from '../components/flashcards/FlashcardSetCard'
import useFlashcardSets from '../hooks/useFlashcardSets'
import {
  getFlashcardSetFields,
  initialFlashcardSetValues,
} from '../config/flashcardSetFields'

const Flashcards = () => {
  const [isModalOpen, setIsModalOpen] =
    useState(false)

  const [searchTerm, setSearchTerm] =
    useState('')

  const [classFilter, setClassFilter] =
    useState('all')

  const navigate = useNavigate()

  const {
    classes,
    flashcardSets,
    loadingClasses,
    loading,
    error,
    setError,
    createFlashcardSet,
  } = useFlashcardSets()

  const flashcardSetFields = useMemo(
    () => getFlashcardSetFields(classes),
    [classes]
  )

  const classesById = useMemo(() => {
    return classes.reduce(
      (lookup, classItem) => {
        lookup[classItem.id] = classItem
        return lookup
      },
      {}
    )
  }, [classes])

  const filteredFlashcardSets =
    useMemo(() => {
      const search =
        searchTerm.trim().toLowerCase()

      return flashcardSets.filter(
        (flashcardSet) => {
          const classItem =
            classesById[
              flashcardSet.class_id
            ]

          const title =
            flashcardSet.title
              ?.toLowerCase() || ''

          const className =
            classItem?.name
              ?.toLowerCase() || ''

          const classCode =
            classItem?.code
              ?.toLowerCase() || ''

          const matchesSearch =
            !search ||
            title.includes(search) ||
            className.includes(search) ||
            classCode.includes(search)

          const matchesClass =
            classFilter === 'all' ||
            flashcardSet.class_id ===
              classFilter

          return (
            matchesSearch &&
            matchesClass
          )
        }
      )
    }, [
      flashcardSets,
      classesById,
      searchTerm,
      classFilter,
    ])

  const hasFilters =
    Boolean(searchTerm.trim()) ||
    classFilter !== 'all'

  const handleOpenModal = () => {
    if (loadingClasses) {
      return
    }

    if (classes.length === 0) {
      setError(
        'Create a class before creating a flashcard set.'
      )
      return
    }

    setError(null)
    setIsModalOpen(true)
  }

  const handleCreateSet = async (
    formData
  ) => {
    const newSet =
      await createFlashcardSet(formData)

    setIsModalOpen(false)

    navigate(
      `/flashcards/${newSet.id}`
    )
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setClassFilter('all')
  }

  return (
    <div>
      <HeaderSection
        eyebrow="Flashcards"
        title="Your Flashcards"
        description="Create sets, review cards and practise using quizzes and games."
        buttonText={
          loadingClasses
            ? 'Loading Classes...'
            : 'Create Set'
        }
        onButtonClick={handleOpenModal}
      />

      {error && (
        <div className="mx-auto mt-6 max-w-8xl px-4">
          <div className="rounded-xl border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-3">
            <p className="text-sm font-medium text-[var(--error-text)]">
              {error}
            </p>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-8xl px-4 pb-10">
        <section className="mt-8 grid gap-3 md:grid-cols-[1fr_240px]">
          <input
            type="search"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
            placeholder="Search sets or classes..."
            className="
              w-full rounded-xl
              border border-[var(--border)]
              bg-[var(--bg-card)]
              px-4 py-3
              text-[var(--text-primary)]
              outline-none
              placeholder:text-[var(--text-muted)]
              focus:ring-2
              focus:ring-[var(--color-primary)]
            "
          />

          <select
            value={classFilter}
            onChange={(event) =>
              setClassFilter(
                event.target.value
              )
            }
            className="
              w-full rounded-xl
              border border-[var(--border)]
              bg-[var(--bg-card)]
              px-4 py-3
              text-[var(--text-primary)]
              outline-none
              focus:ring-2
              focus:ring-[var(--color-primary)]
            "
          >
            <option value="all">
              All classes
            </option>

            {classes.map((classItem) => (
              <option
                key={classItem.id}
                value={classItem.id}
              >
                {classItem.name}
              </option>
            ))}
          </select>
        </section>

        <section className="mt-6">
          {loading ? (
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] px-6 py-12 text-center">
              <p className="font-semibold text-[var(--text-primary)]">
                Loading flashcard sets...
              </p>
            </div>
          ) : filteredFlashcardSets.length ===
              0 && hasFilters ? (
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] px-6 py-12 text-center">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                No matching sets
              </h2>

              <p className="mt-2 text-sm text-[var(--text-muted)]">
                Try changing your search or
                class filter.
              </p>

              <button
                type="button"
                onClick={
                  handleClearFilters
                }
                className="
                  mt-6 rounded-xl
                  bg-[var(--color-primary)]
                  px-5 py-3
                  font-semibold text-white
                  transition-opacity
                  hover:opacity-90
                "
              >
                Clear Filters
              </button>
            </div>
          ) : flashcardSets.length === 0 ? (
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] px-6 py-12 text-center">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                No flashcard sets yet
              </h2>

              <p className="mt-2 text-sm text-[var(--text-muted)]">
                Create a set for one class
                and start adding focused
                cards.
              </p>

              <button
                type="button"
                onClick={handleOpenModal}
                className="
                  mt-6 rounded-xl
                  bg-[var(--color-primary)]
                  px-5 py-3
                  font-semibold text-white
                  transition-opacity
                  hover:opacity-90
                "
              >
                Create First Set
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredFlashcardSets.map(
                (flashcardSet) => (
                  <FlashcardSetCard
                    key={flashcardSet.id}
                    flashcardSet={
                      flashcardSet
                    }
                    classItem={
                      classesById[
                        flashcardSet
                          .class_id
                      ]
                    }
                    onOpen={(setId) =>
                      navigate(
                        `/flashcards/${setId}`
                      )
                    }
                  />
                )
              )}
            </div>
          )}
        </section>
      </main>

      <FormModal
        isOpen={isModalOpen}
        title="Create Flashcard Set"
        fields={flashcardSetFields}
        initialValues={
          initialFlashcardSetValues
        }
        onSubmit={handleCreateSet}
        onClose={() =>
          setIsModalOpen(false)
        }
      />
    </div>
  )
}

export default Flashcards