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