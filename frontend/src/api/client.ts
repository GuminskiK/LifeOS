import axios, { InternalAxiosRequestConfig } from 'axios';

// Konfiguracje bazowych URL-i dla poszczególnych mikroserwisów
export const authApi = axios.create({ baseURL: 'http://localhost:8001' });
export const notesApi = axios.create({ baseURL: 'http://localhost:8002' });
export const tasksApi = axios.create({ baseURL: 'http://localhost:8003' });
export const workoutApi = axios.create({ baseURL: 'http://localhost:8004' });
export const smaApi = axios.create({ baseURL: 'http://localhost:8005' });

const addTokenToRequest = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

// Dodajemy interceptory aby upewnić się, że token JWT (kiedy będzie zaimplementowany) pojawia się w zapytaniach
[authApi, notesApi, tasksApi, workoutApi, smaApi].forEach((apiInstance) => {
  apiInstance.interceptors.request.use(addTokenToRequest);
});

export default {
  auth: authApi,
  notes: notesApi,
  tasks: tasksApi,
  workout: workoutApi,
  sma: smaApi,
};