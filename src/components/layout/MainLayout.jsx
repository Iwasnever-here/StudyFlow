import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

function MainLayout() {
  return (
    <div
  className="
    min-h-screen
    bg-(--bg-page)
    text-(--text-primary)
  "
  style={{
    backgroundImage: `
      linear-gradient(var(--grid) 1px, transparent 1px),
      linear-gradient(90deg, var(--grid) 1px, transparent 1px)
    `,
    backgroundSize: '30px 30px',
  }}
>
      <Sidebar />

      <main
        className=" mt-5 pt-16 md:pt-0 md:ml-72 min-h-screen p-4 sm:p-6 lg:p-8
        "
      >
        <Outlet />
       
        
      </main>
    </div>
  )
}

export default MainLayout