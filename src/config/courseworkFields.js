 const courseworkFields = useMemo(
    () => [
      {
        name: 'class_id',
        label: 'Class',
        type: 'select',
        required: true,
        options: classes.map((classItem) => ({
          label: classItem.code
            ? `${classItem.code} — ${classItem.name}`
            : classItem.name,
          value: classItem.id,
        })),
      },
      {
        name: 'title',
        label: 'Coursework Title',
        type: 'text',
        placeholder: 'Enter coursework title',
        required: true,
      },
      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Enter coursework details',
      },
      {
        name: 'due_date',
        label: 'Due Date',
        type: 'date',
        required: true,
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        options: [
          {
            label: 'Not Started',
            value: 'not_started',
          },
          {
            label: 'In Progress',
            value: 'in_progress',
          },
          {
            label: 'Completed',
            value: 'completed',
          },
        ],
      },
      {
        name: 'hours',
        label: 'Estimated Hours',
        type: 'number',
        placeholder: 'Enter estimated hours',
      },
      {
        name: 'grade',
        label: 'Grade (%)',
        type: 'number',
        placeholder: 'Leave blank until marked',
      },
    ],
    [classes]
  )