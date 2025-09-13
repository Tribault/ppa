import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/utils/axios'

export const useMessageStore = defineStore('message', () => {
  const message = ref<string>('')

  async function fetchMessage() {
    const res = await api.get('/messages')
    message.value = res.data?.content || ''
  }

  async function updateMessage(content: string) {
    const res = await api.post('/messages', { content })
    message.value = res.data.content
  }

  return { message, fetchMessage, updateMessage }
})
