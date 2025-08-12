<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="posterStore.poster == null">oups</div>
  <div v-else>
    {{ posterStore.poster.title }}
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { usePosterStore } from '@/stores/posters'
import PosterCard from '@/components/cards/PosterCard.vue'

const posterStore = usePosterStore()
const route = useRoute()
const loading = ref(true)

onMounted(async () => {
  await posterStore.fetchPoster(route.params.id)
  loading.value = false
})
</script>
