<template>
  <th
    :class="['sortable-th', { 'sticky-col': stickyCol, active: sortBy === field }]"
    @click="$emit('sort', field)"
  >
    <span class="sortable-th-label">
      <slot />
      <span v-if="sortBy === field" class="sortable-th-arrow">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
    </span>
  </th>
</template>

<script setup lang="ts">
defineProps<{
  field: string
  sortBy?: string | null
  sortDir?: 'asc' | 'desc'
  stickyCol?: boolean
}>()

defineEmits<{ sort: [field: string] }>()
</script>

<style scoped lang="scss">
.sortable-th {
  cursor: pointer;
  user-select: none;

  &:hover .sortable-th-label {
    text-decoration: underline;
  }
}

.sortable-th-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.sortable-th-arrow {
  font-size: 0.7em;
}
</style>
