<template>
  <div v-if="view === 'grid'" class="card-grid">
        <img :src="`http://localhost:5000/uploads/${poster.image}`" alt=""/>
        <div>
          <h3>{{ poster.title }}</h3>
          <p>{{ poster.description }}</p>
          <p v-if="poster.isBooked">Réservé</p>
          <button v-else-if="!poster.isBooked && canBook" @click="bookPoster">Réserver</button>
        </div>
  </div>
  <div v-else class="card-list">
    <div>{{ poster.title }} </div>
    <div>{{ poster.description }} </div>
    <div>
      <p v-if="poster.isBooked">Réservé</p>
      <button v-else-if="!poster.isBooked && canBook" @click="bookPoster">Réserver</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios'
import type {Poster} from '../types/models'
import {useAuthStore} from '../stores/auth'
import {computed} from 'vue'

const props = defineProps<{
    poster: Poster
    view: 'grid' | 'list'
}>()

const auth = useAuthStore()
const canBook = computed(() => auth.user?.role === 'user');

const bookPoster = async () => 
{
    await axios.post(`http://localhost:5000/api/posters/${props.poster._id}/book`, null, {
    headers: { Authorization: `Bearer ${auth.token}` }
    })
    window.location.reload()

}
</script>

<style scoped>
.card-grid {
  width: 200px;
  border: 1px solid #ccc;
  padding: 0.5rem;
  border-radius: 6px;
  text-align: center;
}
.card-list {
  display: flex;
  gap: 1rem;
  border-bottom: 1px solid #ccc;
  padding: 1rem 0;
  justify-content: space-between;
  
}
.card-list img {
  width: 100px;
  height: auto;
}
</style>