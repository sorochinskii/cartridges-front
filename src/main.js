import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
// import 'bootstrap/dist/css/bootstrap.css'
import store from './store/auth'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap' // Важно: импорт JS-части
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
// import { toast } from 'vue3-toastify'
// import 'vue3-toastify/dist/index.css'
// import ToastPlugin from 'vue-toast-notification';

const savedToken = localStorage.getItem('access_token')
if (savedToken) {
  store.commit('SET_ACCESS_TOKEN', savedToken)
}

const app = createApp(App)
app.use(router)
app.use(store)
app.use(Toast, {
  timeout: 2000,
})
app.mount('#app')
