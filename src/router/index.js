import { createRouter, createWebHistory } from 'vue-router'
import UserLogin from '../views/Login.vue'

const routes = [
  {
    path: '/',
    name: 'UserLogin',
    component: UserLogin,
  },
]
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [],
})

export default router
