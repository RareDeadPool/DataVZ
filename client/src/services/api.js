import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
});

// Attach token to every request if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

export async function uploadExcelFile(file, projectId = null) {
  const formData = new FormData();
  formData.append('file', file);
  if (projectId) {
    formData.append('projectId', projectId);
  }
  const res = await api.post('/excel/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
}

export async function getRecentUploads() {
  const res = await api.get('/excel/recent');
  return res.data;
}

export async function deleteUpload(id, token) {
  const res = await api.delete(`/excel/${id}`);
  return res.data;
}

export async function getUploadById(id, token) {
  const res = await api.get(`/excel/${id}`);
  return res.data;
}

export async function getUploadsByProject(projectId) {
  const res = await api.get(`/excel/project/${projectId}`);
  return res.data;
}

export async function getProjectById(projectId) {
  const res = await api.get(`/projects/${projectId}`);
  return res.data;
}

export async function getCharts(projectId = null) {
  const url = projectId ? `/charts?projectId=${projectId}` : '/charts';
  const res = await api.get(url);
  return res.data;
}

export async function createChart(chartData) {
  const res = await api.post('/charts', chartData);
  return res.data;
}

export async function updateChart(chartId, chartData) {
  const res = await api.put(`/charts/${chartId}`, chartData);
  return res.data;
}

export async function deleteChart(chartId) {
  const res = await api.delete(`/charts/${chartId}`);
  return res.data;
}





export async function askGeminiAI({ prompt, data }) {
  const res = await api.post('/ai/ask', { prompt, data });
  return res.data;
}

export async function saveChartHistory({ prompt, chartConfig, favorite }) {
  const res = await api.post('/ai/history', { prompt, chartConfig, favorite });
  return res.data;
}

export async function fetchChartHistory() {
  const res = await api.get('/ai/history');
  return res.data;
}

export async function toggleFavoriteChart(id) {
  const res = await api.post(`/ai/history/${id}/favorite`);
  return res.data;
}

export async function generateShareLink(id) {
  const res = await api.post(`/ai/history/${id}/share`);
  return res.data;
}

export async function fetchSharedChart(shareId) {
  const res = await api.get(`/ai/share/${shareId}`);
  return res.data;
}

export async function askGeminiSummary({ prompt, data }) {
  const res = await api.post('/ai/summary', { prompt, data });
  return res.data;
}

export async function shareProject(projectId) {
  const res = await api.post(`/projects/${projectId}/share`);
  return res.data;
}

export async function acceptSharedProject(token) {
  const res = await api.post('/projects/accept-shared', { token });
  return res.data;
}

export async function updateProfile(profileData) {
  const res = await api.put('/auth/profile', profileData);
  return res.data;
} 