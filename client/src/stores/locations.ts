import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/utils/axios'

export const useLocationStore = defineStore('locations', () => {
  const locations = ref<{ _id: string; name: string }[]>([])

  async function fetchLocations() {
    const res = await api.get('/locations')
    locations.value = res.data
  }

  async function createLocation(payload: { name: string }) {
    const res = await api.post('/locations', payload)
    locations.value.push(res.data)
  }

  return { locations, fetchLocations, createLocation }
})
