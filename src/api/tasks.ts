import { Task, User } from '../types/task'

// Simulated network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// ─── Seed data ────────────────────────────────────────────────────────────────

const STATUSES = ['todo', 'in-progress', 'done'] as const
const PRIORITIES = ['low', 'medium', 'high'] as const
const ASSIGNEES = ['Alice', 'Bob', 'Carol', 'David', 'Eve']

const generateTasks = (): Task[] =>
  Array.from({ length: 500 }, (_, i) => ({
    id: `task-${i + 1}`,
    title: `Task ${i + 1}: ${['Implement', 'Review', 'Fix', 'Deploy', 'Test', 'Design'][i % 6]} ${['authentication', 'dashboard', 'API', 'UI components', 'unit tests', 'CI pipeline'][i % 6]}`,
    description: `This is the description for task ${i + 1}. It contains details about what needs to be done.`,
    status: STATUSES[i % 3],
    priority: PRIORITIES[i % 3],
    assignee: ASSIGNEES[i % 5],
    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
  }))

// In-memory store so mutations persist across API calls within a session
let taskStore: Task[] = generateTasks()

export const MOCK_USERS: User[] = ASSIGNEES.map((name, i) => ({
  id: `user-${i + 1}`,
  name,
  avatar: name[0].toUpperCase(),
}))

// ─── API functions ────────────────────────────────────────────────────────────

export const fetchTasks = async (): Promise<Task[]> => {
  await delay(600)
  return [...taskStore]
}

export const fetchTask = async (id: string): Promise<Task> => {
  await delay(300)
  const task = taskStore.find(t => t.id === id)
  if (!task) throw new Error(`Task ${id} not found`)
  return { ...task }
}

export const updateTaskStatus = async (id: string, status: Task['status']): Promise<Task> => {
  await delay(400)
  const index = taskStore.findIndex(t => t.id === id)
  if (index === -1) throw new Error(`Task ${id} not found`)
  taskStore[index] = { ...taskStore[index], status }
  return { ...taskStore[index] }
}

export const createTask = async (payload: Omit<Task, 'id' | 'createdAt'>): Promise<Task> => {
  await delay(500)
  const newTask: Task = {
    ...payload,
    id: `task-${Date.now()}`,
    createdAt: new Date().toISOString(),
  }
  taskStore = [newTask, ...taskStore]
  return newTask
}
