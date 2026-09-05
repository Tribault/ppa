import { defineStore } from 'pinia'
import type { Poster, Booking } from '@/types/models'
import api from '@/utils/axios'
import { ref, computed } from 'vue'

interface BasketItem {
  poster: Poster
  quantity: number
}

export const useBasketStore = defineStore('basket', () => {
  const items = ref<BasketItem[]>([])
  const isOpen = ref(false)
  const error = ref<string | null>(null)

  const itemCount = computed(() => items.value.reduce((sum, i) => sum + i.quantity, 0))
  const totalPrice = computed(() => items.value.reduce((sum, i) => sum + i.quantity * i.poster.price, 0))

  function quantityFor(posterId: string) {
    return items.value.find((i) => i.poster._id === posterId)?.quantity || 0
  }

  function setItem(poster: Poster, quantity: number) {
    if (quantity <= 0) {
      removeItem(poster._id)
      return
    }
    const existing = items.value.find((i) => i.poster._id === poster._id)
    if (existing) {
      existing.quantity = quantity
      existing.poster = poster
    } else {
      items.value.push({ poster, quantity })
    }
  }

  function removeItem(posterId: string) {
    items.value = items.value.filter((i) => i.poster._id !== posterId)
  }

  function clear() {
    items.value = []
  }

  function open() {
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  async function confirmBasket(): Promise<{ reference: string; bookings: Booking[] }> {
    try {
      const res = await api.post('/bookings/basket', {
        items: items.value.map((i) => ({ posterId: i.poster._id, quantity: i.quantity })),
      })
      clear()
      return res.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to confirm basket'
      throw err
    }
  }

  return {
    items,
    isOpen,
    error,
    itemCount,
    totalPrice,
    quantityFor,
    setItem,
    removeItem,
    clear,
    open,
    close,
    confirmBasket,
  }
})
