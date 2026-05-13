<template>
  <div class="table-container admin-booking-table">
    <table class="sticky-table">
      <thead>
        <tr>
          <th class="sticky-col">{{ $t('table.booking.email') }}</th>
          <th>{{ $t('table.booking.poster') }}</th>
          <th>{{ $t('table.booking.quantity') }}</th>
          <th>{{ $t('table.booking.totalPrice') }}</th>
          <th>{{ $t('table.booking.date') }}</th>
          <th>{{ $t('table.booking.status') }}</th>
          <th>{{ $t('table.booking.actions') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="b in bookings">
          <th scope="row" class="sticky-col">{{ b.user.email }}</th>
          <td>{{ b.poster.title }}</td>
          <td>{{ b.quantity }}</td>
          <td>{{ b.quantity * b.priceAtBooking }} €</td>
          <td>{{ new Date(b.bookedAt).toLocaleString() }}</td>
          <td>{{ b.status }}</td>
          <td class="admin-booking-table--actions">
            <pencil-icon class="icon" @click="$emit('edit', b)" />
            <trash-icon class="icon" @click="deleteConfirmation(b._id)" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <confirm-modal
    :message="$t('table.booking.deleteConfirm')"
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
const bookingToDelete = ref<string | null>(null)

function deleteConfirmation(bookingId: string) {
  showDeleteModal.value = true
  bookingToDelete.value = bookingId
}

function closeDeletionModal() {
  emit('delete', bookingToDelete.value)
  showDeleteModal.value = false
}
</script>
<style lang="scss" scoped>
.admin-booking-table {
  &--actions {
    text-align: right;
    white-space: nowrap;
    > * { cursor: pointer; }
  }
}

thead th:last-child {
  text-align: right;
}
</style>
