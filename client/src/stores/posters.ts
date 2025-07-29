import { defineStore } from 'pinia'
import type { Poster } from '@/types/models'
import api from '@/utils/axios'

export const usePosterStore = defineStore('posters', {
  state: () => ({
    posters: [] as Poster[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchPosters() {
      this.loading = true
      try {
        const res = await api.get('/posters')
        this.posters = res.data
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Failed to fetch posters'
      } finally {
        this.loading = false
      }
    },

    async createPoster(posterData: Partial<Poster>) {
      try {
        const res = await api.post('/posters', posterData)
        this.posters.push(res.data)
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Failed to create poster'
        throw err
      }
    },

    async updatePoster(id: string, posterData: Partial<Poster>) {
      try {
        const res = await api.put(`/posters/${id}`, posterData)
        const index = this.posters.findIndex((p) => p._id === id)
        if (index !== -1) {
          this.posters[index] = res.data
        }
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Failed to update poster'
        throw err
      }
    },

    async deletePoster(id: string) {
      try {
        await api.delete(`/posters/${id}`)
        this.posters = this.posters.filter((p) => p._id !== id)
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Failed to delete poster'
        throw err
      }
    },
  },
})
