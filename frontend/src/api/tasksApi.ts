import { tasksApi } from './client';

export interface Task {
  id: number;
  name: string;
  description?: string;
  type: 'habit' | 'timed_task' | 'task' | 'timed_milestone' | 'milestone' | 'event' | 'holiday';
  start_date?: string;
  end_date?: string;
  priority?: number;
  recurrence?: string;
  xp_reward: number;
  currency_reward: number;
  is_archived: boolean;
  category_id?: number;
  parent_id?: number;
}

export interface Vault {
  currency_total: number;
  xp_total: number;
}

export interface Goal {
  id: number;
  streak_id?: number;
  length: number;
  reward: number;
  is_archive: boolean;
}

export interface Reward {
  id: number;
  name: string;
  description?: string;
  price: number;
  quantity_left: number;
}

export interface Streak {
  id: number;
  length: number;
  length_type: 'year' | 'month' | 'week' | 'day';
  counter: number;
  max_length: number;
  occurance_per_length: number;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

  // Pobieranie listy zadań
export const fetchTasks = async (): Promise<Task[]> => {
  const response = await tasksApi.get(`/tasks/`);
  return response.data;
}

// Oznaczanie zadania jako wykonane (wyzwala przyznanie XP i monet)
export const completeTask = async(taskId: number) : Promise<Task> => {
  const response = await tasksApi.post(`/tasks/${taskId}/done`);
  return response.data;
}

// Cofnięcie wykonania
export const undoTask = async (taskId: number): Promise<Task> => {
  const response = await tasksApi.post(`/tasks/${taskId}/undone`);
  return response.data;
};

// Pobieranie stanu portfela użytkownika
export const getVault = async () : Promise<Vault> => {
  const response = await tasksApi.get<Vault>(`/vault/me`);
  return response.data;
}

// Dodawanie nowego zadania
export const createTask = async (task: Partial<Task>) : Promise<Task>=> {
  const response = await tasksApi.post<Task>(`/tasks`, task);
  return response.data;
}

export const fetchGoals = async (): Promise<Goal[]> => {
  const response = await tasksApi.get<Goal[]>('/goals');
  return response.data;
};

export const fetchRewards = async (): Promise<Reward[]> => {
  const response = await tasksApi.get<Reward[]>('/rewards');
  return response.data;
};

export const claimReward = async (rewardId: number): Promise<void> => {
  await tasksApi.post(`/rewards/${rewardId}/claim`);
};

export const fetchStreaks = async (): Promise<Streak[]> => {
  const response = await tasksApi.get<Streak[]>('/streaks');
  return response.data;
};

export const fetchCategories = async (): Promise<Category[]> => {
  const response = await tasksApi.get<Category[]>('/categories');
  return response.data;
};

export const fetchCategoryStats = async (): Promise<any> => {
  const response = await tasksApi.get('/categories/stats');
  return response.data;
};

export const fetchTaskForecast = async (start: string, end: string): Promise<any[]> => {
  const response = await tasksApi.get(`/tasks/forecast`, { params: { start, end } });
  return response.data;
};
