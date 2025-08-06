<template>
   <div key="list" class="list-container">
    <table class="min-w-full table-auto border">
      <thead class="bg-gray-100">
        <tr>
          <th v-for="column in columns" :key="column.key" class="px-4 py-2 text-left">
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody>
    <sale-card 
    v-for="s in saleStore.sales"
    :key="s._id"
    :columns="columns"
    :sale="s"
    />
  </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSaleStore } from '@/stores/sales'
import SaleCard from '@/components/cards/SaleCard.vue'

const saleStore = useSaleStore()

const columns = ref([
  { key: 'poster.title', label: 'Poster vendu' },
  { key: 'user.email', label: 'Acheteur' },
  { key: 'priceAtSale', label: 'Prix unitaire'},
  { key: 'quantity', label: 'Quantité' },
  { key: 'total', label: 'Prix total', manual: true },
  {key : 'validatedAt', label:'Date de vente'},

])


onMounted(()=>{
  saleStore.fetchSales()
})

</script>
