import React, { useEffect, useCallback } from 'react'
import TaskList from './components/TaskList'
import TaskStats from './components/TaskStats'
import AddTaskForm from './components/AddTaskForm'
import styles from './App.module.css'
import { useAppDispatch, useAppSelector } from './store/hooks'
import { fetchTasksAsync, toggleAddForm, setSearchTerm, selectFilteredTasks } from './store/tasksSlice'

const App = () => {
  const dispatch = useAppDispatch();
  const { items, loading, error, searchTerm, showAddForm } = useAppSelector(state => state.tasks);
  const filteredTasks = useAppSelector(selectFilteredTasks);

  useEffect(() => {
    dispatch(fetchTasksAsync());
  }, [dispatch]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchTerm(e.target.value));
  }, [dispatch]);

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>Task Dashboard</h1>
        <button
          className={styles.addButton}
          onClick={() => dispatch(toggleAddForm())}
        >
          {showAddForm ? 'Cancel' : '+ Add Task'}
        </button>
      </header>

      <main className={styles.main}>
        <TaskStats />

        {showAddForm && (
          <AddTaskForm />
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
            {filteredTasks.length} of {items.length} tasks
          </span>
        </div>

        {loading && <div className={styles.loading}>Loading tasks…</div>}
        {error && <div className={styles.error}>{error}</div>}

        {!loading && !error && (
          <TaskList />
        )}
      </main>
    </div>
  )
}

export default App
