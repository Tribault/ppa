<template>
  <div class="table-container admin-poster-table">
    <table class="sticky-table">
      <thead>
        <tr>
          <sortable-th field="title" :sort-by="sortBy" :sort-dir="sortDir" sticky-col @sort="$emit('sort', $event)">
            {{ $t('table.poster.title') }}
          </sortable-th>
          <sortable-th field="size" :sort-by="sortBy" :sort-dir="sortDir" @sort="$emit('sort', $event)">
            {{ $t('table.poster.size') }}
          </sortable-th>
          <sortable-th field="price" :sort-by="sortBy" :sort-dir="sortDir" @sort="$emit('sort', $event)">
            {{ $t('table.poster.price') }}
          </sortable-th>
          <sortable-th field="totalStock" :sort-by="sortBy" :sort-dir="sortDir" @sort="$emit('sort', $event)">
            {{ $t('table.poster.stock') }}
          </sortable-th>
          <th>{{ $t('table.poster.tags') }}</th>
          <th>{{ $t('table.poster.locations') }}</th>
          <sortable-th field="forSale" :sort-by="sortBy" :sort-dir="sortDir" @sort="$emit('sort', $event)">
            {{ $t('table.poster.forSale') }}
          </sortable-th>
          <sortable-th field="createdAt" :sort-by="sortBy" :sort-dir="sortDir" @sort="$emit('sort', $event)">
            {{ $t('table.poster.createdAt') }}
          </sortable-th>
          <th>{{ $t('table.poster.actions') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in posters">
          <th scope="row" class="sticky-col">{{ p.title }}</th>
          <td>{{ p.size }}</td>
          <td>{{ p.price }}€</td>
          <td>{{ p.totalStock }}</td>
          <td>{{ p.tags.map((t) => t.name).join(', ') }}</td>
          <td>{{ (p.locations ?? []).map((l) => l.name).join(', ') }}</td>
          <td>{{ p.forSale ? $t('form.poster.yes') : $t('form.poster.no') }}</td>
          <td>{{ p.createdAt ? new Date(p.createdAt).toLocaleString() : '—' }}</td>
          <td class="admin-poster-table--actions">
            <eye-icon v-if="p.image" class="icon" @click="viewImage(p.image)" />
            <pencil-icon class="icon" @click="$emit('edit', p)" />
            <trash-icon class="icon" @click="deleteConfirmation(p)" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <confirm-modal
    :message="$t('table.poster.deleteConfirm')"
    :visible="showDeleteModal"
    @cancel="showDeleteModal = false"
    @confirm="closeDeletionModal"
  />
</template>

<script setup lang="ts">
import type { Poster } from '@/types/models'
import { ref } from 'vue'
import ConfirmModal from '@/components/utils/ConfirmModal.vue'
import SortableTh from '@/components/tables/SortableTh.vue'
import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/solid'

const props = defineProps<{
  posters: Poster[]
  sortBy?: string | null
  sortDir?: 'asc' | 'desc'
}>()

const emit = defineEmits(['edit', 'delete', 'sort'])

const showDeleteModal = ref(false)
const posterToDelete = ref<Poster | null>(null)

function viewImage(image: string) {
  window.open(import.meta.env.VITE_IMG_URL + image, '_blank')
}

function deleteConfirmation(poster: Poster) {
  showDeleteModal.value = true
  posterToDelete.value = poster
}

function closeDeletionModal() {
  emit('delete', posterToDelete.value)
  showDeleteModal.value = false
}
</script>
<style lang="scss" scoped>
.admin-poster-table {
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
