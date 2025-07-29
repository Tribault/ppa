<template>
  <h2>Admin Panel</h2>
  <router-link to="/admin/new">New Poster</router-link>
  <div v-for="p in posters" :key="p._id">
    <p>{{ p.title }}</p>
    <router-link :to="`/admin/edit/${p._id}`">Modifier</router-link>
    <button @click="deletePoster(p._id)">Supprimer</button>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios'
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import type { Poster } from '../../types/models'

const auth = useAuthStore()
const posters = ref<Poster[]>([])

const fetchPosters = async () => {
  const res = await axios.get('http://localhost:5000/api/posters')
  posters.value = res.data
}

onMounted(fetchPosters)

const deletePoster = async (id: string) => {
  await axios.delete(`http://localhost:5000/api/posters/${id}`, {
    headers: { Authorization: `Bearer ${auth.token}` },
  })
  fetchPosters()
}
</script>
