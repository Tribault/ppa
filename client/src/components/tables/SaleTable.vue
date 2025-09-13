<template>
  <div class="table-container admin-booking-table">
    <table class="sticky-table">
      <thead>
        <tr>
          <th class="sticky-col">Affiche</th>
          <th>Acheteur</th>
          <th>Prix unitaire</th>
          <th>Quantité</th>
          <th>Prix Total</th>
          <th>Vente par</th>
          <th>Date</th>
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

const props = defineProps<{
  sales: Sale[]
}>()
</script>
<style lang="scss" scoped>
.admin-booking-table {
  &--actions > * {
    cursor: pointer;
  }
}
</style>
