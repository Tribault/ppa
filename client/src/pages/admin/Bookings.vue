<template>
  <div class="admin-tab">
  <div class="admin-bookings-header">
    <div class="admin-bookings-header--search">
      <MagnifyingGlassIcon class="icon" />
      <input type="text" placeholder="Chercher réservation..." @input="onSearchInput" />
    </div>
    <div class="admin-bookings-header--filter">
      <button
        v-for="l in letters"
        :class="{ active: bookingStore.selectedLetter === l }"
        class="btn"
        :key="l"
        @click="bookingStore.selectedLetter = bookingStore.selectedLetter == null ? l : null"
      >
        {{ l }}
      </button>
    </div>
    <div class="admin-bookings-header--actions">
      <button class="btn-red-bg" @click="showMessageModal = true">
        <ChatBubbleOvalLeftEllipsisIcon /> Message d'accueil
      </button>
      <button class="btn-red-bg" @click="openNewBooking">
        <NewspaperIcon /> Nouvelle réservation
      </button>
      <button class="btn-red-bg" @click="toggleBookings">
        <span v-if="isBookingAllowed"><BellSlashIcon />Bloquer les réservations</span>
        <span v-else><BellAlertIcon />Autoriser les réservations</span>
      </button>
    </div>
  </div>

  <div class="admin-table-wrapper">
    <admin-booking-table
      :bookings="bookingStore.filteredBookings"
      @edit="(p) => openEditBooking(p)"
      @delete="(p) => deleteBooking(p)"
    />
  </div>
  <pagination :page="bookingStore.page" :pages="bookingStore.pages" @change="loadPage" />
  <booking-edit
    :visible="showModal"
    :bookingToEdit="editingBooking"
    @close="closeModal"
    @saved="bookingStore.fetchBookings({ all: true }, { page: 1, limit: 20, q: activeQuery() })"
  />
  <message-edit :visible="showMessageModal" @close="showMessageModal = false" />
  </div>
</template>

<script setup lang="ts">
import { useBookingStore } from '@/stores/bookings'
import { useMessageStore } from '@/stores/messages'
import { ref, computed, onMounted, watch } from 'vue'
import { Alphabet } from '@/types/models'
import AdminBookingTable from '@/components/tables/BookingTable.vue'
import BookingEdit from '@/components/edition/BookingEdit.vue'
import MessageEdit from '@/components/edition/MessageEdit.vue'
import Pagination from '@/components/utils/Pagination.vue'

import {
  MagnifyingGlassIcon,
  NewspaperIcon,
  BellSlashIcon,
  BellAlertIcon,
  ChatBubbleOvalLeftEllipsisIcon,
} from '@heroicons/vue/24/solid'

const bookingStore = useBookingStore()
const messageStore = useMessageStore()

const letters = Object.values(Alphabet)

const showModal = ref(false)
const showMessageModal = ref(false)
const isBookingAllowed = computed(() => messageStore.message?.bookingAllowed ?? true)

const editingBooking = ref(null)

const openNewBooking = () => {
  editingBooking.value = null
  showModal.value = true
}

const openEditBooking = (poster: any) => {
  editingBooking.value = poster
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

function activeQuery() {
  if (bookingStore.selectedLetter) return `^${bookingStore.selectedLetter}`
  if (bookingStore.searchQuery) return bookingStore.searchQuery
  return undefined
}

function loadPage(p: number) {
  bookingStore.fetchBookings({ all: true }, { page: p, limit: 20, q: activeQuery() })
}

onMounted(async () => {
  bookingStore.fetchBookings({ all: true }, { page: 1, limit: 20 })
  await messageStore.fetchMessage()
})

function onSearchInput(e: Event) {
  bookingStore.setSearchQuery((e.target as HTMLInputElement).value)
}

function deleteBooking(bookingId: string) {
  bookingStore.deleteBooking(bookingId)
}

function toggleBookings() {
  messageStore.toggleBooking()
}

watch(() => bookingStore.selectedLetter, (letter) => {
  bookingStore.fetchBookings({ all: true }, { page: 1, limit: 20, q: letter ? `^${letter}` : undefined })
})

watch(() => bookingStore.searchQuery, (q) => {
  bookingStore.fetchBookings({ all: true }, { page: 1, limit: 20, q: q || undefined })
})
</script>

<style scoped lang="scss">
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

.admin-bookings-header {
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
    grid-template-columns: 0.5fr 3fr auto;
  }
  svg {
    margin-right: 0.5rem;
  }

  &--search {
    display: flex;
    align-items: center;
    > input {
      margin-left: $space-sm;
      height: 30px;
    }
    svg {
      color: white;
    }
  }

  &--actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;

    button span {
      display: inline-flex;
      align-items: center;
    }
  }

  &--filter {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    font-weight: 500;
    color: white;

    button.active {
      border: solid 1px;
      background-color: white;
      color: $red;
    }
  }
}

.new-admin-bookings {
  text-align: end;
}
.container-home {
  padding: 0 1rem;
}

.header-home {
  display: flex;
  justify-content: space-between;
}
.view-toggle {
  margin-bottom: 1rem;
  display: flex;
  gap: 1rem;
}
.view-toggle button {
  padding: 0.5rem 1rem;
  border: 1px solid #aaa;
  background: white;
  cursor: pointer;
}
.view-toggle button.active {
  background-color: #007bff;
  color: white;
}

.icon {
  width: 24px;
  height: 24px;
  color: #333;
}

.view-toggle button.active .icon {
  color: white;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.grid-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.list-container {
  display: flex;
  flex-direction: column;
}

.bookings-form {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
  border: solid 1px black;
  padding: 4em 2em;
}
</style>
