<template>
  <div class="admin-tab">
  <div class="admin-sales-header">
    <div class="admin-sales-header--filter">
      <div>
        <span>
          <input
            type="date"
            class="btn-red-bg"
            v-model="saleStore.filters.startDate"
            @change="applyFilters"
          />
        </span>
        <span>
          <b>-</b>
          <input
            type="date"
            class="btn-red-bg"
            v-model="saleStore.filters.endDate"
            @change="applyFilters"
          />
        </span>
      </div>
      <button class="btn-red-bg" @click="resetFilters">Réinitialiser</button>
    </div>
    <div class="admin-sales-header--actions">
      <button class="btn-red-bg" @click="saleStore.exportSalesCSV()">
        <span><folder-arrow-down-icon />Télécharger les ventes</span>
      </button>
    </div>
  </div>

  <div class="admin-table-wrapper">
    <admin-sale-table :sales="saleStore.sales" :sort-by="sortBy" :sort-dir="sortDir" @sort="handleSort" />
  </div>
  <pagination :page="saleStore.page" :pages="saleStore.pages" @change="loadPage" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useSaleStore } from '@/stores/sales'
import AdminSaleTable from '@/components/tables/SaleTable.vue'
import Pagination from '@/components/utils/Pagination.vue'

import { FolderArrowDownIcon } from '@heroicons/vue/24/solid'

const saleStore = useSaleStore()

const sortBy = ref<string | null>(null)
const sortDir = ref<'asc' | 'desc'>('asc')

function fetchList(page = saleStore.page) {
  return saleStore.fetchSales({ page, limit: 20, sortBy: sortBy.value || undefined, sortDir: sortDir.value })
}

function handleSort(field: string) {
  if (sortBy.value === field) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortDir.value = 'asc'
  }
  fetchList(1)
}

async function applyFilters() {
  await fetchList(1)
}

async function resetFilters() {
  saleStore.resetFilters()
  await fetchList(1)
}

function loadPage(p: number) {
  fetchList(p)
}

onMounted(() => {
  fetchList(1)
})
</script>
<style lang="scss" scoped>
.admin-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.admin-table-wrapper {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

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

    b {
      padding: 0 0.5rem;
    }

    button.active {
      border: solid 1px;
      background-color: white;
      color: $red;
    }

    @media screen and (min-width: $break-md) {
      grid-template-columns: 350px 125px;
    }
  }
}
</style>
