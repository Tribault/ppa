<template>
  <tr class="border-t">
    <td v-for="column in columns" :key="column.key">
      {{ renderCell(column) }}
    </td>
    <td v-if="booking.status == 'pending'">
      <span @click="bookingStore.validateBooking(booking._id)"
        ><CurrencyEuroIcon class="icon"
      /></span>
      <span @click="$emit('edit', booking)"><PencilIcon class="icon" /></span>
      <span @click="confirmDelete"><TrashIcon class="icon" /></span>
    </td>
    <td v-if="booking.status == 'validated'">
      <span @click="bookingStore.devalidateBooking(booking._id)"
        ><MinusCircleIcon class="icon"
      /></span>
    </td>
  </tr>
  <ConfirmModal
    :visible="confirmDeleteVisible"
    message="This will permanently delete the poster."
    @confirm="doDelete"
    @cancel="confirmDeleteVisible = false"
  />
</template>

<script setup lang="ts">
import type { Booking } from '@/types/models'
import { ref } from 'vue'
import { useBookingStore } from '@/stores/bookings'
import ConfirmModal from '@/components/utils/ConfirmModal.vue'

import { useToast } from 'vue-toastification'
const toast = useToast()

import { CurrencyEuroIcon, MinusCircleIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/solid'

const bookingStore = useBookingStore()

const props = defineProps<{
  booking: Booking
  admin?: boolean
  columns: { key: string; label: string; manual?: boolean }[]
}>()
const emit = defineEmits(['edit', 'validate', 'updated', 'revert'])

function resolve(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => acc?.[part], obj)
}

function renderCell(column: { key: string; manual?: boolean }) {
  if (!column.manual) {
    return resolve(props.booking, column.key)
  }

  switch (column.key) {
    case 'total':
      return (props.booking.quantity * props.booking.priceAtBooking).toFixed(2)
    default:
      return '—'
  }
}

const confirmDeleteVisible = ref(false)

function confirmDelete() {
  confirmDeleteVisible.value = true
}

async function doDelete() {
  try {
    if (props.booking?._id) {
      await bookingStore.deleteBooking(props.booking._id)
      toast.success('booking cancelled 🗑')
      emit('updated')
    }
  } catch (err) {
    toast.error('Failed to cancel ❌')
  } finally {
    confirmDeleteVisible.value = false
  }
}
</script>
<style>
.container-booking {
  display: flex;
  justify-content: space-between;
  padding: 2rem;
}

.icon {
  width: 2rem;
  height: 2rem;
  color: #333;
}
</style>
