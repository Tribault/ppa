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
import Help from '@/pages/Help.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/help', name: 'help', component: Help },
  { path: '/posters/:id', name: 'posters', component: PosterDetails, props: true },
  { path: '/login', name: 'login', component: Login },
  { path: '/signup', component: Signup },
  { path: '/admin', component: Admin, meta: { requiresAuth: true, roles: ['admin'] } },
  { path: '/admin/new', component: PosterForm, meta: { requiresAuth: true, roles: ['admin'] } },
  { path: '/admin/edit/:id', component: PosterForm, props: true, meta: { requiresAuth: true, roles: ['admin'] } },
  { path: '/account', component: Account, meta: { requiresAuth: true, roles: ['user'] } },
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

  if (to.meta.requiresAuth && !auth.user) {
    return next({ name: 'login' })
  }

  const roles = to.meta.roles as string[] | undefined
  if (roles && auth.user && !roles.includes(auth.user.role)) {
    return next(auth.user.role === 'admin' ? '/admin' : '/')
  }

  next()
})

export default router
