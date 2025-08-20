<template>
  <div class="admin-posters-header">
       <div class="home-search">
        <MagnifyingGlassIcon class="icon" />
        <input type="text" placeholder="Search posters..." @input="onSearchInput" />
      </div>
      <div class="home-filter">
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
      <button class="btn-red-bg"
        @click="openNewPoster"
      >
        <NewspaperIcon/> Nouveau Poster
      </button>
      <button class="btn-red-bg"
        @click="openNewPoster"
      >
        <TagIcon/>Etiquettes
      </button>
    </div>
  
  <admin-poster-table :posters="posterStore.posters"/>
  <poster-edit
    :visible="showModal"
    :posterToEdit="editingPoster"
    @close="closeModal"
    @saved="posterStore.fetchPosters"
  />
</template>

<script setup lang="ts">
import { usePosterStore } from '@/stores/posters'
import { ref, onMounted } from 'vue'
import { Alphabet } from '@/types/models'
import AdminPosterTable from '@/components/AdminPosterTable.vue'
import PosterEdit from '@/components/edition/PosterEdit.vue'
import { MagnifyingGlassIcon, TagIcon, NewspaperIcon} from '@heroicons/vue/24/solid'

const posterStore = usePosterStore()

const letters = Object.values(Alphabet)

const showModal = ref(false)
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

onMounted(async () => {
  posterStore.fetchPosters()
})

function onSearchInput(e: Event) {
  posterStore.setSearchQuery((e.target as HTMLInputElement).value)
}
</script>

<style scoped lang="scss">

.admin-posters-header{
background-color: $red;
    display:grid;
    width:100%;
   
    gap: 0.5rem;
    justify-content: end;
    padding: 0.5rem 1rem;
    > * {
    font-weight: 700;
   
  }
  svg{
    margin-right: 0.5rem;
  }
}

.home-search {
  display: flex;
  align-items: center;
  > input {
    margin-left: $space-sm;
    height: 30px;
  }
}

.home-filter {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  font-weight: 500;

  button.active {
    border: solid 1px;
    background-color: $red;
    color: white;
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
