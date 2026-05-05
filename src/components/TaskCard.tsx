import React, { memo, useCallback } from 'react'
import { Task } from '../types/task'
import TaskStatusSelect from './TaskStatusSelect'
import styles from './TaskCard.module.css'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { toggleSelectTask } from '../store/tasksSlice'

type Props = {
  task: Task
}

// Utility: wrap matched text in a <mark> for highlighting
const highlight = (text: string, term: string): React.ReactNode => {
  if (!term.trim()) return text
  const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)
  return parts.map((part, i) =>
    regex.test(part) ? <mark key={i} className={styles.highlight}>{part}</mark> : part
  )
}

const TaskCard = ({ task }: Props) => {
  const dispatch = useAppDispatch();
  const isSelected = useAppSelector(state => state.tasks.selectedTaskId === task.id);
  const searchTerm = useAppSelector(state => state.tasks.searchTerm);

  const priorityClass = styles[`priority_${task.priority}`]
  const statusClass = styles[`status_${task.status.replace('-', '_')}`]

  const handleSelect = useCallback(() => {
    dispatch(toggleSelectTask(task.id))
  }, [dispatch, task.id])

  return (
    <li
      className={`${styles.card} ${isSelected ? styles.selected : ''}`}
      onClick={handleSelect}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleSelect() }}
      aria-expanded={isSelected}
    >
      <div className={styles.cardHeader}>
        <div className={styles.cardMeta}>
          <span className={`${styles.priorityBadge} ${priorityClass}`}>
            {task.priority}
          </span>
          <span className={`${styles.statusBadge} ${statusClass}`}>
            {task.status}
          </span>
        </div>
        <span className={styles.assignee} title={`Assigned to ${task.assignee}`}>
          {task.assignee[0].toUpperCase()}
        </span>
      </div>

      <h3 className={styles.cardTitle}>
        {highlight(task.title, searchTerm)}
      </h3>

      {isSelected && (
        <div className={styles.expanded}>
          <p className={styles.description}>
            {highlight(task.description, searchTerm)}
          </p>
          <div className={styles.actions} onClick={e => e.stopPropagation()}>
            <TaskStatusSelect
              taskId={task.id}
              currentStatus={task.status}
            />
          </div>
          <time className={styles.date} dateTime={task.createdAt}>
            Created: {new Date(task.createdAt).toLocaleDateString()}
          </time>
        </div>
      )}
    </li>
  )
}

export default memo(TaskCard)
