import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import tasksReducer from '../store/tasksSlice';
import App from '../App';
import * as api from '../api/tasks';
import { Task } from '../types/task';

// Mock the API layer
jest.mock('../api/tasks');

const mockFetchTasks = api.fetchTasks as jest.Mock;
const mockCreateTask = api.createTask as jest.Mock;
const mockUpdateTaskStatus = api.updateTaskStatus as jest.Mock;

const renderApp = () => {
  const store = configureStore({
    reducer: {
      tasks: tasksReducer,
    },
  });

  return render(
    <Provider store={store}>
      <App />
    </Provider>
  );
};

describe('Task Dashboard Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('loads and displays tasks from the API', async () => {
    const mockTasks: Task[] = [
      { id: '1', title: 'Test Task 1', description: 'Desc 1', status: 'todo', priority: 'high', assignee: 'Alice', createdAt: new Date().toISOString() },
    ];
    mockFetchTasks.mockResolvedValueOnce(mockTasks);

    renderApp();

    expect(screen.getByText(/loading tasks/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });
  });

  test('allows a user to create a new task', async () => {
    mockFetchTasks.mockResolvedValueOnce([]);
    mockCreateTask.mockResolvedValueOnce({
      id: '2', title: 'New Integration Task', description: 'New Desc', status: 'todo', priority: 'medium', assignee: 'Bob', createdAt: new Date().toISOString()
    });

    renderApp();

    await waitFor(() => {
      expect(screen.queryByText(/loading tasks/i)).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('+ Add Task'));

    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Title \*/i), { target: { value: 'New Integration Task' } });
      fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'New Desc' } });
    });
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Create Task/i }));
      // flush promises
      await new Promise(r => setTimeout(r, 10));
    });

    await waitFor(() => {
      expect(mockCreateTask).toHaveBeenCalledWith(expect.objectContaining({
        title: 'New Integration Task',
        description: 'New Desc',
      }));
    });

    await waitFor(() => {
      expect(screen.getByText('New Integration Task')).toBeInTheDocument();
    });
  });

  test('updates task status optimistically and handles server response', async () => {
    const task: Task = { id: '3', title: 'Status Task', description: 'Desc', status: 'todo', priority: 'low', assignee: 'Carol', createdAt: new Date().toISOString() };
    mockFetchTasks.mockResolvedValueOnce([task]);
    mockUpdateTaskStatus.mockResolvedValueOnce({ ...task, status: 'done' });

    renderApp();

    await waitFor(() => {
      expect(screen.getByText('Status Task')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Status Task'));

    const select = screen.getByLabelText(/Change task status/i);
    
    await act(async () => {
      fireEvent.change(select, { target: { value: 'done' } });
      // flush promises
      await new Promise(r => setTimeout(r, 10));
    });

    await waitFor(() => {
      expect(mockUpdateTaskStatus).toHaveBeenCalledWith('3', 'done');
    });

    expect(select).toHaveValue('done');
  });
});
