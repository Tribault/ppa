<template>
    <div class="header-home">
        <h2>Affiches de film</h2> 
        <div class="view-toggle">
         <button @click="view = 'grid'" :class="{ active: view === 'grid' }" title="Grid View">
        <Squares2X2Icon class="icon" />
      </button>
      <button @click="view = 'list'" :class="{ active: view === 'list' }" title="List View">
        <ListBulletIcon class="icon" />
      </button>
    </div></div>
   
    <transition name="fade" mode="out-in">
  <div
    v-if="view === 'grid'"
    key="grid"
    class="grid-container"
  >
    <PosterCard v-for="p in posters" :key="p._id" :poster="p" :view="view" />
  </div>

  <div
    v-else
    key="list"
    class="list-container"
  >
    <PosterCard v-for="p in posters" :key="p._id" :poster="p" :view="view" />
  </div>
</transition>

</template>

<script setup lang="ts">
import axios from 'axios'
import {ref, onMounted, watch} from 'vue'
import { Squares2X2Icon, ListBulletIcon } from '@heroicons/vue/24/outline'
import type {Poster} from '../types/models'
import PosterCard from '../components/PosterCard.vue'

const posters = ref<Poster[]>([])
const view = ref<'grid' | 'list'>(localStorage.getItem('posterView') as 'grid' | 'list' || 'grid');

onMounted(async() => {
    const res = await axios.get('http://localhost:5000/api/posters')
    posters.value = res.data
})

watch(view, (newView) => {
  localStorage.setItem('posterView', newView);
});

</script>

<style scoped>

.header-home{
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

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
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
</style>