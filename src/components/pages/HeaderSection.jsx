function HeaderSection({
  eyebrow,
  title,
  description,
  buttonText,
  onButtonClick,
  children,
}) {
  return (
    <section
      className="
        flex flex-col gap-6
        rounded-4xl
        border border-(--border)
        bg-(--bg-card)
        p-8
        shadow-[0_20px_50px_rgba(38,55,31,0.12)]
        md:flex-row
        md:items-center
        md:justify-between
      "
    >
      <div className="max-w-2xl">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-(--color-secondary)">
          {eyebrow}
        </p>

        <h1 className="mt-3 text-5xl font-black tracking-[-0.06em] text-(--text-primary)">
          {title}
        </h1>

        <p className="mt-4 max-w-xl text-lg leading-relaxed text-(--text-secondary)">
          {description}
        </p>
      </div>

      {children ? (
        children
      ) : (
        buttonText && (
          <button
            onClick={onButtonClick}
            className="
              rounded-2xl
              bg-(--color-primary)
              px-7
              py-5
              text-lg
              font-bold
              text-(--text-light)
              shadow-lg
              transition-all
              duration-200
              hover:bg-(--color-primary-hover)
              hover:-translate-y-0.5
            "
          >
            {buttonText}
          </button>
        )
      )}
    </section>
  )
}

export default HeaderSection