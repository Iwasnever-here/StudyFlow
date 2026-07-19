import React from 'react'
import ThemeSwitcher from '../components/ThemeSwitcher'

    const Landing = () => {
  return (
    <div>
      landing
      <ThemeSwitcher />
      <button onClick={() => window.location.href = '/register'}>Get Started</button>
      <button onClick={() => window.location.href = '/login'}>Login</button>
    </div>
  )
}

export default Landing
