import { useNavigate } from 'react-router-dom'

const Folder = ({ classItem }) => {
  const navigate = useNavigate()

  const folderColor = classItem.color || '#26371f'

  const openClass = () => {
    navigate(`/classes/${classItem.id}`)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openClass()
    }
  }

  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={`Open ${classItem.name}`}
      onClick={openClass}
      onKeyDown={handleKeyDown}
      className="
        group relative h-52 cursor-pointer
        transition-transform duration-200 ease-out
        hover:-translate-y-1
        focus:outline-none
        focus-visible:ring-2
        focus-visible:ring-(--color-primary)
        focus-visible:ring-offset-2
      "
    >
      {/* Folder tab */}
      <div
        className="
          absolute left-0 top-0 h-9 w-28
          rounded-t-xl border border-b-0 border-(--border)
        "
        style={{ backgroundColor: folderColor }}
      />

      {/* Main folder body */}
      <div
        className="
          absolute inset-x-0 bottom-0 top-8
          overflow-hidden rounded-2xl rounded-tl-none
          border border-(--border)
          bg-(--bg-card)
          shadow-sm
          transition-all duration-200
          group-hover:border-(--color-secondary)
          group-hover:shadow-md
        "
      >
        {/* Accent line */}
        <div
          className="absolute inset-y-0 left-0 w-1.5"
          style={{ backgroundColor: folderColor }}
        />

        <div className="flex h-full flex-col justify-between p-5 pl-7">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p
                  className="
                    text-xs font-bold uppercase tracking-[0.16em]
                  "
                  style={{ color: folderColor }}
                >
                  {classItem.code || 'Class'}
                </p>

                <h2 className="mt-2 truncate text-xl font-bold text-(--text-primary)">
                  {classItem.name}
                </h2>
              </div>

              <span
                className="mt-1 h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: folderColor }}
              />
            </div>

            {classItem.lecturer && (
              <p className="mt-3 truncate text-sm text-(--text-muted)">
                {classItem.lecturer}
              </p>
            )}
          </div>

          <div className="flex items-end justify-between gap-4">
            <div className="flex gap-5">
              {classItem.target_grade !== null &&
                classItem.target_grade !== '' && (
                  <div>
                    <p className="text-xs text-(--text-muted)">
                      Target
                    </p>

                    <p className="mt-0.5 text-sm font-semibold text-(--text-primary)">
                      {classItem.target_grade}
                    </p>
                  </div>
                )}

              {classItem.credits !== null &&
                classItem.credits !== '' && (
                  <div>
                    <p className="text-xs text-(--text-muted)">
                      Credits
                    </p>

                    <p className="mt-0.5 text-sm font-semibold text-(--text-primary)">
                      {classItem.credits}
                    </p>
                  </div>
                )}
            </div>

            <span
              className="
                text-sm font-semibold text-(--text-muted)
                transition-transform duration-200
                group-hover:translate-x-1
                group-hover:text-(--text-primary)
              "
            >
              View →
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}

export default Folder