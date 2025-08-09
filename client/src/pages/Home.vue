<template>
  <div class="home-container">
    <div class="home-header">
      <h2>Affiches de film</h2>
      <div class="home-filter">
        <button v-for="l in letters"
        :class="{ active: selectedLetter === l }"
        class="btn" 
        :key="l"
        @click="selectedLetter = (selectedLetter == null ? l : null)">{{l}}</button>
      </div>
      <div class="view-toggle">
        <button @click="view = 'grid'" :class="{ active: view === 'grid' }" title="Grid View">
          <Squares2X2Icon class="icon" />
        </button>
        <button @click="view = 'list'" :class="{ active: view === 'list' }" title="List View">
          <ListBulletIcon class="icon" />
        </button>
      </div>
    </div>

    <transition name="fade" mode="out-in">
      <div v-if="view === 'grid'" key="grid" class="grid-container">
        <PosterCard v-for="p in filteredPosters" :columns="columns" :key="p._id" :poster="p" :view="view" />
      </div>

      <div v-else key="list" class="list-container">
        <table class="min-w-full table-auto border">
          <thead class="bg-gray-100">
            <tr>
              <th v-for="column in columns" :key="column.key" class="px-4 py-2 text-left">
                {{ column.label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <PosterCard
              v-for="p in filteredPosters"
              :columns="columns"
              :key="p._id"
              :poster="p"
              :view="view"
            />
          </tbody>
        </table>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { usePosterStore } from '@/stores/posters'
import { ref, onMounted, watch, computed } from 'vue'
import { Squares2X2Icon, ListBulletIcon } from '@heroicons/vue/24/outline'
import {Alphabet} from '@/types/models'
import PosterCard from '@/components/cards/PosterCard.vue'

const posterStore = usePosterStore()
const letters = Object.values(Alphabet);

const view = ref<'grid' | 'list'>((localStorage.getItem('posterView') as 'grid' | 'list') || 'grid')

const columns = ref([
  { key: 'title', label: 'Titre' },
  { key: 'availableStock', label: 'Stock disponible' },
  { key: 'note', label: 'Commentaire' },
  { key: 'total', label: 'Prix total', manual: true },
])

const selectedLetter = ref<Alphabet | null>(null);


onMounted(async () => {
  const res = await posterStore.fetchPosters()
})

watch(view, (newView) => {
  localStorage.setItem('posterView', newView)
})

const filteredPosters = computed(()=> {
  if (!selectedLetter.value) return posterStore.posters
  return posterStore.posters.filter((p)=> p.title[0] === selectedLetter.value)
})

</script>

<style lang="scss" scoped>
.home-container {
  padding: 0 1rem;
}

.home-header {
  display: flex;
  justify-content: space-between;
  background-color: whitesmoke;
  color: $red;
}

.home-filter{
  display:flex;
  align-items: center;
font-weight: 500;
button.active{
  border: solid 1px;
  background-color: $red;
  color: white;
}
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
  background-color: $red;
  text-decoration: underline;
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
  display: grid;
  align-items: center;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.list-container {
  display: flex;
  flex-direction: column;
}

@media screen and (max-width:$break-sm) {
  .home-header {
  display: flex;
  flex-direction: column;
  align-items: center;
}
  .home-filter { flex-wrap: wrap;  justify-content: center; }
}
</style>
