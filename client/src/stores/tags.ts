import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/utils/axios'

export const useTagStore = defineStore('tags', () => {
  const tags = ref<{ _id: string; name: string }[]>([])

  async function fetchTags() {
    const res = await api.get('/tags')
    tags.value = res.data
  }

  async function createTag(payload: { name: string }) {
    const res = await api.post('/tags', payload)
    tags.value.push(res.data)
  }

  async function deleteTag(id: string) {
    await api.delete(`/tags/${id}`)
    tags.value = tags.value.filter((t) => t._id !== id)
  }

  return { tags, fetchTags, createTag, deleteTag }
})
