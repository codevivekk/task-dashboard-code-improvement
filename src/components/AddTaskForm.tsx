import React, { useState } from 'react'
import { TaskPriority, TaskStatus } from '../types/task'
import styles from './AddTaskForm.module.css'
import { useAppDispatch } from '../store/hooks'
import { createTaskAsync } from '../store/tasksSlice'

const ASSIGNEES = ['Alice', 'Bob', 'Carol', 'David', 'Eve']

const AddTaskForm = () => {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [assignee, setAssignee] = useState(ASSIGNEES[0])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return;

    setIsSubmitting(true)
    setError(null)
    
    try {
      await dispatch(createTaskAsync({
        title,
        description,
        priority,
        status: 'todo' as TaskStatus,
        assignee,
      })).unwrap()
    } catch (err) {
      setError('Failed to create task. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <h2 className={styles.heading}>New Task</h2>

      {error && <div className={styles.error}>{error}</div>}

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
          disabled={isSubmitting}
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
          disabled={isSubmitting}
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
          >
            {ASSIGNEES.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.actions}>
        <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Task'}
        </button>
      </div>
    </form>
  )
}

export default AddTaskForm
