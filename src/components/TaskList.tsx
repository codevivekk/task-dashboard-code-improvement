// ⚠️  ASSESSMENT NOTE FOR REVIEWERS (remove before sending to candidates):
//
// Deliberate flaws in this file:
//   FLAW — This component receives and renders ALL tasks without any
//           windowing, virtualisation, or pagination. Rendering 500 DOM nodes
//           simultaneously causes significant layout and paint cost.
//           Candidates should implement pagination OR a windowed list
//           (e.g. react-window / react-virtual) OR infinite scroll.

import React from 'react'
import { Task, TaskStatus } from '../types/task'
import TaskCard from './TaskCard'
import styles from './TaskList.module.css'

type Props = {
  tasks: Task[]
  selectedTaskId: string | null
  onSelectTask: (id: string) => void
  onStatusUpdate: (taskId: string, newStatus: TaskStatus) => void
  searchTerm: string
}

// Straightforward functional component — the flaw is purely in what it renders
const TaskList = ({ tasks, selectedTaskId, onSelectTask, onStatusUpdate, searchTerm }: Props) => {
  if (tasks.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No tasks match your current filters.</p>
      </div>
    )
  }

  return (
    <ul className={styles.list} role="list">
      {/* FLAW: all 500 items rendered — no virtualisation */}
      {tasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          isSelected={selectedTaskId === task.id}
          onSelect={onSelectTask}
          onStatusUpdate={onStatusUpdate}
          searchTerm={searchTerm}
        />
      ))}
    </ul>
  )
}

export default TaskList
