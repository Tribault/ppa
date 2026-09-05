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

  async function deleteLocation(id: string) {
    await api.delete(`/locations/${id}`)
    locations.value = locations.value.filter((l) => l._id !== id)
  }

  return { locations, fetchLocations, createLocation, deleteLocation }
})
