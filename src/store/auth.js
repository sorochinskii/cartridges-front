import { createStore } from 'vuex'
import { API_BASE_URL } from '@/config/api'
import axios from 'axios'
export default createStore({
  state: {
    accessToken: null,
    user: null,
  },
  mutations: {
    SET_ACCESS_TOKEN(state, token) {
      state.accessToken = token
      if (token) {
        localStorage.setItem('access_token', token)
      } else {
        localStorage.removeItem('access_token')
      }
    },
    CLEAR_AUTH(state) {
      state.accessToken = null
      state.user = null
      localStorage.removeItem('access_token')
    },
    SET_REFRESHING(state, isRefreshing) {
      state.isRefreshing = isRefreshing
    },
    SET_REFRESH_PROMISE(state, promise) {
      state.refreshPromise = promise
    },
  },

  actions: {
    async refreshToken({ commit, state }) {
      if (state.isRefreshing) {
        return state.refreshPromise
      }
      commit('SET_REFRESHING', true)
      try {
        const refreshPromise = axios.post(
          `${API_BASE_URL}/auth/jwt/refresh`,
          {},
          {
            withCredentials: true, // Для отправки httpOnly cookie с refresh token
          },
        )

        commit('SET_REFRESH_PROMISE', refreshPromise)

        const response = await refreshPromise
        const newAccessToken = response.data.access_token

        commit('SET_ACCESS_TOKEN', newAccessToken)
        return newAccessToken
      } finally {
        commit('SET_REFRESHING', false)
        commit('SET_REFRESH_PROMISE', null)
      }
    },
    setAccessToken({ commit }, token) {
      // commit('SET_ACCESS_TOKEN', token)
      if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
        commit('SET_ACCESS_TOKEN', token)
      }
    },
    async logout({ commit }) {
      try {
        // 1. Отправляем запрос на сервер для инвалидации refresh token
        await axios.post(
          `${API_BASE_URL}/auth/jwt/logout`,
          {},
          {
            withCredentials: true,
          },
        )
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        // 2. Полная очистка на клиенте
        commit('CLEAR_AUTH')

        // 3. Принудительно удаляем возможные cookies (если не httpOnly)
        document.cookie = 'refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      }
    },
  },
  getters: {
    isAuthenticated: (state) => !!state.accessToken,
  },
})
