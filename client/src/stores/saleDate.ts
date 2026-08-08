import { defineStore } from 'pinia'
import type { SaleDate } from '@/types/models'
import { ref } from 'vue'
import api from '@/utils/axios'

export const useSaleDateStore = defineStore('saleDate', () => {
  const saleDate = ref<SaleDate | null>(null)

  async function fetchSaleDate() {
    const res = await api.get('/sale-date')
    saleDate.value = res.data
  }

  async function updateSaleDate(date: string) {
    const res = await api.post('/sale-date', { date })
    saleDate.value = res.data
  }

  return { saleDate, fetchSaleDate, updateSaleDate }
})
