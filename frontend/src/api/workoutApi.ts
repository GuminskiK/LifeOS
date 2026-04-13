import { workoutApi } from './client';

export interface Exercise {
  id: number;
  name: string;
  description?: string;
  media_url?: string;
}

export interface WorkoutStep {
  id: number;
  exercise_id: number;
  exercise?: Exercise;
  order_index: number;
  type: 'exercise' | 'rest';
  goal_type: 'reps' | 'time';
  goal_value: number;
}

export interface WorkoutTemplate {
  id: number;
  name: string;
  steps: WorkoutStep[];
}

export interface SessionState {
  session_id: number;
  workout_name: string;
  status: 'active' | 'paused' | 'finished';
  current_step_index: number;
  steps: WorkoutStep[];
}

// Exercises
export const fetchExercises = () => workoutApi.get<Exercise[]>('/workout/exercise').then((res: { data: Exercise[] }) => res.data);
export const createExercise = (data: Partial<Exercise>) => workoutApi.post<Exercise>('/workout/exercise', data).then(res => res.data);

// Workouts
export const fetchWorkouts = () => workoutApi.get<WorkoutTemplate[]>('/workout/workout').then((res: { data: WorkoutTemplate[] }) => res.data);
export const createWorkout = (data: any) => workoutApi.post<WorkoutTemplate>('/workout/workout', data).then(res => res.data);

// Session Operations (Live)
export const startSession = (workoutId: number) => 
  workoutApi.post<SessionState>(`/workout/workout_session/start/${workoutId}`).then((res: { data: SessionState }) => res.data);

export const getSessionState = (sessionId: number) => 
  workoutApi.get<SessionState>(`/workout/workout_session/${sessionId}`).then((res: { data: SessionState }) => res.data);

export const pauseSession = (sessionId: number) => 
  workoutApi.post<SessionState>(`/workout/workout_session/${sessionId}/pause`).then((res: { data: SessionState }) => res.data);

export const resumeSession = (sessionId: number) => 
  workoutApi.post<SessionState>(`/workout/workout_session/${sessionId}/resume`).then((res: { data: SessionState }) => res.data);

export const adjustSession = (sessionId: number, adjustment: number) => 
  workoutApi.post<SessionState>(`/workout/workout_session/${sessionId}/adjust`, { adjustment }).then((res: { data: SessionState }) => res.data);

export const nextStep = (sessionId: number, actualPerformance: number) => 
  workoutApi.post<SessionState>(`/workout/workout_session/${sessionId}/next`, { actual_performance: actualPerformance }).then((res: { data: SessionState }) => res.data);

export const finishSession = (sessionId: number) => 
  workoutApi.post(`/workout/workout_session/${sessionId}/finish`).then(res => res.data);

export const fetchStats = () => 
  workoutApi.get('/workout/statistics/user-total-stats').then((res: { data: any }) => res.data);