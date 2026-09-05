import { defineStore } from 'pinia'
import type { Booking, BookingPayload } from '@/types/models'
import { usePosterStore } from '@/stores/posters'
import debounce from 'lodash.debounce'
import api from '@/utils/axios'
import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'
const toast = useToast()

export const useBookingStore = defineStore('bookings', () => {
  const bookings = ref<Booking[]>([])
  const booking = ref<Booking | null>(null)
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

  const filteredBookings = computed(() => {
    let result = bookings.value

    if (selectedLetter.value) {
      result = result.filter(
        (b) => b.user.email[0].toUpperCase() === selectedLetter.value?.toUpperCase(),
      )
    }

    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(
        (b) => b.user.email.toLowerCase().includes(query) || b.poster.title.includes(query),
      )
    }

    return result
  })

  async function fetchBookings(
    options?: { all?: boolean },
    params: { page?: number; limit?: number; q?: string; sortBy?: string; sortDir?: 'asc' | 'desc' } = {},
  ) {
    loading.value = true
    try {
      let url = '/bookings'
      if (options?.all) {
        url += '?all=true'
      }
      const res = await api.get(url, { params })
      bookings.value = res.data.data
      total.value = res.data.total
      page.value = res.data.page
      pages.value = res.data.pages
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch bookings'
    } finally {
      loading.value = false
    }
  }

  async function createBooking(bookingData: BookingPayload) {
    try {
      const res = await api.post('/bookings', bookingData)
      bookings.value.push(res.data)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create booking'
      throw err
    }
  }

  async function updateBooking(id: string, bookingData: BookingPayload) {
    try {
      const res = await api.put(`/bookings/${id}`, bookingData)
      const index = bookings.value.findIndex((p) => p._id === id)
      if (index !== -1) {
        bookings.value[index] = res.data
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update booking'
      throw err
    }
  }

  async function deleteBooking(id: string) {
    try {
      await api.delete(`/bookings/${id}`)
      bookings.value = bookings.value.filter((p) => p._id !== id)
      toast.success('Réservation supprimée ✅')
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete booking'
      toast.error('Erreur durant la suppression ❌')
      throw err
    }
  }

  async function updateBasketStatus(reference: string, status: 'ready' | 'validated') {
    try {
      await api.patch(`/bookings/reference/${reference}`, { status })
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to update basket'
      throw err
    }
  }

  return {
    bookings,
    booking,
    total,
    page,
    pages,
    loading,
    error,
    selectedLetter,
    searchQuery,
    setSearchQuery,
    filteredBookings,
    fetchBookings,
    deleteBooking,
    updateBooking,
    createBooking,
    updateBasketStatus,
  }
})
