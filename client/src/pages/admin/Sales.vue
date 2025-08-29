<template>
  <div class="admin-sales-header">
      <div class="admin-sales-header--filter">
        <div>
    <span>
      <input type="date" class="btn-red-bg" v-model="saleStore.filters.startDate" @change="applyFilters" />
    </span>
    <span>
      <b>-</b>
      <input type="date" class="btn-red-bg" v-model="saleStore.filters.endDate" @change="applyFilters" />
    </span>
    </div>
    <button class="btn-red-bg"  @click="resetFilters">Réinitialiser</button>
  </div>
   <div class="admin-sales-header--actions">
      <button class="btn-red-bg" @click="saleStore.exportSalesCSV()">
        <span><folder-arrow-down-icon />Télécharger les ventes</span>
      </button>
    </div>
    </div>
   
   <admin-sale-table
    :sales="saleStore.sales"
  />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useSaleStore } from '@/stores/sales'
import AdminSaleTable from '@/components/tables/SaleTable.vue'
import { FolderArrowDownIcon } from '@heroicons/vue/24/solid'

const saleStore = useSaleStore()

async function applyFilters() {
  await saleStore.fetchSales()
}

async function resetFilters() {
  saleStore.resetFilters()
  await saleStore.fetchSales()
}

onMounted(() => {
  saleStore.fetchSales()
})


</script>
<style lang="scss" scoped>
.admin-sales-header {
  background-color: $red;
  display: grid;
  width: 100%;
  grid-template-columns: 1fr;
  gap: 0.5rem;

  padding: 0.5rem 1rem;
  > * {
    font-weight: 700;
  }

  @media screen and (min-width: $break-md) {
    grid-template-columns: 1fr auto;
  }
  svg {
    margin-right: 0.5rem;
  }

  &--actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;

    button span {
      display: inline-flex;
      align-items: center;
    }
  }

  &--filter {
    display: grid;
    grid-template-columns: 1fr;
     gap: 0.5rem;
    align-items: center;
    justify-items: center;
    font-weight: 500;
    color: white;

    b{
      padding: 0 0.5rem;
    }

    button.active {
      border: solid 1px;
      background-color: white;
      color: $red;
    }

    @media screen and (min-width: $break-md) {
    grid-template-columns: 350px 125px ;

  }
  }
}
</style>
