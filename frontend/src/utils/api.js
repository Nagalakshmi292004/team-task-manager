import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
});

// API.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = 'Bearer ' + token;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const signup = (data) => API.post('/auth/signup', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const searchUsers = (email) => API.get(`/auth/users?email=${email}`);

// Projects
export const getProjects = () => API.get('/projects');
export const createProject = (data) => API.post('/projects', data);
export const getProject = (id) => API.get(`/projects/${id}`);
export const updateProject = (id, data) => API.put(`/projects/${id}`, data);
export const deleteProject = (id) => API.delete(`/projects/${id}`);
export const addMember = (projectId, userId) => API.post(`/projects/${projectId}/members`, { userId });
export const removeMember = (projectId, userId) => API.delete(`/projects/${projectId}/members/${userId}`);

// Tasks
export const getTasks = (projectId) => API.get(`/tasks?projectId=${projectId}`);
export const createTask = (data) => API.post('/tasks', data);
export const updateTask = (id, data) => API.put(`/tasks/${id}`, data);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);

// Dashboard
export const getDashboard = () => API.get('/dashboard');
