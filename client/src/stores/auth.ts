import { defineStore } from 'pinia'
import axios from 'axios'
import type { User } from '../types/models'

const API = 'http://localhost:5000/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: localStorage.getItem('token') || '',
    initialized: false,
  }),
  actions: {
    async init() {
      if (this.token || this.initialized) return

      const saved = localStorage.getItem('token')
      if (saved) {
        this.token = saved
        try {
          await this.fetchUser() // get user profile
        } catch (e) {
          this.token = ''
        }
      }
      this.initialized = true
    },
    async login(username: string, password: string) {
      const res = await axios.post(`${API}/auth/login`, { username, password })
      this.token = res.data.token
      this.user = res.data.user
      localStorage.setItem('token', this.token)
    },
    async signup(username: string, password: string, role: string = 'user') {
      const res = await axios.post(`${API}/auth/signup`, { username, password, role })
      this.token = res.data.token
      this.user = res.data.user
      localStorage.setItem('token', this.token)
    },
    async fetchUser() {
      if (!this.token) return

      try {
        const res = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${this.token}` },
        })
        this.user = res.data
      } catch {
        this.logout() // invalid token
      }
    },
    logout() {
      this.user = null
      this.token = ''
      localStorage.removeItem('token')
    },
  },
})
