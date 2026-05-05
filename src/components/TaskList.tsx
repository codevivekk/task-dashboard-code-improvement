import React, { useState, useEffect } from 'react'
import TaskCard from './TaskCard'
import styles from './TaskList.module.css'
import { useAppSelector } from '../store/hooks'
import { selectFilteredTasks } from '../store/tasksSlice'

const PAGE_SIZE = 50;

const TaskList = () => {
  const tasks = useAppSelector(selectFilteredTasks);
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
          <TaskCard key={task.id} task={task} />
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
