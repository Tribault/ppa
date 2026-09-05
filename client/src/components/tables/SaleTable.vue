<template>
  <div class="table-container admin-booking-table">
    <table class="sticky-table">
      <thead>
        <tr>
          <sortable-th field="posterTitle" :sort-by="sortBy" :sort-dir="sortDir" sticky-col @sort="$emit('sort', $event)">
            {{ $t('table.sale.poster') }}
          </sortable-th>
          <sortable-th field="buyerEmail" :sort-by="sortBy" :sort-dir="sortDir" @sort="$emit('sort', $event)">
            {{ $t('table.sale.buyer') }}
          </sortable-th>
          <sortable-th field="unitPrice" :sort-by="sortBy" :sort-dir="sortDir" @sort="$emit('sort', $event)">
            {{ $t('table.sale.unitPrice') }}
          </sortable-th>
          <sortable-th field="quantity" :sort-by="sortBy" :sort-dir="sortDir" @sort="$emit('sort', $event)">
            {{ $t('table.sale.quantity') }}
          </sortable-th>
          <sortable-th field="totalPrice" :sort-by="sortBy" :sort-dir="sortDir" @sort="$emit('sort', $event)">
            {{ $t('table.sale.totalPrice') }}
          </sortable-th>
          <sortable-th field="soldBy" :sort-by="sortBy" :sort-dir="sortDir" @sort="$emit('sort', $event)">
            {{ $t('table.sale.soldBy') }}
          </sortable-th>
          <sortable-th field="validatedAt" :sort-by="sortBy" :sort-dir="sortDir" @sort="$emit('sort', $event)">
            {{ $t('table.sale.date') }}
          </sortable-th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="s in sales">
          <th scope="row" class="sticky-col">{{ s.poster.title }}</th>
          <td>{{ s.user.email }}</td>
          <td>{{ s.priceAtSale }} €</td>
          <td>{{ s.quantity }}</td>
          <td>{{ s.quantity * s.priceAtSale }} €</td>
          <td>{{ s.validatedBy.email }}</td>
          <td>{{ new Date(s.validatedAt).toLocaleString() }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { Sale } from '@/types/models'
import SortableTh from '@/components/tables/SortableTh.vue'

const props = defineProps<{
  sales: Sale[]
  sortBy?: string | null
  sortDir?: 'asc' | 'desc'
}>()

defineEmits(['sort'])
</script>
<style lang="scss" scoped>
.admin-booking-table {
  &--actions > * {
    cursor: pointer;
  }
}
</style>
