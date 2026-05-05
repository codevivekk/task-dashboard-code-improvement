import React, { memo, useCallback } from 'react'
import { Task } from '../types/task'
import TaskStatusSelect from './TaskStatusSelect'
import styles from './TaskCard.module.css'
import { highlightText } from '../utils/text'

type Props = {
  task: Task
  isSelected: boolean
  searchTerm: string
  onSelect: (taskId: string) => void
}



const TaskCard = ({ task, isSelected, searchTerm, onSelect }: Props) => {
  const priorityClass = styles[`priority_${task.priority}`]
  const statusClass = styles[`status_${task.status.replace('-', '_')}`]

  const handleSelect = useCallback(() => {
    onSelect(task.id)
  }, [onSelect, task.id])

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
        {highlightText(task.title, searchTerm, styles.highlight)}
      </h3>

      {isSelected && (
        <div className={styles.expanded}>
          <p className={styles.description}>
            {highlightText(task.description, searchTerm, styles.highlight)}
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
