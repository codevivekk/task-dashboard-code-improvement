import React from 'react'
import { TaskStatus } from '../types/task'
import styles from './TaskStatusSelect.module.css'
import { useAppDispatch } from '../store/hooks'
import { updateTaskStatusAsync } from '../store/tasksSlice'

type Props = {
  taskId: string
  currentStatus: TaskStatus
}

const STATUS_OPTIONS: TaskStatus[] = ['todo', 'in-progress', 'done']

const TaskStatusSelect = ({ taskId, currentStatus }: Props) => {
  const dispatch = useAppDispatch();

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    try {
      await dispatch(updateTaskStatusAsync({ 
        id: taskId, 
        status: e.target.value as TaskStatus,
        oldStatus: currentStatus
      })).unwrap();
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  }

  return (
    <label className={styles.label}>
      <span className={styles.labelText}>Move to:</span>
      <select
        className={styles.select}
        value={currentStatus}
        onChange={handleChange}
        aria-label="Change task status"
      >
        {STATUS_OPTIONS.map(status => (
          <option key={status} value={status}>
            {status === 'in-progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
          </option>
        ))}
      </select>
    </label>
  )
}

export default TaskStatusSelect
