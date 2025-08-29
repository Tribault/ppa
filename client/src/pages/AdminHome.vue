<template>
  <div class="admin-home">
    <div class="admin-home-header">
      <h1>Administration</h1>
      <nav class="admin-home-header--nav">
        <button
          class="btn-white-bg"
          @click="currentTab = 'posters'"
          :class="{ 'selected-btn': currentTab === 'posters' }"
        >
          <PhotoIcon /> Affiches
        </button>
        <button
          class="btn-white-bg"
          @click="currentTab = 'bookings'"
          :class="{ 'selected-btn': currentTab === 'bookings' }"
        >
          <FaceSmileIcon />Réservations
        </button>
        <button
          class="btn-white-bg"
          @click="currentTab = 'sales'"
          :class="{ 'selected-btn': currentTab === 'sales' }"
        >
          <DocumentCurrencyEuroIcon />Ventes
        </button>
        <button
          class="btn-white-bg"
          @click="currentTab = 'users'"
          :class="{ 'selected-btn': currentTab === 'users' }"
        >
          <UserGroupIcon />Utilisateurs
        </button>
      </nav>
    </div>

    <div>
      <posters v-if="currentTab === 'posters'" />
      <bookings v-else-if="currentTab === 'bookings'" />
      <sales v-else-if="currentTab === 'sales'" />
      <users v-else-if="currentTab === 'users'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Posters from './admin/Posters.vue'
import Bookings from './admin/Bookings.vue'
import Sales from './admin/Sales.vue'
import Users from './admin/Users.vue'
import {
  PhotoIcon,
  FaceSmileIcon,
  DocumentCurrencyEuroIcon,
  UserGroupIcon,
} from '@heroicons/vue/24/solid'

const currentTab = ref<'posters' | 'bookings' | 'sales' | 'users'>('posters')
</script>

<style scoped lang="scss">
.admin-home-header {
  display: flex;
  align-items: center;
  padding: 1rem;
  color: $red;
  gap: 1rem;

  &--nav {
    display: grid;
    width: 100%;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0.2rem;
    > * {
      font-weight: 700;
    }
    svg {
      margin-right: 0.5rem;
    }
  }

  @media screen and (max-width: $break-sm) {
    flex-direction: column;
  }
}

.selected-btn {
  background-color: $red; /* light gray background */
  color: white;
  svg {
    color: white; /* darker gray on hover */
  }
}
</style>
