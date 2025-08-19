import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/utils/axios'

export const useTagStore = defineStore('tags', () => {
  const tags = ref<{ _id: string; name: string }[]>([])

  async function fetchTags() {
    const res = await api.get('/tags')
    tags.value = res.data
  }

  return { tags, fetchTags }
})
