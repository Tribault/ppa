import { defineStore } from 'pinia'
import type { Poster, StockInfo } from '@/types/models'
import { ref, computed } from 'vue'
import api from '@/utils/axios'
import debounce from 'lodash.debounce'
import { useToast } from 'vue-toastification'
const toast = useToast()

export const usePosterStore = defineStore('posters', () => {
  const posters = ref<Poster[]>([])
  const poster = ref<Poster | null>(null)
  const total = ref(0)
  const page = ref(1)
  const pages = ref(1)

  const loading = ref(false)
  const error = ref<string | null>(null)
  const selectedLetter = ref<string | null>(null)
  const searchQuery = ref('')

  const setSearchQuery = debounce((value: string) => {
    searchQuery.value = value
  }, 300)

  const filteredPosters = computed(() => {
    let result = posters.value

    if (selectedLetter.value) {
      result = result.filter(
        (p) => p.title[0].toUpperCase() === selectedLetter.value?.toUpperCase(),
      )
    }

    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.tags?.some((tag) => tag.name.toLowerCase().includes(query)),
      )
    }

    return result
  })

  async function fetchPosters(params: { forSale?: boolean, page?: number; limit?: number; q?: string } = {}) {
    loading.value = true
    try {
      const res = await api.get('/posters', { params })
      posters.value = res.data.data
      total.value = res.data.total
      page.value = res.data.page
      pages.value = res.data.pages
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch posters'
    } finally {
      loading.value = false
    }
  }

  async function fetchPoster(id: string | string[]) {
    loading.value = true
    try {
      const res = await api.get(`/posters/${id}`)
      poster.value = res.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch poster'
    } finally {
      loading.value = false
    }
  }

  async function createPoster(posterData: FormData) {
    try {
      const res = await api.post('/posters', posterData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      posters.value.push(res.data)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create poster'
      throw err
    }
  }

  async function updatePoster(id: string, posterData: FormData) {
    try {
      const res = await api.put(`/posters/${id}`, posterData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const index = posters.value.findIndex((p) => p._id === id)
      if (index !== -1) {
        posters.value[index] = res.data
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update poster'
      throw err
    }
  }

  async function deletePoster(id: string) {
    try {
      await api.delete(`/posters/${id}`)
      posters.value = posters.value.filter((p) => p._id !== id)
      toast.success('Affiche supprimée ✅')
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete poster'
      toast.error('Erreur durant la suppression ❌')
      throw err
    }
  }

  return {
    posters,
    poster,
    total,
    page,
    pages,
    loading,
    error,
    selectedLetter,
    searchQuery,
    setSearchQuery,
    filteredPosters,
    fetchPosters,
    fetchPoster,
    createPoster,
    updatePoster,
    deletePoster,
  }
})
