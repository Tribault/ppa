<template>
  <div class="new-admin-posters"><button @click="openNewPoster">Nouveau Poster</button></div>
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
        <poster-card
          v-for="p in store.posters"
          :columns="columns"
          :key="p._id"
          :poster="p"
          admin
          view="list"
          @updated="store.fetchPosters()"
          @edit="openEditPoster"
        />
      </tbody>
    </table>
  </div>
  <poster-edit
    :visible="showModal"
    :posterToEdit="editingPoster"
    @close="closeModal"
    @saved="store.fetchPosters"
  />
</template>

<script setup lang="ts">
import { usePosterStore } from '@/stores/posters'
import { ref, onMounted } from 'vue'
import PosterCard from '@/components/cards/PosterCard.vue'
import PosterEdit from '@/components/edition/PosterEdit.vue'

const store = usePosterStore()

const columns = ref([
  { key: 'title', label: 'Titre' },
  { key: 'availableStock', label: 'Stock disponible' },
  { key: 'note', label: 'Commentaire' },
  { key: 'total', label: 'Prix total', manual: true },
])

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
  store.fetchPosters()
})
</script>

<style scoped>
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
