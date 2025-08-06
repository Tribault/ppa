import { defineStore } from 'pinia'
import type { Booking, BookingPayload } from '@/types/models'
import api from '@/utils/axios'

import { useToast } from 'vue-toastification'
const toast = useToast()

export const useBookingStore = defineStore('bookings', {
  state: () => ({
    bookings: [] as Booking[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchBookings() {
      this.loading = true
      try {
        const res = await api.get('/bookings')
        this.bookings = res.data
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Failed to fetch bookings'
      } finally {
        this.loading = false
      }
    },

    async createBooking(bookingData: BookingPayload) {
      try {
        const res = await api.post('/bookings', bookingData)
        this.bookings.push(res.data)
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Failed to create booking'
        throw err
      }
    },
    async validateBooking(id: string){
      try{
        await api.post(`/bookings/${id}/validate`)
        await this.fetchBookings()
        toast.success('booking validated')
      }catch(err: any){
        this.error = err.response?.data?.message || 'Failed to validate booking'
        toast.error(this.error)
        throw err
      }
    },
        async devalidateBooking(id: string){
      try{
        await api.post(`/bookings/${id}/devalidate`)
        await this.fetchBookings()
        toast.success('booking devalidated')
      }catch(err: any){
        this.error = err.response?.data?.message || 'Failed to devalidate booking'
        toast.error(this.error)
        throw err
      }
    },
    async updateBooking(id: string, bookingData: BookingPayload) {
      try {
        const res = await api.put(`/bookings/${id}`, bookingData)
        const index = this.bookings.findIndex((p) => p._id === id)
        if (index !== -1) {
          this.bookings[index] = res.data
        }
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Failed to update booking'
        throw err
      }
    },

    async deleteBooking(id: string) {
      try {
        await api.delete(`/bookings/${id}`)
        this.bookings = this.bookings.filter((p) => p._id !== id)
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Failed to delete poster'
        throw err
      }
    },
  },
})
