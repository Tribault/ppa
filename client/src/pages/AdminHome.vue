<script setup lang="ts">
import { ref } from 'vue'
import AdminPosters from './admin/Posters.vue'
import AdminBookings from './admin/Bookings.vue'
import AdminSales from './admin/Sales.vue'

const currentTab = ref<'posters' | 'bookings' | 'sales'>('posters')
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Page d'administration</h1>

    <nav class="mb-4 flex gap-4">
      <button
        @click="currentTab = 'posters'"
        :class="{ 'font-bold underline': currentTab === 'posters' }"
      >
        Posters
      </button>
      <button
        @click="currentTab = 'bookings'"
        :class="{ 'font-bold underline': currentTab === 'bookings' }"
      >
        Réservations
      </button>
      <button
        @click="currentTab = 'sales'"
        :class="{ 'font-bold underline': currentTab === 'sales' }"
      >
        Ventes
      </button>
    </nav>

    <div>
      <AdminPosters v-if="currentTab === 'posters'" />
      <AdminBookings v-else-if="currentTab === 'bookings'" />
      <AdminSales v-else-if="currentTab === 'sales'" />
    </div>
  </div>
</template>

<style scoped>
button {
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
}
</style>
