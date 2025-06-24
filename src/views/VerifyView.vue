<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6">
        <!-- Состояние загрузки -->
        <div v-if="status === 'loading'" class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3">Идёт проверка токена...</p>
        </div>

        <!-- Успешная верификация -->
        <div v-if="status === 'success'" class="alert alert-success text-center">
          <h4 class="alert-heading">Поздравляем!</h4>
          <p>Ваш email успешно подтверждён.</p>
          <router-link to="/login" class="btn btn-success">
            Перейти к входу
          </router-link>
        </div>

        <!-- Ошибка верификации -->
        <div v-if="status === 'error'" class="alert alert-danger text-center">
          <h4 class="alert-heading">Ошибка подтверждения</h4>
          <p>Не удалось подтвердить email. Возможно, ссылка устарела или недействительна.</p>
          <button @click="retryVerification" class="btn btn-outline-danger">
            Попробовать снова
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { API_BASE_URL } from '@/config/api'

export default {
  name: 'EmailVerificationView',
  data() {
    return {
      status: 'loading', // loading | success | error
      token: null
    }
  },
  created() {
    this.extractTokenFromUrl()
    this.verifyToken()
  },
  methods: {
    extractTokenFromUrl() {
      // Извлекаем токен из URL (последняя часть пути)
      this.token = this.$route.params.token || 
                   this.$route.path.split('/').pop()
    },
    async verifyToken() {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/users/verify/`,
          { token: this.token },
          {
            headers: {
              'Content-Type': 'application/json'
            },
            validateStatus: (status) => status < 500 // Не считать 4xx ошибкой
          }
        )

        if (response.status === 200) {
          this.status = 'success'
        } else {
          this.status = 'error'
          console.error('Verification failed:', response.data)
        }
      } catch (error) {
        this.status = 'error'
        console.error('Verification error:', error)
      }
    },
    retryVerification() {
      this.status = 'loading'
      this.verifyToken()
    }
  }
}
</script>

<style scoped>
.alert {
  margin-top: 2rem;
}
.spinner-border {
  width: 3rem;
  height: 3rem;
}
</style>