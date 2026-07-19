import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LuLeaf, LuLock, LuMail } from 'react-icons/lu'
import { useAuth } from '../context/AuthContext'

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
    <div>
      <div />

      <div>
        <div>
          <div>
            <LuLeaf size={26} />
          </div>

          <p>StudyFlow</p>

          <h1>Welcome back</h1>
        </div>

        <form onSubmit={handleLogin}>
          {error && <div>{error}</div>}

          <div>
            <label>Email</label>

            <div>
              <LuMail size={19} />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label>Password</label>

            <div>
              <LuLock size={19} />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p>
          Don&apos;t have an account?{' '}
          <Link to="/register">
            Create account
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login