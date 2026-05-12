import { defineStore } from 'pinia'
import type { Message } from '@/types/models'
import { ref } from 'vue'
import api from '@/utils/axios'

export const useMessageStore = defineStore('message', () => {
  const message = ref<Message|null>(null)

  async function fetchMessage() {
    const res = await api.get('/messages')
    message.value = res.data
  }

  async function updateMessage(content: string) {
    const res = await api.post('/messages', { content })
    message.value = res.data
  }

  async function toggleBooking() {
    const res = await api.post('/messages/toggle-booking')
    message.value = res.data
  }

  return { message, fetchMessage, updateMessage, toggleBooking }
})
