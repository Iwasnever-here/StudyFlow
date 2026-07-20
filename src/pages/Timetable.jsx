import React from 'react'
import HeaderSection from '../components/pages/HeaderSection'

const Timetable = () => {
  return (
    <div>
      <HeaderSection 
      eyebrow="Timetable"
      title="Your Timetable"
      description="Organize your schedule and manage your time effectively."
      buttonText="Add Event"
      onButtonClick={() => console.log('Add Event button clicked')}
      />
    </div>
  )
}

export default Timetable
