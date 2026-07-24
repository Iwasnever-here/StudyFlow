import { useEffect, useMemo, useState } from 'react'
import HeaderSection from '../components/pages/HeaderSection'
import FormModal from '../components/FormModal'
import TodoColumn from '../components/todo/TodoColumn'
import { supabase } from '../lib/supabaseClient'
import { initialTodoFields } from '../config/todoFields'

const TODO_INITIAL_VALUES = {
  title: '',
  priority: 'medium',
  class_id: '',
}

const Todo = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState(null)

  const [todos, setTodos] = useState([])
  const [classes, setClasses] = useState([])
  const [selectedClassId, setSelectedClassId] = useState('all')

  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState(null)

  const fetchPageData = async () => {
    setLoading(true)
    setPageError(null)

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      setPageError(userError.message)
      setLoading(false)
      return
    }

    if (!user) {
      setPageError(
        'You must be signed in to view your tasks.'
      )
      setLoading(false)
      return
    }

    const [todosResult, classesResult] =
      await Promise.all([
        supabase
          .from('todos')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', {
            ascending: false,
          }),

        supabase
          .from('classes')
          .select('id, name, code, color')
          .order('name', {
            ascending: true,
          }),
      ])

    const errors = [
      todosResult.error?.message,
      classesResult.error?.message,
    ].filter(Boolean)

    if (errors.length > 0) {
      setPageError(errors.join(' '))
    }

    setTodos(todosResult.data || [])
    setClasses(classesResult.data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchPageData()
  }, [])

  const todoFields = useMemo(
    () => initialTodoFields(classes),
    [classes]
  )

  const classesById = useMemo(() => {
    return classes.reduce(
      (classMap, classItem) => {
        classMap[classItem.id] = classItem
        return classMap
      },
      {}
    )
  }, [classes])

  const filteredTodos = useMemo(() => {
    if (selectedClassId === 'all') {
      return todos
    }

    if (selectedClassId === 'unassigned') {
      return todos.filter(
        (todo) => !todo.class_id
      )
    }

    return todos.filter(
      (todo) =>
        todo.class_id === selectedClassId
    )
  }, [todos, selectedClassId])

  const groupedTodos = useMemo(
    () => ({
      low: filteredTodos.filter(
        (todo) =>
          todo.priority?.toLowerCase() === 'low'
      ),

      medium: filteredTodos.filter(
        (todo) =>
          todo.priority?.toLowerCase() ===
          'medium'
      ),

      high: filteredTodos.filter(
        (todo) =>
          todo.priority?.toLowerCase() === 'high'
      ),
    }),
    [filteredTodos]
  )

  const openCreateModal = () => {
    setEditingTodo(null)
    setIsModalOpen(true)
  }

  const openEditModal = (todo) => {
    setEditingTodo(todo)
    setIsModalOpen(true)
  }

  const closeTodoModal = () => {
    setIsModalOpen(false)
    setEditingTodo(null)
  }

  const createTodo = async (formData) => {
    const title = formData.title.trim()

    if (!title) {
      throw new Error('Please enter a task.')
    }

    if (!formData.priority) {
      throw new Error(
        'Please choose a priority.'
      )
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      throw userError
    }

    if (!user) {
      throw new Error(
        'You must be signed in to create a task.'
      )
    }

    const newTodo = {
      title,
      priority: formData.priority,
      class_id: formData.class_id || null,
      completed: false,
      completed_at: null,
      user_id: user.id,
    }

    const { data, error } = await supabase
      .from('todos')
      .insert(newTodo)
      .select()
      .single()

    if (error) {
      throw error
    }

    setTodos((currentTodos) => [
      data,
      ...currentTodos,
    ])
  }

  const updateTodo = async (formData) => {
    if (!editingTodo) return

    const title = formData.title.trim()

    if (!title) {
      throw new Error('Please enter a task.')
    }

    if (!formData.priority) {
      throw new Error(
        'Please choose a priority.'
      )
    }

    const updates = {
      title,
      priority: formData.priority,
      class_id: formData.class_id || null,
    }

    const { data, error } = await supabase
      .from('todos')
      .update(updates)
      .eq('id', editingTodo.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === data.id ? data : todo
      )
    )
  }

  const handleTodoSubmit = async (formData) => {
    if (editingTodo) {
      await updateTodo(formData)
    } else {
      await createTodo(formData)
    }

    closeTodoModal()
  }

  const deleteTodo = async (todo) => {
    if (!todo) return

    setPageError(null)

    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', todo.id)

    if (error) {
      setPageError(error.message)
      return
    }

    setTodos((currentTodos) =>
      currentTodos.filter(
        (currentTodo) =>
          currentTodo.id !== todo.id
      )
    )
  }

  const completeTodo = async (todo) => {
    if (!todo) return

    setPageError(null)

    await new Promise((resolve) => {
      setTimeout(resolve, 2000)
    })

    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', todo.id)

    if (error) {
      setPageError(error.message)
      throw error
    }

    setTodos((currentTodos) =>
      currentTodos.filter(
        (currentTodo) =>
          currentTodo.id !== todo.id
      )
    )
  }

  const modalInitialValues = editingTodo
    ? {
        title: editingTodo.title || '',
        priority:
          editingTodo.priority || 'medium',
        class_id: editingTodo.class_id || '',
      }
    : TODO_INITIAL_VALUES

  return (
    <div>
      <HeaderSection
        eyebrow="Todo"
        title="Your Todo List"
        description="Organise tasks by priority and class."
        buttonText="Add Task"
        onButtonClick={openCreateModal}
      />

      <main className="mt-8">
        <div
          className="
            mb-6 flex flex-col gap-4
            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >


          <div className="w-full sm:w-64">
            <label
              htmlFor="todo-class-filter"
              className="
                mb-2 block text-xs font-semibold
                uppercase tracking-[0.12em]
                text-(--text-muted)
              "
            >
              Filter by class
            </label>

            <select
              id="todo-class-filter"
              value={selectedClassId}
              onChange={(event) =>
                setSelectedClassId(
                  event.target.value
                )
              }
              className="
                w-full rounded-xl
                border border-(--border)
                bg-(--bg-card)
                px-4 py-3
                text-sm
                text-(--text-primary)
                outline-none
                focus:border-(--border-accent)
                focus:ring-4
                focus:ring-(--color-primary)/15
              "
            >
              <option value="all">
                All classes
              </option>

              <option value="unassigned">
                No class
              </option>

              {classes.map((classItem) => (
                <option
                  key={classItem.id}
                  value={classItem.id}
                >
                  {classItem.code
                    ? `${classItem.name} (${classItem.code})`
                    : classItem.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {pageError && (
          <div
            className="
              mb-6 rounded-xl
              border border-(--error-border)
              bg-(--error-bg)
              px-4 py-3
            "
          >
            <p
              className="
                text-sm font-medium
                text-(--error-text)
              "
            >
              {pageError}
            </p>
          </div>
        )}

        {loading ? (
          <div
            className="
              rounded-3xl
              border border-(--border)
              bg-(--bg-card)
              px-6 py-16
              text-center
            "
          >
            <p
              className="
                text-sm
                text-(--text-muted)
              "
            >
              Loading tasks...
            </p>
          </div>
        ) : (
          <div
            className="
              grid items-start gap-5
              lg:grid-cols-3
            "
          >
            <TodoColumn
              title="Low Priority"
              priority="low"
              todos={groupedTodos.low}
              classesById={classesById}
              onComplete={completeTodo}
              onEdit={openEditModal}
              onDelete={deleteTodo}
            />

            <TodoColumn
              title="Medium Priority"
              priority="medium"
              todos={groupedTodos.medium}
              classesById={classesById}
              onComplete={completeTodo}
              onEdit={openEditModal}
              onDelete={deleteTodo}
            />

            <TodoColumn
              title="High Priority"
              priority="high"
              todos={groupedTodos.high}
              classesById={classesById}
              onComplete={completeTodo}
              onEdit={openEditModal}
              onDelete={deleteTodo}
            />
          </div>
        )}
      </main>

      <FormModal
        key={editingTodo?.id || 'new-todo'}
        isOpen={isModalOpen}
        title={
          editingTodo
            ? 'Edit Task'
            : 'Add Task'
        }
        fields={todoFields}
        initialValues={modalInitialValues}
        onSubmit={handleTodoSubmit}
        onClose={closeTodoModal}
      />
    </div>
  )
}

export default Todo