// ⚠️  ASSESSMENT NOTE FOR REVIEWERS (remove before sending to candidates):
//
// Deliberate flaws in this file:
//   FLAW 1 — All application state lives here and is prop-drilled 3-4 levels
//             deep into child components. Candidates should identify this and
//             propose/implement a proper state management solution.
//   FLAW 2 — API calls are made directly inside this component with no
//             abstraction. Error state exists but loading/error UI is minimal.
//             There is also no cleanup of the async call if the component
//             unmounts (potential memory-leak / state-update-on-unmounted
//             component warning). (Note: mostly mitigated by functional conversion but architecture issue remains).

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { fetchTasks, updateTaskStatus } from './api/tasks'
import { Task, TaskStatus } from './types/task'
import TaskList from './components/TaskList'
import TaskStats from './components/TaskStats'
import AddTaskForm from './components/AddTaskForm'
import styles from './App.module.css'

const App = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all')
  const [showAddForm, setShowAddForm] = useState<boolean>(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)
    
    fetchTasks()
      .then(fetchedTasks => {
        if (isMounted) {
          setTasks(fetchedTasks)
          setLoading(false)
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load tasks')
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [tasks, searchTerm, statusFilter])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }, [])

  const handleStatusFilterChange = useCallback((status: TaskStatus | 'all') => {
    setStatusFilter(status)
  }, [])

  const handleStatusUpdate = useCallback(async (taskId: string, newStatus: TaskStatus) => {
    // FLAW: No optimistic update — the UI freezes until the API call resolves.
    // No error handling if the API call fails mid-flight.
    try {
      const updated = await updateTaskStatus(taskId, newStatus)
      setTasks(prev => prev.map(t => (t.id === updated.id ? updated : t)))
    } catch {
      // silently fails — no user feedback
    }
  }, [])

  const handleTaskAdded = useCallback((task: Task) => {
    setTasks(prev => [task, ...prev])
    setShowAddForm(false)
  }, [])

  const handleSelectTask = useCallback((id: string) => {
    setSelectedTaskId(prev => (prev === id ? null : id))
  }, [])

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>Task Dashboard</h1>
        <button
          className={styles.addButton}
          onClick={() => setShowAddForm(prev => !prev)}
        >
          {showAddForm ? 'Cancel' : '+ Add Task'}
        </button>
      </header>

      {/* FLAW: props drilled through multiple layers — TaskList passes these
          further down to TaskCard and TaskStatusSelect */}
      <main className={styles.main}>
        <TaskStats
          tasks={tasks}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
        />

        {showAddForm && (
          <AddTaskForm onTaskAdded={handleTaskAdded} />
        )}

        <div className={styles.toolbar}>
          <input
            type="search"
            placeholder="Search tasks by title or description…"
            value={searchTerm}
            onChange={handleSearchChange}
            className={styles.searchInput}
            aria-label="Search tasks"
          />
          <span className={styles.resultCount}>
            {filteredTasks.length} of {tasks.length} tasks
          </span>
        </div>

        {loading && <div className={styles.loading}>Loading tasks…</div>}
        {error && <div className={styles.error}>{error}</div>}

        {!loading && !error && (
          // FLAW: entire list of 500 items renders to the DOM — no
          // virtualisation or pagination. Performance degrades badly.
          <TaskList
            tasks={filteredTasks}
            selectedTaskId={selectedTaskId}
            onSelectTask={handleSelectTask}
            onStatusUpdate={handleStatusUpdate}
            searchTerm={searchTerm}
          />
        )}
      </main>
    </div>
  )
}

export default App
