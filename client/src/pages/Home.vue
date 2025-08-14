<template>
  <div class="home-container">
    <div class="home-header">
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
      <div class="home-view-toggle">
        <button @click="view = 'grid'" :class="{ active: view === 'grid' }" title="Grid View">
          <Squares2X2Icon class="icon" />
        </button>
        <button @click="view = 'list'" :class="{ active: view === 'list' }" title="List View">
          <ListBulletIcon class="icon" />
        </button>
      </div>
    </div>
    <div class="home-error" v-if="loading">
        <Spinner/>
    </div>
    <div class="home-error" v-else-if="posterStore.filteredPosters.length == 0 && !loading"> 
      <img src="@/assets/404.svg"><p>Aucune affiche ne correspond à votre recherche. 😭</p>
    </div>

    <div v-else>
    <transition name="fade" mode="out-in">
      
      <div v-if="view === 'grid'" key="grid" class="grid-container">
        <home-poster-card
          v-for="p in posterStore.filteredPosters"
          :key="p._id"
          :poster="p"
          :view="view"
          @details="posterDetails(p._id)"
        />
       
      </div>

      <div v-else key="list" class="list-container">
        <home-poster-card
          v-for="p in posterStore.filteredPosters"
          :key="p._id"
          :poster="p"
          :view="view"
          @details="posterDetails(p._id)"
        />
      </div>
    </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePosterStore } from '@/stores/posters'
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Squares2X2Icon, ListBulletIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import { Alphabet } from '@/types/models'
import HomePosterCard from '@/components/cards/HomePosterCard.vue'
import Spinner from '@/components/Spinner.vue'

const router = useRouter()

const posterStore = usePosterStore()
const letters = Object.values(Alphabet)
const loading = ref(true)

const view = ref<'grid' | 'list'>((localStorage.getItem('posterView') as 'grid' | 'list') || 'grid')

const columns = ref([
  { key: 'title', label: 'Titre' },
  { key: 'availableStock', label: 'Stock disponible' },
  { key: 'note', label: 'Commentaire' },
  { key: 'total', label: 'Prix total', manual: true },
])

function onSearchInput(e: Event) {
  posterStore.setSearchQuery((e.target as HTMLInputElement).value)
}

function posterDetails(posterId: string) {
  router.push({ name: 'posters', params: { id: posterId } })
}

onMounted(async () => {
  await posterStore.fetchPosters()
  loading.value = false
})

watch(view, (newView) => {
  localStorage.setItem('posterView', newView)
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
  padding: $space-sm;
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

.home-error{
  display: flex;
  flex-direction: column;
  width:100%;
  align-items: center;
  font-size: $font-size-lg;
  img{
    max-width: 500px;
    width:100%;
     object-fit: cover;
  }
}

.home-view-toggle {
  align-items: center;
  display: flex;
  gap: 1rem;

  button {
    padding: 0.5rem 1rem;
    border: 1px solid #aaa;
    background: white;
    cursor: pointer;
  }

  button.active {
    background-color: $red;
    text-decoration: underline;
    .icon {
      color: white;
    }
  }
}

.icon {
  width: 24px;
  height: 24px;
  color: $red;
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
  align-items: start;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  padding: 1rem;
  border-radius: 15px;
}

.list-container {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

@media screen and (max-width: $break-sm) {
  .home-header {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .home-filter {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
