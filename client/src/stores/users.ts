import { defineStore } from 'pinia'
import type { User } from '@/types/models'
import api from '@/utils/axios'

export const useUserStore = defineStore('users', {
  state: () => ({
    users: [] as User[],
    user: null as User | null,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchUsers(params? : Record<string, string>) {
      this.loading = true
      try {
        const res = await api.get('/users', {params})
        this.users = res.data
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Failed to fetch users'
      } finally {
        this.loading = false
      }
    },

    async fetchUser(id: string) {
      this.loading = true
      try {
        const res = await api.get(`/users/${id}`)
        this.user = res.data
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Failed to fetch user'
      } finally {
        this.loading = false
      }
    },

    async createUser(userData: Partial<User>) {
      try {
        const res = await api.post('/users', userData)
        this.users.push(res.data)
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Failed to create user'
        throw err
      }
    },

    async updateUser(id: string, userData: Partial<User>) {
      try {
        const res = await api.put(`/users/${id}`, userData)
        const index = this.users.findIndex((p) => p._id === id)
        if (index !== -1) {
          this.users[index] = res.data
        }
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Failed to update user'
        throw err
      }
    },

    async deleteUser(id: string) {
      try {
        await api.delete(`/users/${id}`)
        this.users = this.users.filter((p) => p._id !== id)
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Failed to delete user'
        throw err
      }
    },
  },
})
