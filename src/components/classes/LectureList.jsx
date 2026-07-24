import { LuBookOpen, LuPlus } from 'react-icons/lu'
import LectureRow from './LectureRow'

function LectureList({
  lectures,
  nextLectureId,
  loading = false,
  onAdd,
  onEdit,
  onDelete,
  onToggleComplete,
  updatingLectureId,
  deletingLectureId,
}){
  if (loading) {
    return (
      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]">
        <div className="border-b border-[var(--border)] px-6 py-5">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            Lectures
          </h2>
        </div>

        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-[var(--text-muted)]">
            Loading lectures...
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-5">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            Lectures
          </h2>

          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {lectures.length}{' '}
            {lectures.length === 1
              ? 'lecture'
              : 'lectures'}
          </p>
        </div>

        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            <LuPlus aria-hidden="true" />
            Add Lecture
          </button>
        )}
      </div>

      {lectures.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <LuBookOpen
            className="mb-4 text-[var(--text-muted)]"
            size={36}
          />

          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            No lectures yet
          </h3>

          <p className="mt-2 max-w-sm text-sm text-[var(--text-muted)]">
            Add your first lecture or generate a
            lecture schedule when creating the class.
          </p>

          {onAdd && (
            <button
              type="button"
              onClick={onAdd}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
            >
              <LuPlus aria-hidden="true" />
              Add Lecture
            </button>
          )}
        </div>
      ) : (
        <div className="max-h-[292.45px] overflow-y-auto">
          {lectures.map((lecture) => (
            <LectureRow
              key={lecture.id}
              lecture={lecture}
              isNext={
                lecture.id === nextLectureId
              }
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleComplete={
                onToggleComplete
              }
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default LectureList