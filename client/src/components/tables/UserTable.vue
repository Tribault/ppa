<template>
  <div class="table-container admin-users-table">
    <table class="sticky-table">
      <thead>
        <tr>
          <th class="sticky-col">E-mail</th>
          <th>Identifiant</th>
          <th>Role</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in users">
          <th scope="row" class="sticky-col">{{ u.email }}</th>
          <td>{{ u.username }}</td>
          <td>{{ u.role }}</td>
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
    message="Supprimer l'utilisateur."
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
import { PencilIcon, TrashIcon } from '@heroicons/vue/24/solid'

const props = defineProps<{
  users: User[]
}>()

const authStore = useAuthStore()

const emit = defineEmits(['edit', 'delete'])

const showDeleteModal = ref(false)
const userToDelete = ref<string | null>(null)

const isAuthorized = ((userId: string)=>{
  return !!(authStore.user?._id !== userId)
})

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
.admin-users-table {
  &--actions > * {
    cursor: pointer;
  }
}
</style>
