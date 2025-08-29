<template>
  <tr class="border-t">
    <td v-for="column in columns" :key="column.key">
      {{ renderCell(column) }}
    </td>
  </tr>
</template>

<script setup lang="ts">
import type { Sale } from '@/types/models'
import { ref } from 'vue'

const props = defineProps<{
  sale: Sale
  columns: { key: string; label: string; manual?: boolean }[]
}>()
const emit = defineEmits(['edit', 'validate', 'updated', 'revert'])

function resolve(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => acc?.[part], obj)
}

function renderCell(column: { key: string; manual?: boolean }) {
  if (!column.manual) {
    return resolve(props.sale, column.key)
  }

  switch (column.key) {
    case 'total':
      return (props.sale.quantity * props.sale.priceAtSale).toFixed(2)
    default:
      return '—'
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
