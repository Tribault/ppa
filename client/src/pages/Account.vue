<template>
  <div>
    <h1>My Bookings</h1>

    <div v-if="loading" class="text-gray-500">Loading bookings...</div>
    <div v-else-if="bookings.length === 0" class="text-gray-500">You have no bookings yet.</div>

    <div v-else class="overflow-x-auto">
      <table class="min-w-full table-auto border">
        <thead class="bg-gray-100">
          <tr>
            <th v-for="column in columns" :key="column.key" class="px-4 py-2 text-left">
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <BookingCard
            v-for="b in bookings"
            :key="b._id"
            :booking="b"
            :columns="columns"
            @updated="getBookings"
          />
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import BookingCard from '../components/BookingCard.vue'
import axios from 'axios'

const auth = useAuthStore()
const bookings = ref([])
const loading = ref(true)

const columns = ref([
  { key: 'poster.title', label: 'Titre' },
  { key: 'quantity', label: 'Quantité', manual: true },
  { key: 'status', label: 'Statut' },
  { key: 'priceAtBooking', label: 'Prix individuel' },
  { key: 'bookedAt', label: 'Date de réservation' },
  { key: 'total', label: 'Total Price (€)', manual: true },
])

watch(
  () => auth.user,
  async (user) => {
    if (user) {
      getBookings()
    }
  },
  { immediate: true },
)

async function getBookings() {
  try {
    const res = await axios.get(`http://localhost:5000/api/bookings/user/${auth.user._id}`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    })
    bookings.value = res.data
  } catch (err) {
    console.error('Failed to fetch bookings:', err)
  } finally {
    loading.value = false
  }
}
</script>
