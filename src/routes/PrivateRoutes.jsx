import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PrivateRoute = ({ children }) => {
  const { session } = useAuth()
  if (session === undefined) {
    // Still loading session, you can show a loading spinner here
    return <div>Loading...</div>
  }

  return session ? children : <Navigate to="/" />
}

export default PrivateRoute