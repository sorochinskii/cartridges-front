<template>
  <div class="row justify-content-center">
    <div class="col-md-6">
      <h2 class="mb-4">Register</h2>
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
          Register
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { API_BASE_URL } from '@/config/api'

export default {
  name: 'RegisterView',
  data() {
    return {
      form: {
        email: '',
        password: '',
      },
      loading: false,
      errorMessage: null,
    }
  },
  methods: {
    async handleSubmit() {
      this.loading = true
      this.errorMessage = null

      try {
        const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, this.form, {
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (registerResponse.status === 200 || registerResponse.status === 201) {
          try {
            const verifyResponse = await axios.post(
              `${API_BASE_URL}/users/request-verify-token`,
              {
                email: this.form.email,
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                },
              },
            )
            if ([200, 201, 202].includes(verifyResponse.status)) {
              this.$router.push({ name: 'verify-email' })
            }
          } catch (verifyError) {
            this.handleError(verifyError, 'Failed to send verification email')
          }
        }
      } catch (registerError) {
        this.handleError(registerError, 'Registration failed')
      } finally {
        this.loading = false
      }
    },
    handleError(error, defaultMessage) {
      if (error.response) {
        switch (error.response.status) {
          case 400:
            this.errorMessage = 'Invalid request data'
            break
          case 401:
            this.errorMessage = 'Unauthorized'
            break
          case 409:
            this.errorMessage = 'User with this email already exists'
            break
          case 500:
            this.errorMessage = 'Server error. Please try again later'
            break
          default:
            this.errorMessage = defaultMessage
        }
      } else if (error.request) {
        this.errorMessage = 'Network error. Please check your connection'
      } else {
        this.errorMessage = defaultMessage
      }

      alert(this.errorMessage)
    },
  },
}
</script>

<style scoped>
.error-message {
  color: red;
  margin-top: 1rem;
}
</style>
