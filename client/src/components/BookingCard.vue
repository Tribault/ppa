<template>
  <tr class="border-t">
    <td v-for="column in columns" :key="column.key" class="px-4 py-2 whitespace-nowrap text-sm">
      {{ renderCell(column) }}
    </td>
    <td v-if="booking.status == 'pending'">
      <button @click="increment" :disabled="quantity >= booking.poster.availableStock">
        <PlusIcon class="icon" />
      </button>
      <button @click="decrement" :disabled="quantity <= 1">
        <MinusIcon class="icon" />
      </button>
      <button @click="updateBooking">Modifier</button>
      <button @click="deleteBooking">Supprimer</button>
    </td>
  </tr>
</template>

<script setup lang="ts">
import type { Booking } from '@/types/models'
import { ref } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../stores/auth'

import { PlusIcon, MinusIcon } from '@heroicons/vue/24/solid'

const auth = useAuthStore()

const props = defineProps<{
  booking: Booking
  columns: { key: string; label: string; manual?: boolean }[]
}>()
const emit = defineEmits<{
  (e: 'updated'): void
}>()

const quantity = ref<number>(props.booking.quantity)

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
    case 'quantity':
      return quantity.value
    default:
      return '—'
  }
}

const increment = () => {
  if (quantity.value < props.booking.poster.availableStock) {
    quantity.value++
  }
}

const decrement = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const updateBooking = async () => {
  try {
    await axios.put(
      ` http://localhost:5000/api/bookings/${props.booking._id}`,
      {
        quantity: quantity.value,
      },
      { headers: { Authorization: `Bearer ${auth.token}` } },
    )
    alert(`Booked ${quantity.value} copy/copies of "${props.booking.poster.title}"`)
    emit('updated')
  } catch (err: any) {
    alert(err.response?.data?.error || 'Booking failed')
  }
}

const deleteBooking = async () => {
  try {
    await axios.delete(` http://localhost:5000/api/bookings/${props.booking._id}`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    })
    alert('Booking deleted')
    emit('updated')
  } catch (err: any) {
    alert(err.response?.data?.error || 'Booking deletion failed')
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
  width: 14px;
  height: 14px;
  color: #333;
}
</style>
