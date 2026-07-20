import React from 'react'
import HeaderSection from '../components/pages/HeaderSection'

const Todo = () => {
  return (
    <div>
      <HeaderSection 
      eyebrow="Todo"
      title="Your Todo List"
      description="Keep track of your tasks and stay productive."
      buttonText="Add Task"
      onButtonClick={() => console.log('Add Task button clicked')}
      />
    </div>
  )
}

export default Todo
