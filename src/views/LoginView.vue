<template>
  <div class="row justify-content-center">
    <div class="col-md-6">
      <h2 class="mb-4">Login</h2>
      <form @submit.prevent="handleSubmit">
        <div class="mb-3">
          <label for="email" class="form-label">Email address</label>
          <input type="email" class="form-control" id="email" v-model="form.email" required />
        </div>
        <div class="mb-3">
          <label for="password" class="form-label">Password</label>
          <input
            type="password"
            class="form-control"
            id="password"
            v-model="form.password"
            required
          />
        </div>
        <button type="submit" class="btn btn-primary" :disabled="loading">
          <span
            v-if="loading"
            class="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          ></span>
          Login
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { API_BASE_URL } from '@/config/api'

export default {
  name: 'LoginView',
  data() {
    return {
      form: {
        email: '',
        password: '',
      },
      loading: false,
    }
  },
  methods: {
    async handleSubmit() {
      this.loading = true
      try {
        const formData = new FormData()
        formData.append('username', this.form.email)
        formData.append('password', this.form.password)

        const response = await axios.post(`${API_BASE_URL}/auth/jwt/login`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true, // Для получения cookies
        })

        if (response.data.access_token) {
          // Сохраняем access token в хранилище (Vuex/Pinia)
          this.$store.commit('SET_ACCESS_TOKEN', response.data.access_token)

          // Перенаправляем на защищенный маршрут
          this.$router.push({ name: 'home' })
        }
      } catch (error) {
        console.error('Login error:', error)
        this.showError(error.response?.data?.detail || 'Login failed. Please try again.')
      } finally {
        this.loading = false
      }
    },
    showError(message) {
      // Можно заменить на красивый toast или модальное окно
      alert(message)
    },
  },
}
</script>
