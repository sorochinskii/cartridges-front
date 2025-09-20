import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RegisterView from '../views/RegisterView.vue'
import LoginView from '../views/LoginView.vue'
import VerifyEmailView from '../views/VerifyEmailView.vue'
import RoomsView from '@/views/Rooms/RoomsView.vue'
import BuildingsView from '@/views/Buildings/BuildingsView.vue'
import store from '@/store/auth'
import VendorsView from '@/views/Vendors/VendorsView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
  },
  {
    path: '/verify-email',
    name: 'verify-email',
    component: VerifyEmailView,
  },
  {
    path: '/verify/:token',
    name: 'verify',
    component: () => import('../views/VerifyView.vue'),
    props: true,
  },
  {
    path: '/rooms',
    name: 'rooms',
    component: RoomsView,
    meta: { requiresAuth: true },
  },
  {
    path: '/buildings',
    name: 'buildings',
    component: BuildingsView,
    meta: { requiresAuth: true },
  },
  {
    path: '/vendors',
    name: 'vendors',
    component: VendorsView,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    if (store.getters['isAuthenticated']) {
      next()
    } else {
      try {
        // Пытаемся обновить токен перед переходом
        await store.dispatch('refreshToken')
        next()
      } catch (error) {
        next('/login')
      }
    }
  } else {
    next()
  }
})

export default router
