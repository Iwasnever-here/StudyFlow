import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

function MainLayout() {
  return (
    <div>
      <Sidebar />

      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout