<template class="account">
  <div class="account-container">
    <h1 class="account-container-title">{{ $t('account.title') }}</h1>

    <div v-if="loading">{{ $t('account.loading') }}</div>
    <div v-else-if="bookingStore.bookings.length === 0" class="account-container-no-booking">
      {{ $t('account.noBookings') }}
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
    @saved="refreshBookings"
  />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useBookingStore } from '@/stores/bookings'
import { usePosterStore } from '@/stores/posters'
import BookingEdit from '@/components/edition/BookingEdit.vue'
import AdminBookingTable from '@/components/tables/BookingTable.vue'

const auth = useAuthStore()
const bookingStore = useBookingStore()
const posterStore = usePosterStore()
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

async function refreshBookings(){
  await bookingStore.fetchBookings({ all: false })
  await posterStore.fetchPosters({forSale: true})
}

const closeModal = () => {
  showModal.value = false
}
</script>

<style lang="scss" scoped>
.account-container-title{
  color : $red;
}
.account-container-no-booking{
  padding-left: 0.5rem;
}
</style>
