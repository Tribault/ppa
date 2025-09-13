import { defineStore } from 'pinia'
import type { Sale } from '@/types/models'
import { ref } from 'vue'
import api from '@/utils/axios'

export const useSaleStore = defineStore('sales', () => {
  const sales = ref<Sale[]>([])
  const total = ref(0)
  const page = ref(1)
  const pages = ref(1)

  const filters = { startDate: '', endDate: '' }
  const userSales = ref<Sale[]>([])
  const posterSales = ref<Sale[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchSales(
    params: {
      startDate?: string
      endDate?: string
      page?: number
      limit?: number
      q?: string
    } = {},
  ) {
    loading.value = true
    if (filters.startDate) params.startDate = filters.startDate
    if (filters.endDate) params.endDate = filters.endDate
    try {
      const res = await api.get('/sales', { params })
      sales.value = res.data.data
      total.value = res.data.total
      page.value = res.data.page
      pages.value = res.data.pages
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch sales'
    } finally {
      loading.value = false
    }
  }

  function resetFilters() {
    filters.startDate = ''
    filters.endDate = ''
  }

  async function fetchUserSales(id: string) {
    loading.value = true
    try {
      const res = await api.get(`/sales/user/${id}`)
      userSales.value = res.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch user sales'
    } finally {
      loading.value = false
    }
  }

  async function fetchPosterSales(id: string) {
    loading.value = true
    try {
      const res = await api.get(`/sales/poster/${id}`)
      posterSales.value = res.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch poster sales'
    } finally {
      loading.value = false
    }
  }

  async function exportSalesCSV(filters = {}) {
    try {
      const params = new URLSearchParams(filters).toString()
      const url = `/sales/export/csv${params ? `?${params}` : ''}`

      const res = await api.get(url)

      const blobUrl = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = blobUrl
      link.setAttribute('download', 'sales.csv')
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      console.error(err)
    }
  }

  return {
    sales,
    total,
    page,
    pages,
    filters,
    userSales,
    posterSales,
    loading,
    error,
    fetchSales,
    fetchUserSales,
    fetchPosterSales,
    resetFilters,
    exportSalesCSV,
  }
})
