import {
  useMemo,
  useState,
} from 'react'
import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom'
import {
  LuBlocks,
  LuBrain,
  LuPlus,
  LuRepeat2,
} from 'react-icons/lu'

import FormModal from '../components/FormModal'
import FlashcardDisplayCard from '../components/flashcards/FlashcardDisplayCard'

import useFlashcardSets from '../hooks/useFlashcardSets'
import useFlashcards from '../hooks/useFlashcards'

import {
  flashcardFields,
  initialFlashcardValues,
} from '../config/flashcardFields'

const FlashcardSet = () => {
  const { setId } = useParams()
  const navigate = useNavigate()

  const [
    isCardModalOpen,
    setIsCardModalOpen,
  ] = useState(false)

  const [
    editingCard,
    setEditingCard,
  ] = useState(null)

  const [
    pageError,
    setPageError,
  ] = useState(null)

  const {
    classes,
    flashcardSets,
    loading: loadingSets,
    error: setError,
  } = useFlashcardSets()

  const {
    cards,
    loadingCards,
    cardError,
    setCardError,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
  } = useFlashcards(setId)

  const flashcardSet = useMemo(
    () =>
      flashcardSets.find(
        (set) =>
          String(set.id) === String(setId),
      ),
    [flashcardSets, setId],
  )

  const classItem = useMemo(
    () =>
      classes.find(
        (item) =>
          String(item.id) ===
          String(flashcardSet?.class_id),
      ),
    [classes, flashcardSet],
  )

  const loading =
    loadingSets || loadingCards

  const error =
    pageError || setError || cardError

  const openCreateModal = () => {
    setEditingCard(null)
    setPageError(null)
    setCardError(null)
    setIsCardModalOpen(true)
  }

  const openEditModal = (card) => {
    setEditingCard(card)
    setPageError(null)
    setCardError(null)
    setIsCardModalOpen(true)
  }

  const closeCardModal = () => {
    setIsCardModalOpen(false)
    setEditingCard(null)
  }

  const handleSubmitCard = async (
    formData,
  ) => {
    if (editingCard) {
      await updateFlashcard(
        editingCard.id,
        formData,
      )
    } else {
      await createFlashcard({
        front: formData.front,
        back: formData.back,
        classId:
          flashcardSet.class_id,
      })
    }

    closeCardModal()
  }

  const handleDeleteCard = async (
    card,
  ) => {
    const confirmed = window.confirm(
      `Delete "${card.front}"?`,
    )

    if (!confirmed) {
      return
    }

    setPageError(null)

    try {
      await deleteFlashcard(card.id)
    } catch (deleteError) {
      setPageError(
        deleteError?.message ||
          'Failed to delete flashcard.',
      )
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <p className="text-sm text-(--text-muted)">
          Loading flashcard set...
        </p>
      </main>
    )
  }

  if (!flashcardSet) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <Link
          to="/flashcards"
          className="text-sm font-medium text-(--text-muted) transition hover:text-(--text-primary)"
        >
          ← Back to flashcards
        </Link>

        <div className="mt-6 rounded-xl border border-(--error-border) bg-(--error-bg) p-4">
          <p className="text-sm text-(--error-text)">
            {error ||
              'Flashcard set not found.'}
          </p>
        </div>
      </main>
    )
  }

  const classColor =
    classItem?.color || '#26371f'

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <Link
        to="/flashcards"
        className="
          text-sm font-medium
          text-(--text-muted)
          transition
          hover:text-(--text-primary)
        "
      >
        ← Back to flashcards
      </Link>

      <header className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex items-start gap-4">
          <div
            className="mt-1 h-14 w-2 rounded-full"
            style={{
              backgroundColor: classColor,
            }}
          />

          <div>
            <p
              className="text-xs font-bold uppercase tracking-wider"
              style={{
                color: classColor,
              }}
            >
              {classItem?.code ||
                'Flashcard set'}
            </p>

            <h1 className="mt-1 text-3xl font-bold text-(--text-primary)">
              {flashcardSet.title}
            </h1>

            <p className="mt-1 text-sm text-(--text-muted)">
              {classItem?.name ||
                'No class assigned'}
              {' · '}
              {cards.length}{' '}
              {cards.length === 1
                ? 'card'
                : 'cards'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="
            inline-flex items-center
            gap-2 rounded-xl border
            border-(--border)
            bg-(--bg-card)
            px-4 py-2.5
            text-sm font-semibold
            text-(--text-primary)
            transition
            hover:bg-(--bg-hover)
          "
        >
          <LuPlus />
          Add card
        </button>
      </header>

      {error && (
        <div className="mt-5 rounded-xl border border-(--error-border) bg-(--error-bg) px-4 py-3">
          <p className="text-sm font-medium text-(--error-text)">
            {error}
          </p>
        </div>
      )}

      <section className="mt-7 overflow-hidden rounded-2xl border border-(--border) bg-(--bg-card)">
        <div className="flex flex-col gap-4 border-b border-(--border) px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-bold text-(--text-primary)">
              Study this set
            </h2>

            <p className="mt-1 text-sm text-(--text-muted)">
              Choose a mode and start practising.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <StudyModeButton
              icon={<LuRepeat2 />}
              label="Review"
              disabled={cards.length === 0}
              onClick={() =>
                navigate(
                  `/flashcards/${setId}/review`,
                )
              }
            />

            <StudyModeButton
              icon={<LuBrain />}
              label="Quiz"
              disabled={cards.length === 0}
              onClick={() =>
                navigate(
                  `/flashcards/${setId}/quiz`,
                )
              }
            />

            <StudyModeButton
              icon={<LuBlocks />}
              label="Game"
              disabled={cards.length === 0}
              onClick={() =>
                navigate(
                  `/flashcards/${setId}/game`,
                )
              }
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 border-b border-(--border) px-5 py-4">
          <div>
            <h2 className="font-bold text-(--text-primary)">
              Flashcards
            </h2>

            <p className="mt-1 text-sm text-(--text-muted)">
              Edit or remove cards from this set.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="
              inline-flex items-center
              gap-2 rounded-lg px-3 py-2
              text-sm font-semibold
              text-(--text-primary)
              transition
              hover:bg-(--bg-hover)
            "
          >
            <LuPlus />
            Add
          </button>
        </div>

        {cards.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 py-10 text-center">
            <h3 className="text-lg font-bold text-(--text-primary)">
              No flashcards yet
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-(--text-muted)">
              Add your first question and answer
              to begin building this set.
            </p>

            <button
              type="button"
              onClick={openCreateModal}
              className="
                mt-5 inline-flex items-center
                gap-2 rounded-xl border
                border-(--border)
                px-4 py-2.5
                text-sm font-semibold
                text-(--text-primary)
                transition
                hover:bg-(--bg-hover)
              "
            >
              <LuPlus />
              Add first card
            </button>
          </div>
        ) : (
          <div className="max-h-[540px] overflow-y-auto p-4">
            <div className="grid gap-3 lg:grid-cols-2">
              {cards.map(
                (card, index) => (
                  <FlashcardDisplayCard
                    key={card.id}
                    card={card}
                    index={index}
                    onEdit={openEditModal}
                    onDelete={
                      handleDeleteCard
                    }
                  />
                ),
              )}
            </div>
          </div>
        )}
      </section>

      <FormModal
        isOpen={isCardModalOpen}
        title={
          editingCard
            ? 'Edit Flashcard'
            : 'Add Flashcard'
        }
        fields={flashcardFields}
        initialValues={
          editingCard
            ? {
                front:
                  editingCard.front,
                back:
                  editingCard.back,
              }
            : initialFlashcardValues
        }
        onSubmit={handleSubmitCard}
        onClose={closeCardModal}
      />
    </main>
  )
}

const StudyModeButton = ({
  icon,
  label,
  disabled,
  onClick,
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className="
      inline-flex items-center
      justify-center gap-2
      rounded-xl border
      border-(--border)
      bg-(--bg-card)
      px-4 py-2.5
      text-sm font-semibold
      text-(--text-primary)
      transition
      hover:bg-(--bg-hover)
      disabled:cursor-not-allowed
      disabled:opacity-40
    "
  >
    {icon}
    {label}
  </button>
)

export default FlashcardSet