import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { supabase } from '../lib/supabaseClient'
import { initialTodoFields } from '../config/todoFields'

export const TODO_INITIAL_VALUES = {
  title: '',
  priority: 'medium',
  class_id: '',
}

const COMPLETION_DELAY = 2000

const validateTodoForm = (formData) => {
  const title = formData.title?.trim()

  if (!title) {
    throw new Error('Please enter a task.')
  }

  if (!formData.priority) {
    throw new Error('Please choose a priority.')
  }

  return {
    title,
    priority: formData.priority,
    class_id: formData.class_id || null,
  }
}

const useTodos = () => {
  const [todos, setTodos] = useState([])
  const [classes, setClasses] = useState([])

  const [selectedClassId, setSelectedClassId] =
    useState('all')

  const [isModalOpen, setIsModalOpen] =
    useState(false)

  const [editingTodo, setEditingTodo] =
    useState(null)

  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] =
    useState(null)

  const getCurrentUser = useCallback(async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      throw error
    }

    if (!user) {
      throw new Error(
        'You must be signed in to manage your tasks.'
      )
    }

    return user
  }, [])

  const fetchPageData = useCallback(async () => {
    setLoading(true)
    setPageError(null)

    try {
      const user = await getCurrentUser()

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
        throw new Error(errors.join(' '))
      }

      setTodos(todosResult.data || [])
      setClasses(classesResult.data || [])
    } catch (error) {
      setPageError(
        error.message ||
          'Unable to load your tasks.'
      )
    } finally {
      setLoading(false)
    }
  }, [getCurrentUser])

  useEffect(() => {
    fetchPageData()
  }, [fetchPageData])

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

  const groupedTodos = useMemo(() => {
    const groups = {
      low: [],
      medium: [],
      high: [],
    }

    filteredTodos.forEach((todo) => {
      const priority =
        todo.priority?.toLowerCase()

      if (groups[priority]) {
        groups[priority].push(todo)
      }
    })

    return groups
  }, [filteredTodos])

  const openCreateModal = useCallback(() => {
    setEditingTodo(null)
    setIsModalOpen(true)
  }, [])

  const openEditModal = useCallback((todo) => {
    setEditingTodo(todo)
    setIsModalOpen(true)
  }, [])

  const closeTodoModal = useCallback(() => {
    setIsModalOpen(false)
    setEditingTodo(null)
  }, [])

  const createTodo = useCallback(
    async (formData) => {
      const validatedTodo =
        validateTodoForm(formData)

      const user = await getCurrentUser()

      const newTodo = {
        ...validatedTodo,
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
    },
    [getCurrentUser]
  )

  const updateTodo = useCallback(
    async (formData) => {
      if (!editingTodo) {
        throw new Error(
          'No task has been selected for editing.'
        )
      }

      const updates =
        validateTodoForm(formData)

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
    },
    [editingTodo]
  )

  const handleTodoSubmit = useCallback(
    async (formData) => {
      if (editingTodo) {
        await updateTodo(formData)
      } else {
        await createTodo(formData)
      }

      closeTodoModal()
    },
    [
      editingTodo,
      updateTodo,
      createTodo,
      closeTodoModal,
    ]
  )

  const deleteTodo = useCallback(
    async (todo) => {
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
    },
    []
  )

  const completeTodo = useCallback(
    async (todo) => {
      if (!todo) return

      setPageError(null)

      await new Promise((resolve) => {
        setTimeout(resolve, COMPLETION_DELAY)
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
    },
    []
  )

  const modalInitialValues = useMemo(() => {
    if (!editingTodo) {
      return TODO_INITIAL_VALUES
    }

    return {
      title: editingTodo.title || '',
      priority:
        editingTodo.priority || 'medium',
      class_id: editingTodo.class_id || '',
    }
  }, [editingTodo])

  return {
    todos,
    classes,
    classesById,
    groupedTodos,

    selectedClassId,
    setSelectedClassId,

    loading,
    pageError,

    isModalOpen,
    editingTodo,
    todoFields,
    modalInitialValues,

    openCreateModal,
    openEditModal,
    closeTodoModal,

    handleTodoSubmit,
    deleteTodo,
    completeTodo,

    refetchTodos: fetchPageData,
  }
}

export default useTodos