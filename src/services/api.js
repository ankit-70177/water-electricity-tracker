
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL =
  'https://certified-extraordinary-rip-thousands.trycloudflare.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach the JWT token to protected API requests
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('authToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
