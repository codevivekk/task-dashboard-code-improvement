import { TaskStatus } from '../types/task';


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
