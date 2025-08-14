<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="posterStore.poster == null" class="poster-details-error"><img src="@/assets/404.svg"><p>Poster introuvable 😭</p></div>
  <div v-else class="poster-details-container">
    <poster-details-card :poster="posterStore.poster" />
    <poster-details-edition />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { usePosterStore } from '@/stores/posters'
import PosterDetailsCard from '@/components/cards/PosterDetailsCard.vue'

const posterStore = usePosterStore()
const route = useRoute()
const loading = ref(true)

onMounted(async () => {
  await posterStore.fetchPoster(route.params.id)
  loading.value = false
})
</script>

<style lang="scss" scoped>

.poster-details-error{
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

</style>
