<template>
  <div class="table-container admin-booking-table">
    <table class="sticky-table">
      <thead>
        <tr>
          <sortable-th field="reference" :sort-by="sortBy" :sort-dir="sortDir" sticky-col @sort="$emit('sort', $event)">
            {{ $t('table.booking.reference') }}
          </sortable-th>
          <sortable-th field="userEmail" :sort-by="sortBy" :sort-dir="sortDir" @sort="$emit('sort', $event)">
            {{ $t('table.booking.email') }}
          </sortable-th>
          <sortable-th field="posterTitle" :sort-by="sortBy" :sort-dir="sortDir" @sort="$emit('sort', $event)">
            {{ $t('table.booking.poster') }}
          </sortable-th>
          <sortable-th field="quantity" :sort-by="sortBy" :sort-dir="sortDir" @sort="$emit('sort', $event)">
            {{ $t('table.booking.quantity') }}
          </sortable-th>
          <sortable-th field="totalPrice" :sort-by="sortBy" :sort-dir="sortDir" @sort="$emit('sort', $event)">
            {{ $t('table.booking.totalPrice') }}
          </sortable-th>
          <sortable-th field="bookedAt" :sort-by="sortBy" :sort-dir="sortDir" @sort="$emit('sort', $event)">
            {{ $t('table.booking.date') }}
          </sortable-th>
          <sortable-th field="status" :sort-by="sortBy" :sort-dir="sortDir" @sort="$emit('sort', $event)">
            {{ $t('table.booking.status') }}
          </sortable-th>
          <th>{{ $t('table.booking.actions') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="b in bookings">
          <th scope="row" class="sticky-col">{{ b.reference }}</th>
          <td>{{ b.user.email }}</td>
          <td>{{ b.poster.title }}</td>
          <td>{{ b.quantity }}</td>
          <td>{{ b.quantity * b.priceAtBooking }} €</td>
          <td>{{ new Date(b.bookedAt).toLocaleString() }}</td>
          <td>{{ statusLabel(b.status) }}</td>
          <td class="admin-booking-table--actions">
            <clock-icon
              v-if="authStore.isAdmin"
              class="icon"
              :title="$t('table.booking.basketToReady')"
              @click="$emit('basket-status', { reference: b.reference, status: 'ready' })"
            />
            <check-circle-icon
              v-if="authStore.isAdmin"
              class="icon"
              :title="$t('table.booking.basketToValidated')"
              @click="$emit('basket-status', { reference: b.reference, status: 'validated' })"
            />
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
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import ConfirmModal from '@/components/utils/ConfirmModal.vue'
import SortableTh from '@/components/tables/SortableTh.vue'
import { PencilIcon, TrashIcon, ClockIcon, CheckCircleIcon } from '@heroicons/vue/24/solid'

const props = defineProps<{
  bookings: Booking[]
  sortBy?: string | null
  sortDir?: 'asc' | 'desc'
}>()

const emit = defineEmits(['edit', 'delete', 'sort', 'basket-status'])

const authStore = useAuthStore()

const { t } = useI18n()

const STATUS_LABELS: Record<string, string> = {
  pending: 'form.booking.statusPending',
  ready: 'form.booking.statusReady',
  validated: 'form.booking.statusValidated',
}

function statusLabel(status: string) {
  const key = STATUS_LABELS[status]
  return key ? t(key) : status
}

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
