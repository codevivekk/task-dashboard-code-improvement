import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { Task, TaskStatus } from '../types/task';
import { fetchTasks, updateTaskStatus, createTask } from '../api/tasks';

export interface TasksState {
  items: Task[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  statusFilter: TaskStatus | 'all';
  showAddForm: boolean;
  selectedTaskId: string | null;
}

const getInitialFilters = () => {
  if (typeof window === 'undefined') return { search: '', status: 'all' as TaskStatus | 'all' };
  const params = new URLSearchParams(window.location.search);
  const statusParam = params.get('status');
  const isValidStatus = statusParam === 'all' || statusParam === 'todo' || statusParam === 'in-progress' || statusParam === 'done';
  return {
    search: params.get('search') || '',
    status: isValidStatus ? (statusParam as TaskStatus | 'all') : 'all'
  };
};

const initialFilters = getInitialFilters();

const initialState: TasksState = {
  items: [],
  loading: false,
  error: null,
  searchTerm: initialFilters.search,
  statusFilter: initialFilters.status,
  showAddForm: false,
  selectedTaskId: null,
};

export const fetchTasksAsync = createAsyncThunk(
  'tasks/fetchTasks',
  async () => {
    return await fetchTasks();
  }
);

export const updateTaskStatusAsync = createAsyncThunk(
  'tasks/updateStatus',
  async ({ id, status, oldStatus }: { id: string; status: TaskStatus; oldStatus: TaskStatus }) => {
    return await updateTaskStatus(id, status);
  }
);

export const createTaskAsync = createAsyncThunk(
  'tasks/createTask',
  async (payload: Omit<Task, 'id' | 'createdAt'>) => {
    return await createTask(payload);
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<TaskStatus | 'all'>) => {
      state.statusFilter = action.payload;
    },
    toggleAddForm: (state) => {
      state.showAddForm = !state.showAddForm;
    },
    setShowAddForm: (state, action: PayloadAction<boolean>) => {
      state.showAddForm = action.payload;
    },
    toggleSelectTask: (state, action: PayloadAction<string>) => {
      state.selectedTaskId = state.selectedTaskId === action.payload ? null : action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasksAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasksAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTasksAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load tasks';
      })
      .addCase(updateTaskStatusAsync.pending, (state, action) => {
        const { id, status } = action.meta.arg;
        const task = state.items.find(t => t.id === id);
        if (task) {
          task.status = status;
        }
      })
      .addCase(updateTaskStatusAsync.fulfilled, (state, action) => {
        const index = state.items.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateTaskStatusAsync.rejected, (state, action) => {
        const { id, oldStatus } = action.meta.arg;
        const task = state.items.find(t => t.id === id);
        if (task) {
          task.status = oldStatus;
        }
        state.error = action.error.message || 'Failed to update task status';
      })
      .addCase(createTaskAsync.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.showAddForm = false;
      });
  },
});

export interface AppState {
  tasks: TasksState;
}

export const selectFilteredTasks = createSelector(
  [
    (state: AppState) => state.tasks.items,
    (state: AppState) => state.tasks.searchTerm,
    (state: AppState) => state.tasks.statusFilter
  ],
  (items, searchTerm, statusFilter) => {
    return items.filter(task => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }
);

export const selectTaskCounts = createSelector(
  [(state: AppState) => state.tasks.items],
  (items) => {
    return {
      all: items.length,
      todo: items.filter(t => t.status === 'todo').length,
      'in-progress': items.filter(t => t.status === 'in-progress').length,
      done: items.filter(t => t.status === 'done').length,
    };
  }
);

export const { setSearchTerm, setStatusFilter, toggleAddForm, setShowAddForm, toggleSelectTask } = tasksSlice.actions;
export default tasksSlice.reducer;
