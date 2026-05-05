import { TaskStatus } from '../types/task';

/**
 * Retrieves the initial search term and status filter from the URL query parameters.
 * Validates the status to ensure it matches the TaskStatus type or 'all'.
 */
export const getInitialFiltersFromUrl = (): { search: string; status: TaskStatus | 'all' } => {
  if (typeof window === 'undefined') return { search: '', status: 'all' };
  
  const params = new URLSearchParams(window.location.search);
  const statusParam = params.get('status');
  const isValidStatus = statusParam === 'all' || statusParam === 'todo' || statusParam === 'in-progress' || statusParam === 'done';
  
  return {
    search: params.get('search') || '',
    status: isValidStatus ? (statusParam as TaskStatus | 'all') : 'all'
  };
};
