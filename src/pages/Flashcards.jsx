import React from 'react'
import HeaderSection from '../components/pages/HeaderSection'

const Flashcards = () => {
  return (
    <div>
      <HeaderSection 
      eyebrow="Flashcards"
      title="Your Flashcards"
      description="Create and manage your flashcards for effective studying."
      buttonText="Add Flashcard"
      onButtonClick={() => console.log('Add Flashcard button clicked')}
      />
    </div>
  )
}

export default Flashcards
