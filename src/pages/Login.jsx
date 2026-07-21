
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LuLeaf, LuLock, LuMail } from 'react-icons/lu'
import { useAuth } from '../context/AuthContext'
import ThemeSwitcher from '../components/ThemeSwitcher'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const { signInUser } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await signInUser(email, password)

      if (result.success) {
        navigate('/dashboard')
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

      

      <main className="mx-auto grid min-h-[calc(100vh-81px)] max-w-7xl items-center gap-16 px-6 py-16 lg:grid-cols-2 ">
        <section>
          
          <p className="font-bold uppercase tracking-[0.25em] text-[(--color-secondary)]">
            Welcome back
          </p>

          <h1 className="mt-4 text-5xl font-black leading-none sm:text-6xl">
            Continue building
            <br />
            better study habits
          </h1>

          <p className="mt-6 max-w-xl text-lg text-(--text-secondary)">
            Log in to manage your classes, organise coursework and keep track
            of your progress
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
                Login
              </h2>

              <p className="mt-2 text-(--text-secondary)">
                Enter your details to access your account.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="rounded-xl border border-(--error-border) bg-(--error-bg) px-4 py-3 text-sm font-semibold text-(--error-text)">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-bold"
                >
                  Email
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-(--border) bg-(--bg-input) px-4 py-3 transition focus-within:border-(--color-primary) focus-within:ring-2 focus-within:ring-(--color-primary)/20">
                  <LuMail
                    size={19}
                    className="shrink-0 text-(--color-secondary)"
                  />

                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    className="w-full bg-transparent text-sm font-medium text-(--text-primary) outline-none placeholder:text-(--text-placeholder)"
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

                <div className="flex items-center gap-3 rounded-xl border border-(--border) bg-(--bg-input) px-4 py-3 transition focus-within:border-(--color-primary) focus-within:ring-2 focus-within:ring-(--color-primary)/20">
                  <LuLock
                    size={19}
                    className="shrink-0 text-(--color-secondary)"
                  />

                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    className="w-full bg-transparent text-sm font-medium text-(--text-primary) outline-none placeholder:text-(--text-placeholder)"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-(--color-primary) px-5 py-4 font-bold text-(--text-light) transition hover:bg-(--color-primary-hover) disabled:cursor-not-allowed disabled:bg-(--disabled)"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-(--text-secondary)">
              Don&apos;t have an account?{' '}
              <Link
                to="/register"
                className="font-bold text-(--text-primary) underline decoration-(--border-accent) underline-offset-4"
              >
                Create account
              </Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Login

