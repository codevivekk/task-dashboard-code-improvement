// ⚠️  ASSESSMENT NOTE FOR REVIEWERS (remove before sending to candidates):
//
// Deliberate flaws in this file:
//   FLAW 1 — All application state lives here and is prop-drilled 3-4 levels
//             deep into child components. Candidates should identify this and
//             propose/implement a proper state management solution.
//   FLAW 2 — The useEffect on line ~60 has a missing dependency ('searchTerm').
//             This means the filtered list is stale after the first render and
//             the search box appears to do nothing until another state change
//             triggers a re-render. Subtle but impactful.
//   FLAW 3 — API calls are made directly inside this component with no
//             abstraction. Error state exists but loading/error UI is minimal.
//             There is also no cleanup of the async call if the component
//             unmounts (potential memory-leak / state-update-on-unmounted
//             component warning).

import React, { Component } from 'react'
import { fetchTasks, updateTaskStatus } from './api/tasks'
import { Task, TaskStatus } from './types/task'
import TaskList from './components/TaskList'
import TaskStats from './components/TaskStats'
import AddTaskForm from './components/AddTaskForm'
import styles from './App.module.css'

// ─── Types ────────────────────────────────────────────────────────────────────

type State = {
  tasks: Task[]
  loading: boolean
  error: string | null
  searchTerm: string
  statusFilter: TaskStatus | 'all'
  filteredTasks: Task[]
  showAddForm: boolean
  selectedTaskId: string | null
}

// ─── Component ────────────────────────────────────────────────────────────────

// FLAW: Class component. Should be converted to a functional component with hooks.
class App extends Component<Record<string, never>, State> {
  state: State = {
    tasks: [],
    loading: false,
    error: null,
    searchTerm: '',
    statusFilter: 'all',
    filteredTasks: [],
    showAddForm: false,
    selectedTaskId: null,
  }

  async componentDidMount() {
    this.setState({ loading: true, error: null })
    try {
      const tasks = await fetchTasks()
      this.setState({ tasks, filteredTasks: tasks, loading: false })
    } catch (err) {
      this.setState({
        error: err instanceof Error ? err.message : 'Failed to load tasks',
        loading: false,
      })
    }
  }

  // FLAW: filter logic re-runs on every render but is not memoised.
  // Also duplicated state (filteredTasks mirrors tasks with a filter applied)
  // which means the two can get out of sync.
  getFilteredTasks = () => {
    const { tasks, searchTerm, statusFilter } = this.state
    return tasks.filter(task => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }

  handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // FLAW: directly calling setState then re-filtering works but the
    // searchTerm used inside getFilteredTasks will always be one render behind
    // because setState is async. Candidates should notice the race condition.
    this.setState({ searchTerm: e.target.value })
  }

  handleStatusFilterChange = (status: TaskStatus | 'all') => {
    this.setState({ statusFilter: status })
  }

  handleStatusUpdate = async (taskId: string, newStatus: TaskStatus) => {
    // FLAW: No optimistic update — the UI freezes until the API call resolves.
    // No error handling if the API call fails mid-flight.
    try {
      const updated = await updateTaskStatus(taskId, newStatus)
      this.setState(prev => ({
        tasks: prev.tasks.map(t => (t.id === updated.id ? updated : t)),
      }))
    } catch {
      // silently fails — no user feedback
    }
  }

  handleTaskAdded = (task: Task) => {
    this.setState(prev => ({ tasks: [task, ...prev.tasks], showAddForm: false }))
  }

  handleSelectTask = (id: string) => {
    this.setState(prev => ({
      selectedTaskId: prev.selectedTaskId === id ? null : id,
    }))
  }

  render() {
    const { loading, error, searchTerm, statusFilter, showAddForm, selectedTaskId } = this.state
    const filteredTasks = this.getFilteredTasks()

    return (
      <div className={styles.app}>
        <header className={styles.header}>
          <h1 className={styles.title}>Task Dashboard</h1>
          <button
            className={styles.addButton}
            onClick={() => this.setState(prev => ({ showAddForm: !prev.showAddForm }))}
          >
            {showAddForm ? 'Cancel' : '+ Add Task'}
          </button>
        </header>

        {/* FLAW: props drilled through multiple layers — TaskList passes these
            further down to TaskCard and TaskStatusSelect */}
        <main className={styles.main}>
          <TaskStats
            tasks={this.state.tasks}
            statusFilter={statusFilter}
            onStatusFilterChange={this.handleStatusFilterChange}
          />

          {showAddForm && (
            <AddTaskForm onTaskAdded={this.handleTaskAdded} />
          )}

          <div className={styles.toolbar}>
            <input
              type="search"
              placeholder="Search tasks by title or description…"
              value={searchTerm}
              onChange={this.handleSearchChange}
              className={styles.searchInput}
              aria-label="Search tasks"
            />
            <span className={styles.resultCount}>
              {filteredTasks.length} of {this.state.tasks.length} tasks
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
              onSelectTask={this.handleSelectTask}
              onStatusUpdate={this.handleStatusUpdate}
              searchTerm={searchTerm}
            />
          )}
        </main>
      </div>
    )
  }
}

export default App
