// ⚠️  ASSESSMENT NOTE FOR REVIEWERS (remove before sending to candidates):
//
// Deliberate flaws in this file:
//   FLAW — Form state is managed with individual useState calls for each field
//           rather than a single form state object or a form library. More
//           importantly, there is NO loading or error state for the async
//           submit — the button is not disabled during submission, so double-
//           submits are possible, and if the API call fails the user sees
//           nothing. Candidates should add proper async submit handling.

import React, { useState } from 'react'
import { createTask } from '../api/tasks'
import { Task, TaskPriority, TaskStatus } from '../types/task'
import styles from './AddTaskForm.module.css'

type Props = {
  onTaskAdded: (task: Task) => void
}

const ASSIGNEES = ['Alice', 'Bob', 'Carol', 'David', 'Eve']

const AddTaskForm = ({ onTaskAdded }: Props) => {
  // FLAW: individual state per field — no single form state object,
  // no loading state, no error state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [assignee, setAssignee] = useState(ASSIGNEES[0])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // FLAW: no loading indicator, no disabled state, no error handling
    // Double-submit is possible — user can click Submit multiple times
    const newTask = await createTask({
      title,
      description,
      priority,
      status: 'todo' as TaskStatus,
      assignee,
    })
    onTaskAdded(newTask)
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <h2 className={styles.heading}>New Task</h2>

      <div className={styles.field}>
        <label htmlFor="task-title" className={styles.label}>Title *</label>
        <input
          id="task-title"
          type="text"
          className={styles.input}
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          minLength={3}
          placeholder="What needs to be done?"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="task-description" className={styles.label}>Description</label>
        <textarea
          id="task-description"
          className={styles.textarea}
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          placeholder="Add more detail…"
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="task-priority" className={styles.label}>Priority</label>
          <select
            id="task-priority"
            className={styles.select}
            value={priority}
            onChange={e => setPriority(e.target.value as TaskPriority)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="task-assignee" className={styles.label}>Assignee</label>
          <select
            id="task-assignee"
            className={styles.select}
            value={assignee}
            onChange={e => setAssignee(e.target.value)}
          >
            {ASSIGNEES.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.actions}>
        {/* FLAW: button is never disabled — double-submit risk */}
        <button type="submit" className={styles.submitButton}>
          Create Task
        </button>
      </div>
    </form>
  )
}

export default AddTaskForm
