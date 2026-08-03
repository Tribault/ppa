// src/lib/axios.ts
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { resolvedLocale } from '@/i18n'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
})

// Request interceptor to add the token and current UI language
api.interceptors.request.use(
  (config) => {
    const auth = useAuthStore()
    if (auth.token) {
      config.headers.Authorization = `Bearer ${auth.token}`
    }
    config.headers['Accept-Language'] = resolvedLocale
    return config
  },
  (error) => Promise.reject(error),
)

export default api
