import React from 'react'
import { TaskStatus } from '../types/task'
import styles from './TaskStats.module.css'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setStatusFilter, selectTaskCounts } from '../store/tasksSlice'

const TaskStats = () => {
  const dispatch = useAppDispatch();
  const statusFilter = useAppSelector(state => state.tasks.statusFilter);
  const counts = useAppSelector(selectTaskCounts);

  const filters: Array<{ value: TaskStatus | 'all'; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'todo', label: 'To Do' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
  ]

  return (
    <div className={styles.stats}>
      {filters.map(f => (
        <button
          key={f.value}
          className={`${styles.statCard} ${statusFilter === f.value ? styles.active : ''}`}
          onClick={() => dispatch(setStatusFilter(f.value))}
          aria-pressed={statusFilter === f.value}
        >
          <span className={styles.statCount}>{counts[f.value as keyof typeof counts]}</span>
          <span className={styles.statLabel}>{f.label}</span>
        </button>
      ))}
    </div>
  )
}

export default TaskStats
