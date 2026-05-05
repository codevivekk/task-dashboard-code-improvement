import React, { useEffect, useCallback, useState } from 'react'
import TaskList from './components/TaskList'
import TaskStats from './components/TaskStats'
import AddTaskForm from './components/AddTaskForm'
import styles from './App.module.css'
import { useAppDispatch, useAppSelector } from './store/hooks'
import { fetchTasksAsync, toggleAddForm, setSearchTerm, selectFilteredTasks } from './store/tasksSlice'

const App = () => {
  const dispatch = useAppDispatch();
  
  const { items, loading, error, searchTerm: reduxSearchTerm, statusFilter, showAddForm } = useAppSelector((state: any) => state.tasks);
  const filteredTasks = useAppSelector(selectFilteredTasks);

  const [localSearchTerm, setLocalSearchTerm] = useState(reduxSearchTerm);

  useEffect(() => {
    dispatch(fetchTasksAsync());
  }, [dispatch]);


  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    if (reduxSearchTerm) {
      params.set('search', reduxSearchTerm);
    } else {
      params.delete('search');
    }
    
    if (statusFilter !== 'all') {
      params.set('status', statusFilter);
    } else {
      params.delete('status');
    }
    
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, [reduxSearchTerm, statusFilter]);

  useEffect(() => {
    const handler = setTimeout(() => {
      dispatch(setSearchTerm(localSearchTerm));
    }, 300);
    return () => clearTimeout(handler);
  }, [localSearchTerm, dispatch]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchTerm(e.target.value);
  }, []);

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
            value={localSearchTerm}
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
