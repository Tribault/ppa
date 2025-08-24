import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '../types/models'
import api from '@/utils/axios'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string>(localStorage.getItem('token') || '')
  const initialized = ref(false)
  const message = ref('')
  const loading = ref(false)

  const isAdmin = computed(() => {
    return user.value?.role === 'admin'
  })

  async function init() {
    if (token.value || initialized.value) return

    const saved = localStorage.getItem('token')
    if (saved) {
      token.value = saved
      try {
        await fetchUser()
      } catch (e) {
        token.value = ''
      }
    }
    initialized.value = true
  }

  async function login(username: string, password: string) {
    const res = await api.post('/auth/login', { username, password })
    token.value = res.data.token
    user.value = res.data.user
    localStorage.setItem('token', token.value)
  }

  async function signup(username: string, password: string, email: string, role: string = 'user') {
    const res = await api.post('/auth/signup', { username, password, email, role })
    token.value = res.data.token
    user.value = res.data.user
    localStorage.setItem('token', token.value)
  }

  async function fetchUser() {
    if (!token.value) return

    try {
      const res = await api.get('/auth/me')
      user.value = res.data
    } catch {
      logout()
    }
  }

  async function forgotPassword(email: string) {
    const res = await api.post('/auth/forgot-password', { email })
    return res.data.message
  }

  async function resetPassword(tokenParam: string, password: string) {
    const res = await api.post('/auth/reset-password', {
      token: tokenParam,
      password,
    })
    return res.data.message
  }

  function logout() {
    user.value = null
    token.value = ''
    localStorage.removeItem('token')
  }

  return {
    user,
    token,
    initialized,
    isAdmin,
    init,
    login,
    signup,
    fetchUser,
    forgotPassword,
    resetPassword,
    logout,
  }
})
