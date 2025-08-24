<template>
  <div class="table-container admin-booking-table">
    <table class="sticky-table">
      <thead>
        <tr>
          <th class="sticky-col">E-mail</th>
          <th>Film</th>
          <th>Quantité</th>
          <th>Prix total</th>
          <th>Date de réservation</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="b in bookings">
          <th scope="row" class="sticky-col">{{ b.user.email }}</th>
          <td>{{ b.poster.title }}</td>
          <td>{{ b.quantity }}</td>
          <td>{{ b.quantity * b.priceAtBooking }} €</td>
          <td>{{ b.bookedAt }}</td>
          <td>{{ b.status }}</td>
          <td class="admin-booking-table--actions">
            <pencil-icon class="icon" @click="$emit('edit', b)" />
            <trash-icon class="icon" @click="deleteConfirmation(b)" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <confirm-modal
    message="Supprimer la réservation."
    :visible="showDeleteModal"
    @cancel="showDeleteModal = false"
    @confirm="closeDeletionModal"
  />
</template>

<script setup lang="ts">
import type { Booking } from '@/types/models'
import { ref } from 'vue'
import ConfirmModal from '@/components/utils/ConfirmModal.vue'
import { PencilIcon, TrashIcon } from '@heroicons/vue/24/solid'

const props = defineProps<{
  bookings: Booking[]
}>()

const emit = defineEmits(['edit', 'delete'])

const showDeleteModal = ref(false)
const bookingToDelete = ref<Booking | null>(null)

function deleteConfirmation(booking: Booking) {
  showDeleteModal.value = true
  bookingToDelete.value = booking
}

function closeDeletionModal() {
  emit('delete', bookingToDelete)
  showDeleteModal.value = false
}
</script>
<style lang="scss" scoped>
.admin-booking-table {
  &--actions > * {
    cursor: pointer;
  }
}
</style>
