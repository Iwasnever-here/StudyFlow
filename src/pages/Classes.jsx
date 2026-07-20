import React from 'react'
import HeaderSection from '../components/pages/HeaderSection'

const Classes = () => {
  return (
    <div>
      <HeaderSection 
      eyebrow="Classes"
      title="Your Classes"
      description="Manage your classes and stay organized with ease."
      buttonText="Add Class"
      onButtonClick={() => console.log('Add Class button clicked')}
      />
    </div>
  )
}

export default Classes
