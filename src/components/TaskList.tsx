import React, { useState, useEffect } from 'react'
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

const PAGE_SIZE = 50;

const TaskList = ({ tasks, selectedTaskId, onSelectTask, onStatusUpdate, searchTerm }: Props) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 when the task list changes (e.g. searching or filtering)
  useEffect(() => {
    setCurrentPage(1);
  }, [tasks]);

  if (tasks.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No tasks match your current filters.</p>
      </div>
    )
  }

  const totalPages = Math.ceil(tasks.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const visibleTasks = tasks.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <div className={styles.container}>
      <ul className={styles.list} role="list">
        {visibleTasks.map(task => (
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
      
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button 
            className={styles.pageButton} 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          >
            Previous
          </button>
          <span className={styles.pageInfo}>
            Page {currentPage} of {totalPages}
          </span>
          <button 
            className={styles.pageButton}
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default TaskList
