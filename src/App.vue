<template>
  <div class="app-container">
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">API Frontend</a>
        <button
          class="navbar-toggler"
          type="button"
          @click="toggleMenu"
          aria-controls="navbarNav"
          :aria-expanded="isMenuOpen"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav" :class="{ show: isMenuOpen }">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <router-link to="/" class="nav-link">Home</router-link>
            </li>
            <!-- <li v-if="isAuthenticated" class="nav-item">
              <router-link to="/dashboard" class="nav-link">Dashboard</router-link>
            </li> -->
            <li v-if="isAuthenticated" class="nav-item">
              <router-link to="/rooms" class="nav-link">Rooms</router-link>
            </li>
            <li v-if="isAuthenticated" class="nav-item">
              <router-link to="/buildings" class="nav-link">Buildings</router-link>
            </li>
          </ul>
          <div class="d-flex">
            <router-link v-if="!isAuthenticated" to="/login" class="btn btn-outline-primary me-2"
              >Login</router-link
            >
            <router-link v-if="!isAuthenticated" to="/register" class="btn btn-primary"
              >Register</router-link
            >
            <button v-if="isAuthenticated" @click="logout" class="btn btn-outline-danger">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <div class="container mt-4">
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      isMenuOpen: false,
    }
  },
  computed: {
    isAuthenticated() {
      return this.$store.getters.isAuthenticated
    },
  },
  methods: {
    logout() {
      this.$store.dispatch('logout')
      this.$router.push('/')
    },
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen
    },
    closeMenuOnClick() {
      // Закрываем меню при клике на пункт (для мобильных)
      const navLinks = document.querySelectorAll('.nav-link, .btn')
      navLinks.forEach((link) => {
        link.addEventListener('click', () => {
          this.isMenuOpen = false
        })
      })
    },
    mounted() {
      this.closeMenuOnClick()
    },
  },
}
</script>

<style>
.app-container {
  min-height: 100vh;
}
</style>
