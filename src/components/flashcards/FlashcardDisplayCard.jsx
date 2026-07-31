import {
  LuPencil,
  LuTrash2,
} from 'react-icons/lu'

const FlashcardDisplayCard = ({
  card,
  index,
  onEdit,
  onDelete,
}) => {
  return (
    <article className="rounded-xl border border-(--border) bg-(--bg-card) p-4">
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
          Card {index + 1}
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={`Edit card ${index + 1}`}
            onClick={() => onEdit(card)}
            className="
              flex h-8 w-8 items-center
              justify-center rounded-lg
              text-(--text-muted)
              transition
              hover:bg-(--bg-hover)
              hover:text-(--text-primary)
            "
          >
            <LuPencil />
          </button>

          <button
            type="button"
            aria-label={`Delete card ${index + 1}`}
            onClick={() => onDelete(card)}
            className="
              flex h-8 w-8 items-center
              justify-center rounded-lg
              text-(--text-muted)
              transition
              hover:bg-(--error-bg)
              hover:text-(--error-text)
            "
          >
            <LuTrash2 />
          </button>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium text-(--text-muted)">
          Question
        </p>

        <p className="mt-1 whitespace-pre-wrap font-semibold leading-6 text-(--text-primary)">
          {card.front}
        </p>
      </div>

      <div className="mt-4 border-t border-(--border) pt-4">
        <p className="text-xs font-medium text-(--text-muted)">
          Answer
        </p>

        <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-(--text-secondary)">
          {card.back}
        </p>
      </div>
    </article>
  )
}

export default FlashcardDisplayCard
