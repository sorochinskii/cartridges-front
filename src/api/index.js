import axios from 'axios'
import store from '@/store/auth'
import { API_BASE_URL } from '@/config/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = store.state.accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Защита от undefined response
    if (!error.response) {
      console.error('Network error:', error)
      return Promise.reject({
        response: {
          status: 503,
          data: { message: 'Network Error' },
        },
      })
    }

    const originalRequest = error.config

    // Проверяем статус через безопасное обращение
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const newToken = await store.dispatch('refreshToken')
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (refreshError) {
        await store.dispatch('logout')
        window.location.href = '/login'
        return Promise.reject({
          response: {
            status: 401,
            data: { message: 'Session expired' },
          },
        })
      }
    }

    return Promise.reject(error)
  },
)

export default api
