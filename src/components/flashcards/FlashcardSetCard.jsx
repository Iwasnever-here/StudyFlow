const FlashcardSetCard = ({
  flashcardSet,
  classItem,
  onOpen,
}) => {
  const cardCount =
    flashcardSet.flashcards?.length || 0

  const classColour =
    classItem?.color ||
    'var(--color-primary)'

  return (
    <button
      type="button"
      onClick={() =>
        onOpen(flashcardSet.id)
      }
      className="
        group relative min-h-60 w-full
        overflow-hidden rounded-3xl
        border border-[var(--border)]
        bg-[var(--bg-card)]
        px-5 pb-5 pt-7
        text-left
        shadow-sm
        transition duration-200
        hover:-translate-y-1
        hover:shadow-md
        focus:outline-none
        focus-visible:ring-2
        focus-visible:ring-[var(--color-primary)]
      "
    >
      <div
        className="
          absolute inset-x-0 top-0
          h-1
        "
        style={{
          backgroundColor: classColour,
        }}
      />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="
                h-2.5 w-2.5
                shrink-0 rounded-full
              "
              style={{
                backgroundColor:
                  classColour,
              }}
            />

            <p
              className="
                truncate text-xs
                font-bold uppercase
                tracking-[0.16em]
              "
              style={{
                color: classColour,
              }}
            >
              {classItem?.code ||
                'Flashcards'}
            </p>
          </div>

          <h2
            className="
              mt-5 line-clamp-2
              text-2xl font-bold
              leading-tight
              text-[var(--text-primary)]
            "
          >
            {flashcardSet.title}
          </h2>

          <p
            className="
              mt-2 truncate text-sm
              text-[var(--text-muted)]
            "
          >
            {classItem?.name ||
              'No class assigned'}
          </p>
        </div>

        <span
          className="
            shrink-0 text-lg
            text-[var(--text-muted)]
            transition-transform
            group-hover:translate-x-1
            group-hover:text-[var(--text-primary)]
          "
          aria-hidden="true"
        >
          →
        </span>
      </div>

      <div className="mt-7 flex flex-wrap gap-2">
        <span
          className="
            rounded-lg border
            border-[var(--border)]
            bg-[var(--bg-input)]
            px-3 py-1.5
            text-xs font-medium
            text-[var(--text-secondary)]
          "
        >
          {cardCount}{' '}
          {cardCount === 1
            ? 'card'
            : 'cards'}
        </span>

        {classItem?.code && (
          <span
            className="
              rounded-lg border
              border-[var(--border)]
              bg-[var(--bg-input)]
              px-3 py-1.5
              text-xs font-medium
              text-[var(--text-secondary)]
            "
          >
            {classItem.code}
          </span>
        )}
      </div>

      <div
        className="
          mt-5 border-t
          border-[var(--border)]
          pt-5
        "
      >
        <span
          className="
            text-sm font-semibold
            text-[var(--text-primary)]
          "
        >
          Click to view
        </span>
      </div>
    </button>
  )
}

export default FlashcardSetCard