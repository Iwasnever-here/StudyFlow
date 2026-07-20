import React from 'react'
import HeaderSection from '../components/pages/HeaderSection'

const Review = () => {
  return (
    <div>
      <HeaderSection 
      eyebrow="Review"
      title="Your Review"
      description="Review your study statistics and track your progress over time."
      buttonText="Add Review"
      onButtonClick={() => console.log('Add Review button clicked')}
      />
    </div>
  )
}

export default Review
