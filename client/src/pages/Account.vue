<template class="account">
  <div class="account-container">
    <h1 class="account-container-title">Mes réservations</h1>

    <div v-if="loading">Chargement en cours...</div>
    <div v-else-if="bookingStore.bookings.length === 0">
      Vous n'avez pas encore de réservations.
    </div>

    <div v-else>
      <admin-booking-table 
      :bookings="bookingStore.bookings"
    @edit="(p) => openEditBooking(p)"
    @delete="(p) => deleteBooking(p)"
  />
  <booking-edit
    :visible="showModal"
    :bookingToEdit="editingBooking"
    @close="closeModal"
    @saved="bookingStore.fetchBookings"
  />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useBookingStore } from '@/stores/bookings'
import BookingEdit from '@/components/edition/BookingEdit.vue'
import AdminBookingTable from '@/components/tables/BookingTable.vue'

const auth = useAuthStore()
const bookingStore = useBookingStore()
const loading = ref(true)
const editingBooking = ref(null)

const showModal = ref(false)

onMounted(async () => {
  bookingStore.fetchBookings({ all: false })
  loading.value = false
})

const openEditBooking = (poster: any) => {
  editingBooking.value = poster
  showModal.value = true
}

function deleteBooking(bookingId: string) {
  bookingStore.deleteBooking(bookingId)
}

const closeModal = () => {
  showModal.value = false
}
</script>

<style lang="scss" scoped>
.account-container-title{
  color : $red;
}
</style>
