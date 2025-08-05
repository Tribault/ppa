import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

import Home from '../pages/Home.vue'
import Login from '../pages/Login.vue'
import Signup from '../pages/Signup.vue'
import Admin from '../pages/AdminPage.vue'
import PosterForm from '../pages/admin/AdminPosterEdit.vue'
import Account from '../pages/Account.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/signup', component: Signup },
  { path: '/admin', component: Admin },
  { path: '/admin/new', component: PosterForm },
  { path: '/account', component: Account },
  { path: '/admin/edit/:id', component: PosterForm, props: true },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()

  if (auth.token && !auth.user) {
    try {
      await auth.fetchUser()
    } catch (err) {
      console.error('Failed to restore user', err)
    }
  }

  next()
})

export default router
