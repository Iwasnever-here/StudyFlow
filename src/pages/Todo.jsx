import HeaderSection from '../components/pages/HeaderSection'
import FormModal from '../components/FormModal'
import TodoColumn from '../components/todo/TodoColumn'
import useTodos from '../hooks/useTodos'

const Todo = () => {
  const {
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
  } = useTodos()

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
          <div>
            <p
              className="
                text-sm font-semibold
                text-(--text-primary)
              "
            >
              Priority board
            </p>

            <p
              className="
                mt-1 text-sm
                text-(--text-muted)
              "
            >
              {todos.length}{' '}
              {todos.length === 1
                ? 'active task'
                : 'active tasks'}
            </p>
          </div>

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