import React from 'react'
import HeaderSection from '../components/pages/HeaderSection'

const Coursework = () => {
  return (
    <div>
      <HeaderSection 
      eyebrow="Coursework"
      title="Your Coursework"
      description="Keep on track with your assignments in one place."
      buttonText="Add Assignment"
      onButtonClick={() => console.log('Add Assignment button clicked')}
      />
    </div>
  )
}

export default Coursework
