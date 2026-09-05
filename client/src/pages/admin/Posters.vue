<template>
  <div class="admin-tab">
  <div class="admin-posters-header">
    <div class="admin-posters-header--search">
      <MagnifyingGlassIcon class="icon" />
      <input type="text" placeholder="Chercher affiche..." @input="onSearchInput" />
    </div>
    <div class="admin-posters-header--filter">
      <button
        v-for="l in letters"
        :class="{ active: posterStore.selectedLetter === l }"
        class="btn"
        :key="l"
        @click="posterStore.selectedLetter = posterStore.selectedLetter == null ? l : null"
      >
        {{ l }}
      </button>
    </div>
    <div class="admin-posters-header--actions">
      <button class="btn-red-bg" @click="openNewPoster"><NewspaperIcon /> Nouveau Poster</button>
      <button class="btn-red-bg" @click="showTagModal = true"><TagIcon />Etiquettes</button>
      <button class="btn-red-bg" @click="showLocationModal = true"><MapPinIcon />Localisations</button>
    </div>
  </div>

  <div class="admin-table-wrapper">
    <admin-poster-table
      :posters="posterStore.filteredPosters"
      :sort-by="sortBy"
      :sort-dir="sortDir"
      @sort="handleSort"
      @edit="(p) => openEditPoster(p)"
      @delete="(p) => deletePoster(p)"
    />
  </div>
  <pagination :page="posterStore.page" :pages="posterStore.pages" @change="loadPage" />
  <poster-edit
    :visible="showModal"
    :posterToEdit="editingPoster"
    @close="closeModal"
    @saved="fetchList(1)"
  />
  <tag-edit :visible="showTagModal" @close="closeTagModal" />
  <location-edit :visible="showLocationModal" @close="closeLocationModal" />
  </div>
</template>

<script setup lang="ts">
import { usePosterStore } from '@/stores/posters'
import { ref, onMounted, watch } from 'vue'
import { Alphabet } from '@/types/models'
import type { Poster } from '@/types/models'
import AdminPosterTable from '@/components/tables/PosterTable.vue'
import PosterEdit from '@/components/edition/PosterEdit.vue'
import TagEdit from '@/components/edition/TagEdit.vue'
import LocationEdit from '@/components/edition/LocationEdit.vue'
import Pagination from '@/components/utils/Pagination.vue'

import { MagnifyingGlassIcon, TagIcon, MapPinIcon, NewspaperIcon } from '@heroicons/vue/24/solid'

const posterStore = usePosterStore()

const letters = Object.values(Alphabet)

const showModal = ref(false)
const showTagModal = ref(false)
const showLocationModal = ref(false)

const editingPoster = ref(null)

const openNewPoster = () => {
  editingPoster.value = null
  showModal.value = true
}

const openEditPoster = (poster: any) => {
  editingPoster.value = poster
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const closeTagModal = () => {
  showTagModal.value = false
}

const closeLocationModal = () => {
  showLocationModal.value = false
}

function activeQuery() {
  if (posterStore.selectedLetter) return `^${posterStore.selectedLetter}`
  if (posterStore.searchQuery) return posterStore.searchQuery
  return undefined
}

const sortBy = ref<string | null>(null)
const sortDir = ref<'asc' | 'desc'>('asc')

function fetchList(page = posterStore.page) {
  return posterStore.fetchPosters({
    page,
    limit: 20,
    q: activeQuery(),
    sortBy: sortBy.value || undefined,
    sortDir: sortDir.value,
  })
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

function loadPage(p: number) {
  fetchList(p)
}

onMounted(async () => {
  fetchList(1)
})

function onSearchInput(e: Event) {
  posterStore.setSearchQuery((e.target as HTMLInputElement).value)
}

watch(() => posterStore.selectedLetter, () => {
  fetchList(1)
})

watch(() => posterStore.searchQuery, () => {
  fetchList(1)
})

function deletePoster(poster: Poster) {
  posterStore.deletePoster(poster._id)
}
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

.admin-posters-header {
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

.new-admin-posters {
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

.poster-form {
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
