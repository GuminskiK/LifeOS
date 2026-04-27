import axios, { InternalAxiosRequestConfig } from 'axios';

// Konfiguracje bazowych URL-i dla poszczególnych mikroserwisów
export const authApi = axios.create({ baseURL: 'http://localhost:8001/api' });
export const notesApi = axios.create({ baseURL: 'http://localhost:8002/api' });
export const tasksApi = axios.create({ baseURL: 'http://localhost:8003/api' });
export const workoutApi = axios.create({ baseURL: 'http://localhost:8004/api' });
export const smaApi = axios.create({ baseURL: 'http://localhost:8005/api' });

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
  
  // Dodatkowy interceptor dla logowania błędów połączenia (przydatne przy mikroserwisach)
  apiInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Clear token on 401 Unauthorized and redirect (only if not already on login page)
        localStorage.removeItem('token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      if (!error.response) {
        console.warn(`Błąd połączenia z serwisem: ${apiInstance.defaults.baseURL}. Czy mikroserwis jest włączony?`);
      }
      return Promise.reject(error);
    }
  );
});

export default {
  auth: authApi,
  notes: notesApi,
  tasks: tasksApi,
  workout: workoutApi,
  sma: smaApi,
};