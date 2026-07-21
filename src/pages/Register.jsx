import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LuLeaf, LuLock, LuMail, LuUser } from 'react-icons/lu'
import { useAuth } from '../context/AuthContext'
import ThemeSwitcher from '../components/ThemeSwitcher'

function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const { signUpNewUser } = useAuth()
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Please enter your name')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const result = await signUpNewUser(name, email, password)

      if (result.success) {
        navigate('/login')
      } else {
        setError(result.error)
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-(--bg-page) text-(--text-primary)">
  

      <main className="mx-auto grid min-h-[calc(100vh-81px)] max-w-7xl items-center gap-16 px-6 py-16 lg:grid-cols-2">
        <section>
          <p className="font-bold uppercase tracking-[0.25em] text-(--color-secondary)">
            Join StudyFlow Today
          </p>

          <h1 className="mt-4 text-5xl font-black leading-none sm:text-6xl">
            Build better
            <br />
            study habits
          </h1>

          <p className="mt-6 max-w-xl text-lg text-(--text-secondary)">
            Create your account to organise classes, manage coursework and stay
            on top of every deadline
          </p>

          <button onClick={() => navigate('/')} className="p-3 mt-5 rounded-2xl mb-6 flex items-center gap-2 text-sm font-semibold text-(--text-light) transition bg-(--color-secondary)">
            GO BACK
          </button>
        </section>

        <section className="w-full">
          <div className="mx-auto w-full max-w-md rounded-3xl border border-(--border) bg-(--bg-card) p-8 shadow-xl sm:p-10">
            <div className="mb-8">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-(--color-primary) text-(--text-light)">
                <LuLeaf size={26} />
              </div>

              <h2 className="text-3xl font-black">
                Create account
              </h2>

              <p className="mt-2 text-(--text-secondary)">
                Start your StudyFlow journey today.
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              {error && (
                <div className="rounded-xl border border-(--error-border) bg-(--error-bg) px-4 py-3 text-sm font-semibold text-(--error-text)">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-bold"
                >
                  Full Name
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-(--border) bg-(--bg-input) px-4 py-3 focus-within:border-(--color-primary) focus-within:ring-2 focus-within:ring-(--color-primary)/20">
                  <LuUser
                    size={19}
                    className="text-(--color-secondary)"
                  />

                  <input
                    id="name"
                    type="text"
                    placeholder="John Smith"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    required
                    className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-(--text-placeholder)"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-bold"
                >
                  Email
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-(--border) bg-(--bg-input) px-4 py-3 focus-within:border-(--color-primary) focus-within:ring-2 focus-within:ring-(--color-primary)/20">
                  <LuMail
                    size={19}
                    className="text-(--color-secondary)"
                  />

                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-(--text-placeholder)"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-bold"
                >
                  Password
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-(--border) bg-(--bg-input) px-4 py-3 focus-within:border-(--color-primary) focus-within:ring-2 focus-within:ring-(--color-primary)/20">
                  <LuLock
                    size={19}
                    className="text-(--color-secondary)"
                  />

                  <input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    minLength={6}
                    required
                    className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-(--text-placeholder)"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-2 block text-sm font-bold"
                >
                  Confirm Password
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-(--border) bg-(--bg-input) px-4 py-3 focus-within:border-(--color-primary) focus-within:ring-2 focus-within:ring-(--color-primary)/20">
                  <LuLock
                    size={19}
                    className="text-(--color-secondary)"
                  />

                  <input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    minLength={6}
                    required
                    className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-(--text-placeholder)"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-(--color-primary) px-5 py-4 font-bold text-(--text-light) transition hover:bg-(--color-primary-hover) disabled:cursor-not-allowed disabled:bg-(--disabled)"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-(--text-secondary)">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-(--text-primary) underline decoration-(--border-accent) underline-offset-4"
              >
                Login
              </Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Register