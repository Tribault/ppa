<template>
  <div class="table-container admin-users-table">
    <table class="sticky-table">
      <thead>
        <tr>
          <sortable-th field="email" :sort-by="sortBy" :sort-dir="sortDir" sticky-col @sort="$emit('sort', $event)">
            {{ $t('table.user.email') }}
          </sortable-th>
          <sortable-th field="role" :sort-by="sortBy" :sort-dir="sortDir" class="role-col" @sort="$emit('sort', $event)">
            {{ $t('table.user.role') }}
          </sortable-th>
          <th>{{ $t('table.user.actions') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in users">
          <th scope="row" class="sticky-col">{{ u.email }}</th>
          <td class="role-col">{{ u.role }}</td>
          <td class="admin-booking-table--actions">
            <span v-if="isAuthorized(u._id)">
              <pencil-icon class="icon" @click="$emit('edit', u)" />
              <trash-icon class="icon" @click="deleteConfirmation(u._id)" />
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <confirm-modal
    :message="$t('table.user.deleteConfirm')"
    :visible="showDeleteModal"
    @cancel="showDeleteModal = false"
    @confirm="closeDeletionModal"
  />
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import type { User } from '@/types/models'
import { ref } from 'vue'
import ConfirmModal from '@/components/utils/ConfirmModal.vue'
import SortableTh from '@/components/tables/SortableTh.vue'
import { PencilIcon, TrashIcon } from '@heroicons/vue/24/solid'

const props = defineProps<{
  users: User[]
  sortBy?: string | null
  sortDir?: 'asc' | 'desc'
}>()

const authStore = useAuthStore()

const emit = defineEmits(['edit', 'delete', 'sort'])

const showDeleteModal = ref(false)
const userToDelete = ref<string | null>(null)

const isAuthorized = (userId: string) => {
  return !!(authStore.user?._id !== userId)
}

function deleteConfirmation(userId: string) {
  showDeleteModal.value = true
  userToDelete.value = userId
}

function closeDeletionModal() {
  emit('delete', userToDelete.value)
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

.admin-users-table .sticky-col {
  width: 1%;
  white-space: nowrap;
}

@media (max-width: $break-sm) {
  .admin-users-table .sticky-table {
    min-width: 0;
  }

  .admin-users-table .role-col {
    width: 1%;
    white-space: nowrap;
  }
}
</style>
