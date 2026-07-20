import { Link } from 'react-router-dom'
import ThemeSwitcher from '../components/ThemeSwitcher'

function Landing() {
  return (
    <div className="min-h-screen bg-[--bg-page] text-[--text-primary]">

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-[--border] bg-[--bg-page]/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <h2 className="text-2xl font-black">
            StudyFlow
          </h2>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#">Features</a>
            <a href="#">About</a>

            <ThemeSwitcher />

            <Link
              to="/login"
              className="font-semibold"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="rounded-xl bg-[--color-primary] px-5 py-3 font-bold text-[var(--text-light)]"
            >
              Get Started
            </Link>

          </div>

        </div>
      </header>

      {/* HERO */}

      <section className="mx-auto grid max-w-7xl gap-16 px-6 py-24 lg:grid-cols-2">

        <div>

          <p className="font-bold uppercase tracking-[0.25em] text-[--color-secondary]">
            Built for students
          </p>

          <h1 className="mt-4 text-6xl font-black leading-none">
            Study smarter,
            <br />
            not harder.
          </h1>

          <p className="mt-6 max-w-xl text-lg text-[--text-secondary]">

            Placeholder text explaining why StudyFlow exists and
            how it helps students stay organised.

          </p>

          <div className="mt-10 flex gap-4">

            <Link
              to="/register"
              className="rounded-xl bg-[var(--color-primary)] px-7 py-4 font-bold text-[var(--text-light)]"
            >
              Get Started
            </Link>

            <button className="rounded-xl border border-[var(--border)] px-7 py-4">
              Watch Demo
            </button>

          </div>

        </div>

        {/* Placeholder Image */}

        <div className="flex items-center justify-center rounded-3xl border border-[var(--border)] bg-[var(--bg-card)]">

          <div className="text-center">

            <p className="text-xl font-bold">
              Dashboard Screenshot
            </p>

            <p className="mt-2 text-[var(--text-muted)]">
              Placeholder image
            </p>

          </div>

        </div>

      </section>

      {/* FEATURES */}

      <section className="mx-auto max-w-7xl px-6 py-20">

        <h2 className="mb-12 text-center text-4xl font-black">
          Everything you need
        </h2>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          {[
            'Classes',
            'Coursework',
            'Flashcards',
            'Timetable',
            'To-do',
            'Analytics',
          ].map((feature) => (
            <div
              key={feature}
              className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-8"
            >

              <div className="mb-6 h-12 w-12 rounded-xl bg-[var(--color-primary)]" />

              <h3 className="text-2xl font-bold">
                {feature}
              </h3>

              <p className="mt-3 text-[var(--text-secondary)]">
                Placeholder feature description.
              </p>

            </div>
          ))}

        </div>

      </section>

      {/* HOW IT WORKS */}

      <section className="mx-auto max-w-6xl px-6 py-20 text-center">

        <h2 className="text-4xl font-black">
          How it works
        </h2>

        <div className="mt-16 grid gap-10 md:grid-cols-4">

          {[
            'Create account',
            'Add classes',
            'Study',
            'Track progress',
          ].map((step, index) => (
            <div key={step}>

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)] text-xl font-bold text-[var(--text-light)]">
                {index + 1}
              </div>

              <h3 className="mt-5 font-bold">
                {step}
              </h3>

            </div>
          ))}

        </div>

      </section>

      {/* CTA */}

      <section className="mx-auto max-w-5xl px-6 py-24">

        <div className="rounded-3xl bg-[var(--color-primary)] p-16 text-center text-[var(--text-light)]">

          <h2 className="text-5xl font-black">
            Ready to start?
          </h2>

          <p className="mt-5 text-lg opacity-90">
            Placeholder CTA text.
          </p>

          <Link
            to="/register"
            className="mt-10 inline-block rounded-xl bg-[var(--bg-card)] px-8 py-4 font-bold text-[var(--text-primary)]"
          >
            Create Account
          </Link>

        </div>

      </section>

    </div>
  )
}

export default Landing