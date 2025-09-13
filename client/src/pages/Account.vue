<template>
  <div>
    <h1>My Bookings</h1>

    <div v-if="loading" class="text-gray-500">Loading bookings...</div>
    <div v-else-if="bookingStore.bookings.length === 0" class="text-gray-500">
      You have no bookings yet.
    </div>

    <div v-else class="overflow-x-auto">
      <admin-booking-table :bookings="bookingStore.bookings" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useBookingStore } from '@/stores/bookings'
import type { Booking } from '@/types/models'
import AdminBookingTable from '@/components/tables/BookingTable.vue'

const auth = useAuthStore()
const bookingStore = useBookingStore()
const loading = ref(true)

onMounted(async () => {
  bookingStore.fetchBookings({ all: true })
  loading.value = false
})
</script>
