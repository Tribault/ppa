<template>
  <div class="admin-home">
    <div class="admin-home-header">
      <h1>Administration</h1>
      <nav class="admin-home-header--nav">
      <button class="btn-white-bg"
        @click="currentTab = 'posters'"
        :class="{ 'selected-btn': currentTab === 'posters' }"
      >
        <PhotoIcon/> Affiches
      </button>
      <button class="btn-white-bg"
        @click="currentTab = 'bookings'"
        :class="{ 'selected-btn': currentTab === 'bookings' }"
      >
        <FaceSmileIcon/>Réservations
      </button>
      <button class="btn-white-bg"
        @click="currentTab = 'sales'"
        :class="{ 'selected-btn': currentTab === 'sales' }"
      >
        <DocumentCurrencyEuroIcon/>Ventes
      </button>
      <button class="btn-white-bg"
        @click="currentTab = 'sales'"
        :class="{ 'selected-btn': currentTab === 'sales' }"
      >
        <UserGroupIcon/>Utilisateurs
      </button>
    </nav>
    </div>

    <div>
      <AdminPosters v-if="currentTab === 'posters'" />
      <AdminBookings v-else-if="currentTab === 'bookings'" />
      <AdminSales v-else-if="currentTab === 'sales'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AdminPosters from './admin/Posters.vue'
import AdminBookings from './admin/Bookings.vue'
import AdminSales from './admin/Sales.vue'
import { PhotoIcon, FaceSmileIcon, DocumentCurrencyEuroIcon, UserGroupIcon} from '@heroicons/vue/24/solid'

const currentTab = ref<'posters' | 'bookings' | 'sales'>('posters')
</script>

<style scoped lang="scss">

.admin-home-header{
  display: flex;
  align-items: center;
  padding: 1rem;
  color: $red;
  gap: 1rem;

  &--nav{
    display:grid;
    width:100%;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    > * {
    margin-right: 1rem;
  }
  svg{
    margin-right: 0.5rem;
  }
  }

  @media screen and (max-width: $break-sm) {
    flex-direction: column;
  }
}

.selected-btn{
   background-color: $red; /* light gray background */
    color:white;
    svg {
      color: white; /* darker gray on hover */
    }
}

</style>
