<template>
  <div class="new-admin-booking"><button @click="openNewPoster">Nouvelle Réservation</button></div>
  <div key="list" class="list-container">
    <table class="min-w-full table-auto border">
      <thead class="bg-gray-100">
        <tr>
          <th v-for="column in columns" :key="column.key" class="px-4 py-2 text-left">
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <booking-card
          v-for="b in bookingStore.bookings"
          :columns="columns"
          :key="b._id"
          :booking="b"
          admin
          @updated="bookingStore.fetchBookings()"
          @edit="openEditPoster"
        />
      </tbody>
    </table>
  </div>
  <admin-booking-edit
    :visible="showModal"
    :bookingToEdit="editingBooking"
    @close="closeModal"
    @saved="bookingStore.fetchBookings"
  />
</template>

<script setup lang="ts">
import { useBookingStore } from '@/stores/bookings'
import { ref, onMounted } from 'vue'
import BookingCard from '@/components/cards/BookingCard.vue'
import AdminBookingEdit from '@/pages/admin/AdminBookingEdit.vue'

const bookingStore = useBookingStore()

const columns = ref([
  { key: 'poster.title', label: 'Affiche réservée' },
  {key: 'user.username', label:'Réservé par'},
  { key: 'quantity', label: 'Quantité' },
  { key: 'status', label: 'Statut de la réservation' },
  { key: 'total', label: 'Prix total', manual: true },
])

const showModal = ref(false)
const editingBooking = ref(null)

const openNewPoster = () => {
  editingBooking.value = null
  showModal.value = true
}

const openEditPoster = (booking: any) => {
  editingBooking.value = booking
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

onMounted(async () => {
  bookingStore.fetchBookings()
})
</script>

<style scoped>

.new-admin-posters{
  text-align: end;
}
.container-home {
  padding: 0 1rem;
}

.header-home {
  display: flex;
  justify-content: space-between;
}
.view-toggle {
  margin-bottom: 1rem;
  display: flex;
  gap: 1rem;
}
.view-toggle button {
  padding: 0.5rem 1rem;
  border: 1px solid #aaa;
  background: white;
  cursor: pointer;
}
.view-toggle button.active {
  background-color: #007bff;
  color: white;
}

.icon {
  width: 24px;
  height: 24px;
  color: #333;
}

.view-toggle button.active .icon {
  color: white;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.grid-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.list-container {
  display: flex;
  flex-direction: column;
}

.poster-form{
  position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  background-color: white;
  border: solid 1px black;
    padding: 4em 2em;
}
</style>
