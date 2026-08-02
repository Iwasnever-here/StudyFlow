import { Link } from 'react-router-dom'
import ThemeSwitcher from '../components/ThemeSwitcher'
import studyFlowDark from '../assets/studyflowdark.png'

const features = [
  {
    title: 'Classes',
    description:
      'Keep your modules, lecturers, credits, and target grades organised in one place.',
  },
  {
    title: 'Coursework',
    description:
      'Track assignments, deadlines, estimated study time, progress, and completed grades.',
  },
  {
    title: 'Flashcards',
    description:
      'Create focused flashcard sets, test your knowledge, and review difficult topics.',
  },
  {
    title: 'Timetable',
    description:
      'Plan lectures and study sessions without losing sight of your existing commitments.',
  },
  {
    title: 'To-do',
    description:
      'Capture smaller tasks, set priorities, and clearly see what needs your attention.',
  },
  {
    title: 'Analytics',
    description:
      'Review your study activity, coursework progress, flashcard accuracy, and class performance.',
  },
]

const steps = [
  {
    title: 'Create your account',
    description:
      'Set up your personal StudyFlow workspace in just a few moments.',
  },
  {
    title: 'Add your classes',
    description:
      'Enter your modules, coursework, lectures, flashcards, and smaller tasks.',
  },
  {
    title: 'Follow your plan',
    description:
      'Use your dashboard and timetable to focus on the right work each day.',
  },
  {
    title: 'Track your progress',
    description:
      'Review your results and improve your study routine over time.',
  },
]

function Landing() {
  return (
    <div className="min-h-screen bg-(--bg-page) text-(--text-primary)">
      <header className="sticky top-0 z-50 border-b border-(--border) bg-(--bg-page)/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            to="/"
            className="text-2xl font-black"
          >
            StudyFlow
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="font-medium transition hover:text-(--color-secondary)"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              className="font-medium transition hover:text-(--color-secondary)"
            >
              How it works
            </a>

            <ThemeSwitcher />

            <Link
              to="/login"
              className="font-semibold transition hover:text-(--color-secondary)"
            >
              Log in
            </Link>

            <Link
              to="/register"
              className="rounded-xl bg-(--color-primary) px-5 py-3 font-bold text-(--text-light) transition hover:opacity-90"
            >
              Start for free
            </Link>
          </div>
        

        {/* Mobile */}
        <div className="flex items-center gap-3 md:hidden">
          <ThemeSwitcher />

          <Link
            to="/login"
            className="font-semibold"
          >
            Log in
          </Link>

          <Link
            to="/register"
            className="rounded-xl bg-(--color-primary) px-4 py-2 font-bold text-(--text-light)"
          >
            Sign up
          </Link>
        </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-2">
          <div className="flex flex-col justify-center">
            <p className="font-bold uppercase tracking-[0.25em] text-(--color-secondary)">
              Built for students
            </p>

            <h1 className="mt-4 text-5xl font-black leading-none sm:text-6xl">
              Study smarter,
              <br />
              not harder.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-(--text-secondary)">
              StudyFlow brings your classes, coursework, timetable,
              flashcards, and daily tasks into one organised workspace,
              so you always know what to study next.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/register"
                className="rounded-xl bg-(--color-primary) px-7 py-4 font-bold text-(--text-light) transition hover:opacity-90"
              >
                Start organising
              </Link>

              <a
                href="#features"
                className="rounded-xl border border-(--border) px-7 py-4 font-semibold transition hover:bg-(--bg-card)"
              >
                Explore features
              </a>
            </div>
          </div>

          <div className="relative flex min-h-[420px] items-center justify-center">
            <div className="absolute left-6 top-8 h-40 w-40 rounded-full bg-(--color-secondary) opacity-20 blur-3xl" />

            <div className="absolute bottom-8 right-6 h-48 w-48 rounded-full bg-(--color-primary) opacity-20 blur-3xl" />

            <div className="absolute h-[88%] w-[92%] rotate-3 rounded-3xl border border-(--border) bg-(--color-secondary) opacity-20" />

            <div className="relative flex min-h-[380px] w-full items-center justify-center rounded-3xl border border-(--border) bg-(--bg-card) p-8 shadow-2xl">
              <div className="flex h-full min-h-[310px] w-full items-center justify-center rounded-2xl border-2 border-dashed border-(--border) bg-(--bg-page)">
                <div className="text-center">

                  <img
                    src={studyFlowDark}
                    alt="StudyFlow dashboard"
                    className="h-auto w-full rounded-xl object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="scroll-mt-24 bg-(--bg-card)"
        >
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-bold uppercase tracking-[0.2em] text-(--color-secondary)">
                One connected workspace
              </p>

              <h2 className="mt-3 text-4xl font-black">
                Everything you need to stay on track
              </h2>

              <p className="mt-5 text-lg leading-8 text-(--text-secondary)">
                Stop switching between scattered notes, calendars, and
                task lists. StudyFlow keeps your academic workload connected.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {features.map((feature, index) => (
                <article
                  key={feature.title}
                  className="rounded-2xl border border-(--border) bg-(--bg-page) p-8 transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-(--color-primary) font-black text-(--text-light)">
                    {index + 1}
                  </div>

                  <h3 className="text-2xl font-bold">
                    {feature.title}
                  </h3>

                  <p className="mt-3 leading-7 text-(--text-secondary)">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="mx-auto max-w-7xl scroll-mt-24 px-6 py-24"
        >
          <div className="text-center">
            <p className="font-bold uppercase tracking-[0.2em] text-(--color-secondary)">
              Simple by design
            </p>

            <h2 className="mt-3 text-4xl font-black">
              Build a better study routine
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-(--text-secondary)">
              Add your academic workload once, then use StudyFlow to decide
              what deserves your attention each day.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((step, index) => (
              <article
                key={step.title}
                className="rounded-2xl border border-(--border) bg-(--bg-card) p-7 text-center"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-(--color-primary) text-xl font-bold text-(--text-light)">
                  {index + 1}
                </div>

                <h3 className="mt-5 text-lg font-bold">
                  {step.title}
                </h3>

                <p className="mt-3 leading-7 text-(--text-secondary)">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-24">
          <div className="rounded-3xl bg-(--color-primary) p-10 text-center text-(--text-light) sm:p-16">
            <h2 className="text-4xl font-black sm:text-5xl">
              Take control of your workload
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 opacity-90">
              Create your StudyFlow account and turn your classes,
              deadlines, and study sessions into a clear plan you can
              actually follow.
            </p>

            <Link
              to="/register"
              className="mt-10 inline-block rounded-xl bg-(--bg-card) px-8 py-4 font-bold text-(--text-primary) transition hover:opacity-90"
            >
              Create your free account
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Landing