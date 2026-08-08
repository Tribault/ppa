<template>
  <nav class="pagination">
    <template v-if="page > 1">
      <button @click="$emit('change', 1)">
        <chevron-double-left-icon class="icon" />
      </button>
      <button @click="$emit('change', page - 1)">
        <chevron-left-icon class="icon" />
      </button>
    </template>

    <button
      v-for="p in pagesToShow"
      :key="p"
      :disabled="p === '...'"
      :class="{ active: p === page }"
      class="pagination-pages"
      @click="p !== '...' && $emit('change', p as number)"
    >
      {{ p }}
    </button>

    <!-- Next & Last -->
    <template v-if="page < pages">
      <button @click="$emit('change', page + 1)">
        <chevron-right-icon class="icon" />
      </button>
      <button @click="$emit('change', pages)">
        <chevron-double-right-icon class="icon" />
      </button>
    </template>
  </nav>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import {
  ChevronDoubleLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/vue/24/outline'

const props = defineProps<{
  page: number
  pages: number
}>()

defineEmits<{ change: [number] }>()

const pagesToShow = computed(() => {
  const delta = 2
  const range: (number | string)[] = []
  const left = Math.max(2, props.page - delta)
  const right = Math.min(props.pages - 1, props.page + delta)

  range.push(1)
  if (left > 2) range.push('...')

  for (let i = left; i <= right; i++) {
    range.push(i)
  }

  if (right < props.pages - 1) range.push('...')
  if (props.pages > 1) range.push(props.pages)

  return range
})
</script>
<style lang="scss" scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  background: $darker-red;
  max-height: 70px;
  padding: 0.5rem;

  &-pages {
    font-weight: 500;
    font-size: 1.5rem;
    padding: 0 1rem;
  }
}

button {
  background: none;
  color: inherit;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  outline: inherit;
}

.active {
  text-decoration: underline;
  font-weight: 700;
}
</style>
