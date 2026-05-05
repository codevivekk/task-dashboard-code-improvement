// ⚠️  ASSESSMENT NOTE FOR REVIEWERS (remove before sending to candidates):
//
// Deliberate flaws in this file:
//   FLAW — TaskCard is NOT wrapped in React.memo. Because the parent
//           re-renders on every keystroke (searchTerm change), all 500
//           TaskCard instances re-render even when their task data hasn't
//           changed. Combined with the list size, this creates a noticeable
//           input lag. Candidates should add React.memo and ensure stable
//           callback references via useCallback in the parent.

import React from 'react'
import { Task, TaskStatus } from '../types/task'
import TaskStatusSelect from './TaskStatusSelect'
import styles from './TaskCard.module.css'

type Props = {
  task: Task
  isSelected: boolean
  onSelect: (id: string) => void
  onStatusUpdate: (taskId: string, newStatus: TaskStatus) => void
  searchTerm: string
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

// FLAW: No React.memo — re-renders on every parent state change
const TaskCard = ({ task, isSelected, onSelect, onStatusUpdate, searchTerm }: Props) => {
  const priorityClass = styles[`priority_${task.priority}`]
  const statusClass = styles[`status_${task.status.replace('-', '_')}`]

  return (
    <li
      className={`${styles.card} ${isSelected ? styles.selected : ''}`}
      onClick={() => onSelect(task.id)}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onSelect(task.id) }}
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
              onStatusUpdate={onStatusUpdate}
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

export default TaskCard
