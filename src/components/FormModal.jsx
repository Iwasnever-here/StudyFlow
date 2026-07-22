import { useEffect, useState } from 'react'

function FormModal({
  isOpen,
  title,
  fields,
  initialValues = {},
  onSubmit,
  onClose,
}) {
  const [formData, setFormData] = useState(initialValues)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen) {
      setFormData(initialValues)
      setError(null)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, initialValues])

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen && !loading) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, loading, onClose])

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target

    setFormData((previousData) => ({
      ...previousData,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await onSubmit(formData)
      onClose()
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleOverlayClick = () => {
    if (!loading) {
      onClose()
    }
  }

  if (!isOpen) return null

  const inputClasses = `
    w-full rounded-xl border border-[var(--border)]
    bg-[var(--bg-input)] px-4 py-3
    text-sm text-[var(--text-primary)]
    outline-none
    placeholder:text-[var(--text-placeholder)]
    focus:border-[var(--border-accent)]
    focus:ring-4 focus:ring-[var(--color-primary)]/15
    disabled:cursor-not-allowed disabled:opacity-60
  `

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/40 px-4 py-8
        backdrop-blur-md
      "
      onClick={handleOverlayClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-modal-title"
        className="
          relative max-h-[90vh] w-full max-w-2xl
          overflow-y-auto rounded-3xl
          border border-(--border)
          bg-(--bg-card)
          p-6
          shadow-2xl shadow-black/20
          sm:p-8
        "
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          aria-label="Close modal"
          className="
            absolute right-5 top-5
            flex h-10 w-10 items-center justify-center
            rounded-full
            text-2xl leading-none
            text-(--text-muted)
            hover:bg-(--bg-input)
            hover:text-(--text-primary)
            focus:outline-none
            focus:ring-4 focus:ring-(--color-primary)/15
            disabled:cursor-not-allowed disabled:opacity-50
          "
        >
          ×
        </button>

        <div className="mb-7 pr-12">
          <p
            className="
              mb-2 text-xs font-semibold uppercase
              tracking-[0.2em]
              text-(--color-secondary)
            "
          >
            Create new
          </p>

          <h2
            id="form-modal-title"
            className="
              text-2xl font-bold tracking-tight
              text-(--text-primary)
              sm:text-3xl
            "
          >
            {title}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              {field.type !== 'checkbox' && (
                <label
                  htmlFor={field.name}
                  className="
                    block text-sm font-semibold
                    text-(--text-secondary)
                  "
                >
                  {field.label}

                  {field.required && (
                    <span className="ml-1 text-(--error-text)">
                      *
                    </span>
                  )}
                </label>
              )}

              {field.type === 'textarea' ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  required={field.required}
                  disabled={loading}
                  rows={4}
                  className={`${inputClasses} min-h-28 resize-y`}
                />
              ) : field.type === 'select' ? (
                <select
                  id={field.name}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  required={field.required}
                  disabled={loading}
                  className={inputClasses}
                >
                  <option value="">Select an option</option>

                  {field.options?.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : field.type === 'checkbox' ? (
                <label
                  htmlFor={field.name}
                  className="
                    flex cursor-pointer items-center gap-3
                    rounded-xl border border-(--border)
                    bg-(--bg-input)
                    px-4 py-3
                    hover:border-(--border-accent)
                  "
                >
                  <input
                    id={field.name}
                    name={field.name}
                    type="checkbox"
                    checked={Boolean(formData[field.name])}
                    onChange={handleChange}
                    disabled={loading}
                    className="
                      h-5 w-5 rounded
                      border-(--border)
                      accent-(--color-primary)
                      focus:ring-(--color-primary)/20
                    "
                  />

                  <span
                    className="
                      text-sm font-medium
                      text-(--text-secondary)
                    "
                  >
                    {field.checkboxLabel || field.label}
                  </span>
                </label>
              ) : (
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type || 'text'}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  required={field.required}
                  disabled={loading}
                  className={inputClasses}
                />
              )}
            </div>
          ))}

          {error && (
            <div
              className="
                rounded-xl
                border border-(--error-border)
                bg-(--error-bg)
                px-4 py-3
              "
            >
              <p
                className="
                  text-sm font-medium
                  text-(--error-text)
                "
              >
                {error}
              </p>
            </div>
          )}

          <div
            className="
              flex flex-col-reverse gap-3
              border-t border-(--border)
              pt-6
              sm:flex-row sm:justify-end
            "
          >
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="
                rounded-xl
                border border-(--border)
                bg-(--bg-input)
                px-5 py-3
                text-sm font-semibold
                text-(--text-secondary)
                hover:border-(--border-accent)
                hover:text-(--text-primary)
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="
                rounded-xl
                bg-(--color-primary)
                px-5 py-3
                text-sm font-semibold
                text-(--text-light)
                shadow-lg shadow-black/10
                hover:-translate-y-0.5
                hover:bg-(--color-primary-hover)
                hover:shadow-xl
                disabled:cursor-not-allowed
                disabled:bg-(--disabled)
                disabled:opacity-70
                disabled:hover:translate-y-0
              "
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FormModal