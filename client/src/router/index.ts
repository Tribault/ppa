import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

import Home from '@/pages/Home.vue'
import Login from '@/pages/auth/Login.vue'
import Signup from '@/pages/auth/Signup.vue'
import Admin from '@/pages/AdminHome.vue'
import PosterForm from '@/components/edition/PosterEdit.vue'
import Account from '@/pages/Account.vue'
import PosterDetails from '@/pages/PosterDetails.vue'
import ForgotPassword from '@/pages/auth/ForgotPassword.vue'
import ResetPassword from '@/pages/auth/ResetPassword.vue'
import EmailVerification from '@/pages/auth/EmailVerification.vue'
import ResendVerification from '@/pages/auth/ResendVerification.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/posters/:id', name: 'posters', component: PosterDetails, props: true },
  { path: '/login', component: Login },
  { path: '/signup', component: Signup },
  { path: '/admin', component: Admin },
  { path: '/admin/new', component: PosterForm },
  { path: '/account', component: Account },
  { path: '/admin/edit/:id', component: PosterForm, props: true },
  { path: '/forgot-password', component: ForgotPassword },
  { path: '/reset-password', component: ResetPassword },
  { path: '/verify-email', component: EmailVerification },
  { path: '/resend-verification', component: ResendVerification },
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
