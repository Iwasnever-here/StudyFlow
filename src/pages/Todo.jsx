import { useEffect, useState } from 'react'
import HeaderSection from '../components/pages/HeaderSection'
import FormModal from '../components/FormModal'
import { supabase } from '../lib/supabaseClient'

const Todo = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [todos, setTodos] = useState([])
  const [pageError, setPageError] = useState(null)

  const todoFields = [
    {
      name: 'title',
      label: 'Task',
      type: 'text',
      placeholder: 'What do you need to do?',
      required: true,
    },
    {
      name: 'priority',
      label: 'Priority',
      type: 'select',
      required: true,
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
      ],
    },
    {
      name: 'class_id',
      label: 'Class ID',
      type: 'text',
      placeholder: 'Optional class ID',
    },
  ]

  const fetchTodos = async () => {
    setPageError(null)

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      setPageError(userError.message)
      return
    }

    if (!user) {
      setPageError('You must be signed in to view your tasks.')
      return
    }

    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      setPageError(error.message)
      return
    }

    setTodos(data || [])
  }

  useEffect(() => {
    fetchTodos()
  }, [])

  const createTodo = async (formData) => {
    const title = formData.title.trim()

    if (!title) {
      throw new Error('Please enter a task.')
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) throw userError

    if (!user) {
      throw new Error('You must be signed in to create a task.')
    }

    const newTodo = {
      title,
      priority: formData.priority,
      completed: false,
      completed_at: null,
      user_id: user.id,
    }

    // Only include class_id when the user entered one.
    if (formData.class_id?.trim()) {
      newTodo.class_id = formData.class_id.trim()
    }

    const { data, error } = await supabase
      .from('todos')
      .insert(newTodo)
      .select()
      .single()

    if (error) throw error

    setTodos((currentTodos) => [data, ...currentTodos])
  }

  const toggleTodo = async (todo) => {
    const isCompleted = !todo.completed

    const { data, error } = await supabase
      .from('todos')
      .update({
        completed: isCompleted,
        completed_at: isCompleted
          ? new Date().toISOString()
          : null,
      })
      .eq('id', todo.id)
      .select()
      .single()

    if (error) {
      setPageError(error.message)
      return
    }

    setTodos((currentTodos) =>
      currentTodos.map((currentTodo) =>
        currentTodo.id === data.id ? data : currentTodo
      )
    )
  }

  return (
    <div>
      <HeaderSection
        eyebrow="Todo"
        title="Your Todo List"
        description="Keep track of your tasks and stay productive."
        buttonText="Add Task"
        onButtonClick={() => setIsModalOpen(true)}
      />

      {pageError && (
        <p className="error-message">
          {pageError}
        </p>
      )}

      

      <FormModal
        isOpen={isModalOpen}
        title="Add Task"
        fields={todoFields}
        initialValues={{
          title: '',
          priority: 'medium',
          class_id: '',
        }}
        onSubmit={createTodo}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}

export default Todo