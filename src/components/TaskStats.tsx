// ⚠️  ASSESSMENT NOTE FOR REVIEWERS (remove before sending to candidates):
//
// Deliberate flaws in this file:
//   FLAW — The stat counts are recalculated inline on every render with no
//           memoisation. With 500 tasks this is an unnecessary repeated
//           computation. Candidates should wrap with useMemo (once converted
//           to functional component) or move to a selector/derived state.

import React from 'react'
import { Task, TaskStatus } from '../types/task'
import styles from './TaskStats.module.css'

type Props = {
  tasks: Task[]
  statusFilter: TaskStatus | 'all'
  onStatusFilterChange: (status: TaskStatus | 'all') => void
}

// FLAW: also a class component — should be functional
class TaskStats extends React.Component<Props> {
  render() {
    const { tasks, statusFilter, onStatusFilterChange } = this.props

    // Recalculated on every render — no memoisation
    const counts = {
      all: tasks.length,
      todo: tasks.filter(t => t.status === 'todo').length,
      'in-progress': tasks.filter(t => t.status === 'in-progress').length,
      done: tasks.filter(t => t.status === 'done').length,
    }

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
            onClick={() => onStatusFilterChange(f.value)}
            aria-pressed={statusFilter === f.value}
          >
            <span className={styles.statCount}>{counts[f.value]}</span>
            <span className={styles.statLabel}>{f.label}</span>
          </button>
        ))}
      </div>
    )
  }
}

export default TaskStats
