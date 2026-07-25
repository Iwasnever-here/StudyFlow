import { Routes, Route } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import PrivateRoutes from './PrivateRoutes'

import Dashboard from '../pages/Dashboard'
import Classes from '../pages/Classes'
import Timetable from '../pages/Timetable'
import Coursework from '../pages/Coursework'
import Flashcards from '../pages/Flashcards'
import ToDo from '../pages/ToDo'
import Review from '../pages/Review'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Landing from '../pages/Landing'
import ClassDetails from '../pages/ClassDetails'
import FlashcardSet from '../pages/FlashcardSet'

function AppRoutes() {
  return (
    <Routes>

      {/* Public Routes */}
      <Route path = '/' element = {<Landing />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      {/* Private Routes */}
      <Route
        element={
          <PrivateRoutes>
            <MainLayout />
          </PrivateRoutes>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/classes" element={<Classes />} />
        <Route path="/timetable" element={<Timetable />} />
        <Route path="/coursework" element={<Coursework />} />
        <Route path="/flashcards" element={<Flashcards />} />
        <Route path="/todo" element={<ToDo />} />
        <Route path="/review" element={<Review />} />

        {/* extras */}
      <Route path="/classes/:classId" element={<ClassDetails />} />
      <Route path="/flashcards/:setId" element={<FlashcardSet />}/>
      {/*<Route path="/flashcards/:setId/quiz" element={<FlashcardQuiz />}/>*/}
      {/*<Route path="/flashcards/:setId/game" element={<FlashcardGame />} />*/}
      {/* Private Routes */}
      </Route>

    </Routes>
  )
}

export default AppRoutes